"""Schakelaars: de hoofdschakelaar 'Automatisch' en één per regel."""

from __future__ import annotations

from typing import Any

from homeassistant.components.switch import SwitchEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.restore_state import RestoreEntity

from .const import R_ID, R_NAME
from .controller import GateController
from .entity import HekkenEntity
from .rules import describe


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    ctrl: GateController = entry.runtime_data
    entities: list[SwitchEntity] = [AutomaticSwitch(ctrl)]
    entities += [RuleSwitch(ctrl, rule) for rule in ctrl.rules]
    async_add_entities(entities)


class AutomaticSwitch(HekkenEntity, SwitchEntity, RestoreEntity):
    """Alles wat vanzelf gebeurt in één keer aan of uit."""

    _attr_translation_key = "automatic"
    _attr_icon = "mdi:calendar-clock"

    def __init__(self, ctrl: GateController) -> None:
        super().__init__(ctrl, "automatic")

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        if (last := await self.async_get_last_state()) is not None:
            self.ctrl.set_auto_enabled(last.state == "on")

    @property
    def is_on(self) -> bool:
        return self.ctrl.auto_enabled

    async def async_turn_on(self, **kwargs: Any) -> None:
        self.ctrl.set_auto_enabled(True)

    async def async_turn_off(self, **kwargs: Any) -> None:
        self.ctrl.set_auto_enabled(False)


class RuleSwitch(HekkenEntity, SwitchEntity, RestoreEntity):
    """Eén regel tijdelijk uitzetten zonder hem te wissen."""

    _attr_entity_category = EntityCategory.CONFIG
    _attr_icon = "mdi:clock-outline"

    def __init__(self, ctrl: GateController, rule: dict) -> None:
        super().__init__(ctrl, f"rule_{rule[R_ID]}")
        self.rule = rule
        self._attr_name = f"Regel {rule[R_NAME]}"

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        if (last := await self.async_get_last_state()) is not None:
            self.ctrl.set_rule_enabled(self.rule[R_ID], last.state == "on")

    @property
    def is_on(self) -> bool:
        return self.ctrl.rule_enabled.get(self.rule[R_ID], True)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {"samenvatting": describe(self.rule)}

    async def async_turn_on(self, **kwargs: Any) -> None:
        self.ctrl.set_rule_enabled(self.rule[R_ID], True)

    async def async_turn_off(self, **kwargs: Any) -> None:
        self.ctrl.set_rule_enabled(self.rule[R_ID], False)
