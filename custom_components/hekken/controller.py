"""De logica: één puls-relais, één positiesensor, tijdsregels en auto-sluiten."""

from __future__ import annotations

import asyncio
from collections import deque
from collections.abc import Callable
from datetime import datetime, timedelta
import logging

from homeassistant.components import persistent_notification
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback
from homeassistant.helpers.event import (
    async_track_point_in_utc_time,
    async_track_state_change_event,
    async_track_time_change,
)
from homeassistant.util import dt as dt_util

from .const import (
    CONF_NOTIFY,
    CONF_PRESENCE,
    CONF_RELAY,
    CONF_RETRIES,
    CONF_RETRY_DELAY,
    CONF_RULES,
    CONF_SENSOR,
    CONF_SENSOR_INVERTED,
    CONF_TRAVEL_TIME,
    DEFAULT_RETRIES,
    DEFAULT_RETRY_DELAY,
    DEFAULT_TRAVEL_TIME,
    EVENT_FAILED,
    MAX_PULSES,
    MAX_PULSES_WINDOW,
    R_AUTO_CLOSE,
    R_AUTO_CLOSE_MIN,
    R_CLOSE_AT_END,
    R_ID,
    R_NAME,
    R_OPEN_AT_START,
    R_SKIP_HOME,
)
from .rules import rule_active

_LOGGER = logging.getLogger(__name__)

OPENING = "opening"
CLOSING = "closing"


class GateController:
    """Houdt de stand bij en stuurt het hekken met één wisselpuls."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        self.hass = hass
        self.entry = entry
        cfg = {**entry.data, **entry.options}
        self.relay: str = cfg[CONF_RELAY]
        self.sensor: str = cfg[CONF_SENSOR]
        self.inverted: bool = bool(cfg.get(CONF_SENSOR_INVERTED, False))
        self.travel_time: int = int(cfg.get(CONF_TRAVEL_TIME, DEFAULT_TRAVEL_TIME))
        self.retries: int = int(cfg.get(CONF_RETRIES, DEFAULT_RETRIES))
        self.retry_delay: float = float(cfg.get(CONF_RETRY_DELAY, DEFAULT_RETRY_DELAY))
        self.presence: list[str] = list(cfg.get(CONF_PRESENCE) or [])
        self.notify: str = (cfg.get(CONF_NOTIFY) or "").strip()
        self.rules: list[dict] = list(entry.options.get(CONF_RULES, []))

        self.auto_enabled = True
        self.rule_enabled: dict[str, bool] = {r[R_ID]: True for r in self.rules}
        self.motion: str | None = None
        self.auto_close_at: datetime | None = None
        self.last_action: str | None = None
        self.last_action_at: datetime | None = None
        # Storing: zolang dit gezet is, stuurt de planner geen enkele puls meer.
        self.fault: str | None = None
        self.fault_since: datetime | None = None

        self._pulse_times: deque[datetime] = deque()

        self._in_window: set[str] = set()
        self._last_change: datetime | None = None
        self._task: asyncio.Task | None = None
        self._auto_close_unsub: CALLBACK_TYPE | None = None
        self._unsubs: list[CALLBACK_TYPE] = []
        self._listeners: list[Callable[[], None]] = []

    # --- toestand -------------------------------------------------------

    @property
    def is_open(self) -> bool | None:
        state = self.hass.states.get(self.sensor)
        if state is None or state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
            return None
        return (state.state == "on") != self.inverted

    def anyone_home(self) -> bool:
        for entity_id in self.presence:
            state = self.hass.states.get(entity_id)
            if state is None:
                continue
            if state.state in ("home", "on"):
                return True
            if entity_id.startswith("zone."):
                try:
                    if int(state.state) > 0:
                        return True
                except ValueError:
                    pass
        return False

    def active_rules(self) -> list[dict]:
        now = dt_util.now()
        return [
            r for r in self.rules if self.rule_enabled.get(r[R_ID], True) and rule_active(r, now)
        ]

    # --- levenscyclus ---------------------------------------------------

    async def async_start(self) -> None:
        # Bij het opstarten nemen we de huidige vensters als vertrekpunt,
        # anders zou een herstart om 10u nog een "open bij start" afvuren.
        now = dt_util.now()
        self._in_window = {r[R_ID] for r in self.rules if rule_active(r, now)}
        self._unsubs.append(
            async_track_state_change_event(self.hass, [self.sensor], self._on_sensor)
        )
        if self.presence:
            self._unsubs.append(
                async_track_state_change_event(self.hass, self.presence, self._on_presence)
            )
        self._unsubs.append(async_track_time_change(self.hass, self._on_tick, second=0))
        self._update_auto_close()

    @callback
    def async_stop(self) -> None:
        for unsub in self._unsubs:
            unsub()
        self._unsubs.clear()
        self._cancel_auto_close()
        if self._task and not self._task.done():
            self._task.cancel()

    @callback
    def add_listener(self, cb: Callable[[], None]) -> CALLBACK_TYPE:
        self._listeners.append(cb)

        @callback
        def remove() -> None:
            self._listeners.remove(cb)

        return remove

    @callback
    def _notify_listeners(self) -> None:
        for cb in list(self._listeners):
            cb()

    # --- instellingen vanuit de schakelaars ------------------------------

    @callback
    def set_auto_enabled(self, value: bool) -> None:
        self.auto_enabled = value
        self._update_auto_close()
        self._notify_listeners()

    @callback
    def set_rule_enabled(self, rule_id: str, value: bool) -> None:
        self.rule_enabled[rule_id] = value
        self._update_auto_close()
        self._notify_listeners()

    # --- gebeurtenissen -------------------------------------------------

    @callback
    def _on_sensor(self, event: Event) -> None:
        self._last_change = dt_util.utcnow()
        self._update_auto_close()
        self._notify_listeners()

    @callback
    def _on_presence(self, event: Event) -> None:
        self._update_auto_close()
        self._notify_listeners()

    @callback
    def _on_tick(self, now: datetime) -> None:
        now = dt_util.as_local(now)
        current = {r[R_ID] for r in self.rules if rule_active(r, now)}
        started = current - self._in_window
        ended = self._in_window - current
        self._in_window = current

        if self.auto_enabled:
            by_id = {r[R_ID]: r for r in self.rules}
            # Eerst de eindes, dan de starts: loopt een sluitregel om 17u af en
            # opent een andere om 17u, dan wint het openen.
            for rule_id in ended:
                rule = by_id[rule_id]
                if not self.rule_enabled.get(rule_id, True) or not rule.get(R_CLOSE_AT_END):
                    continue
                if rule.get(R_SKIP_HOME) and self.anyone_home():
                    self._set_last_action(f"{rule[R_NAME]}: niet gesloten, iemand thuis")
                    continue
                self.request(False, f"{rule[R_NAME]}: einde venster")
            for rule_id in started:
                rule = by_id[rule_id]
                if self.rule_enabled.get(rule_id, True) and rule.get(R_OPEN_AT_START):
                    self.request(True, f"{rule[R_NAME]}: begin venster")

        self._update_auto_close()
        self._notify_listeners()

    # --- automatisch sluiten --------------------------------------------

    def _auto_close_minutes(self) -> float | None:
        if self.fault or not self.auto_enabled or self.is_open is not True or self.motion == CLOSING:
            return None
        home = self.anyone_home()
        minutes = [
            float(r.get(R_AUTO_CLOSE_MIN, 15))
            for r in self.active_rules()
            if r.get(R_AUTO_CLOSE) and not (r.get(R_SKIP_HOME) and home)
        ]
        return min(minutes) if minutes else None

    @callback
    def _update_auto_close(self) -> None:
        minutes = self._auto_close_minutes()
        if minutes is None:
            self._cancel_auto_close()
            return
        if self._auto_close_unsub is not None:
            return
        self.auto_close_at = dt_util.utcnow() + timedelta(minutes=minutes)
        self._auto_close_unsub = async_track_point_in_utc_time(
            self.hass, self._auto_close_fire, self.auto_close_at
        )

    @callback
    def _cancel_auto_close(self) -> None:
        if self._auto_close_unsub is not None:
            self._auto_close_unsub()
            self._auto_close_unsub = None
        self.auto_close_at = None

    @callback
    def _auto_close_fire(self, _now: datetime) -> None:
        self._auto_close_unsub = None
        self.auto_close_at = None
        if self._auto_close_minutes() is not None:
            names = ", ".join(r[R_NAME] for r in self.active_rules() if r.get(R_AUTO_CLOSE))
            self.request(False, f"{names}: automatisch sluiten")
        self._notify_listeners()

    # --- bewegen --------------------------------------------------------

    @callback
    def request(self, want_open: bool, reason: str) -> bool:
        """Vraag een stand. Een lopende opdracht wordt vervangen.

        Geeft False als de planner in storing staat; dan gebeurt er niets.
        """
        if self.fault:
            self._set_last_action(f"{reason}: niet uitgevoerd, hekken staat in storing")
            self._notify_listeners()
            return False
        if self._task and not self._task.done():
            self._task.cancel()
        self._set_last_action(reason)
        self._task = self.hass.async_create_background_task(
            self._move(want_open), f"{self.entry.entry_id}_move"
        )
        return True

    # --- storing --------------------------------------------------------

    @callback
    def set_fault(self, reason: str, since: datetime | None = None) -> None:
        """Zet de storing zonder melding, bv. bij het herstellen na een herstart."""
        self.fault = reason
        self.fault_since = since or dt_util.utcnow()
        if self._task and not self._task.done():
            self._task.cancel()
        self._cancel_auto_close()
        self._notify_listeners()

    @callback
    def clear_fault(self) -> None:
        if not self.fault:
            return
        self.fault = None
        self.fault_since = None
        self._pulse_times.clear()
        persistent_notification.async_dismiss(self.hass, f"{self.entry.entry_id}_failed")
        self._set_last_action("Storing gereset")
        self._update_auto_close()
        self._notify_listeners()

    async def _enter_fault(self, want_open: bool, why: str) -> None:
        word = "open" if want_open else "dicht"
        self.fault = f"Niet {word} gegaan: {why}"
        self.fault_since = dt_util.utcnow()
        self._cancel_auto_close()
        await self._alert(
            f"{self.entry.title} staat in storing: niet {word} gegaan, {why}. "
            "Er worden geen pulsen meer gestuurd tot je de storing reset.",
            wanted=word, reason=why,
        )

    def _too_many_pulses(self) -> bool:
        cutoff = dt_util.utcnow() - timedelta(seconds=MAX_PULSES_WINDOW)
        while self._pulse_times and self._pulse_times[0] < cutoff:
            self._pulse_times.popleft()
        return len(self._pulse_times) >= MAX_PULSES

    @callback
    def _set_last_action(self, text: str) -> None:
        self.last_action = text
        self.last_action_at = dt_util.utcnow()
        _LOGGER.debug("Hekken: %s", text)

    async def _move(self, want_open: bool) -> None:
        me = asyncio.current_task()
        self.motion = OPENING if want_open else CLOSING
        self._update_auto_close()
        self._notify_listeners()
        attempts = self.retries + 1
        try:
            for attempt in range(attempts):
                current = self.is_open
                if current is None:
                    # Geen storing: zonder sensor pulsen we gewoon niet.
                    await self._alert(
                        f"{self.entry.title}: de positiesensor is onbeschikbaar, er is niets gestuurd.",
                        wanted="open" if want_open else "dicht", reason="sensor onbeschikbaar",
                    )
                    return
                if current == want_open:
                    return
                await self._wait_until_settled()
                if self.is_open == want_open or self.fault:
                    return
                if self._too_many_pulses():
                    await self._enter_fault(
                        want_open,
                        f"al {MAX_PULSES} pulsen in {MAX_PULSES_WINDOW // 60} minuten",
                    )
                    return
                await self._pulse()
                # Tussen twee pogingen blijven we de sensor volgen: gaat het hekken
                # alsnog in de juiste stand, dan is er geen tweede puls nodig.
                last = attempt == attempts - 1
                timeout = self.travel_time + 10
                if not last:
                    timeout = max(timeout, self.retry_delay * 60)
                if await self._wait_for(want_open, timeout):
                    return
            await self._enter_fault(want_open, f"geen reactie na {attempts} poging(en)")
        finally:
            if self._task is me or self._task is None:
                self.motion = None
                self._update_auto_close()
                self._notify_listeners()

    async def _wait_until_settled(self) -> None:
        """Niet pulsen terwijl het hekken nog loopt, anders stopt of keert het."""
        if self.is_open is not True or self._last_change is None:
            return
        elapsed = (dt_util.utcnow() - self._last_change).total_seconds()
        if elapsed < self.travel_time:
            await asyncio.sleep(self.travel_time - elapsed)

    async def _pulse(self) -> None:
        self._pulse_times.append(dt_util.utcnow())
        domain = self.relay.split(".", 1)[0]
        target = {"entity_id": self.relay}
        if domain in ("button", "input_button"):
            await self.hass.services.async_call(domain, "press", target, blocking=True)
        elif domain == "switch":
            await self.hass.services.async_call("switch", "turn_on", target, blocking=True)
            await asyncio.sleep(1)
            await self.hass.services.async_call("switch", "turn_off", target, blocking=True)
        elif domain == "lock":
            await self.hass.services.async_call("lock", "unlock", target, blocking=True)
        elif domain == "script":
            await self.hass.services.async_call("script", "turn_on", target, blocking=True)
        else:
            raise ValueError(f"Relais {self.relay} wordt niet ondersteund")

    async def _wait_for(self, want_open: bool, timeout: float) -> bool:
        if self.is_open == want_open:
            return True
        done: asyncio.Future[bool] = self.hass.loop.create_future()

        @callback
        def _changed(_event: Event) -> None:
            if self.is_open == want_open and not done.done():
                done.set_result(True)

        unsub = async_track_state_change_event(self.hass, [self.sensor], _changed)
        try:
            async with asyncio.timeout(timeout):
                return await done
        except TimeoutError:
            return False
        finally:
            unsub()

    async def _alert(self, message: str, wanted: str, reason: str) -> None:
        self._set_last_action(message)
        _LOGGER.warning(message)
        persistent_notification.async_create(
            self.hass, message, title=self.entry.title,
            notification_id=f"{self.entry.entry_id}_failed",
        )
        self.hass.bus.async_fire(
            EVENT_FAILED,
            {"entry_id": self.entry.entry_id, "wanted": wanted, "reason": reason, "fault": bool(self.fault)},
        )
        if self.notify:
            domain, _, service = self.notify.partition(".")
            if not service:
                domain, service = "notify", domain
            try:
                await self.hass.services.async_call(
                    domain, service, {"title": self.entry.title, "message": message}
                )
            except Exception:  # noqa: BLE001 - een melding mag de sturing nooit breken
                _LOGGER.exception("Melding via %s mislukt", self.notify)
