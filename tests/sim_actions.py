"""Simulatie: acties bij het begin en einde van een venster."""

import asyncio
from datetime import datetime
from pathlib import Path
import sys
import tempfile
from types import SimpleNamespace

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util
from custom_components.hekken.controller import GateController


async def main():
    hass = HomeAssistant(tempfile.mkdtemp())
    await hass.async_start()
    pulses, gate = [], {"open": False}

    async def press(call):
        pulses.append(1)

        async def flip():
            await asyncio.sleep(0.2)
            gate["open"] = not gate["open"]
            hass.states.async_set("binary_sensor.strip", "on" if gate["open"] else "off")
        hass.async_create_task(flip())

    hass.services.async_register("button", "press", press)
    hass.states.async_set("binary_sensor.strip", "off")
    hass.states.async_set("person.dave", "not_home")
    every = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
    rules = [
        {"id": "a", "name": "Avond", "days": every, "start": "22:00:00", "end": "23:00:00",
         "auto_close": False, "start_action": "close", "end_action": "open", "skip_when_home": True},
        {"id": "b", "name": "Oud", "days": every, "start": "10:00:00", "end": "11:00:00",
         "auto_close": False, "open_at_start": True, "close_at_end": True, "skip_when_home": False},
    ]
    entry = SimpleNamespace(entry_id="e1", title="Poort", options={"rules": rules}, data={
        "relay_entity": "button.hek", "sensor_entity": "binary_sensor.strip", "travel_time": 1,
        "retries": 0, "retry_delay": 1, "presence_entities": ["person.dave"], "notify_service": ""})
    c = GateController(hass, entry)
    await c.async_start()
    at = lambda h, m=0: dt_util.as_utc(datetime(2026, 9, 25, h, m, tzinfo=dt_util.DEFAULT_TIME_ZONE))

    async def tick(h, m=0):
        c._on_tick(at(h, m))
        await asyncio.sleep(0.8)

    # oude regel: open bij begin, dicht bij einde
    c._in_window = set()
    await tick(10)
    assert gate["open"] and len(pulses) == 1, (gate, pulses)
    await tick(11)
    assert not gate["open"] and len(pulses) == 2
    # nieuwe regel: poort staat open, 'sluiten bij begin'
    c.request(True, "test"); await asyncio.sleep(0.8)
    await tick(22)
    assert not gate["open"], "sluiten bij begin"
    # 'openen bij einde'
    await tick(23)
    assert gate["open"], "openen bij einde"
    # iemand thuis: 'sluiten bij begin' slaat over
    hass.states.async_set("person.dave", "home")
    await tick(21, 59)  # buiten venster
    n = len(pulses)
    await tick(22)
    assert gate["open"] and len(pulses) == n, "niet sluiten als iemand thuis is"
    print("laatste actie:", c.last_action)
    c.async_stop()
    await hass.async_stop()
    print("ALLES OK")


asyncio.run(main())
