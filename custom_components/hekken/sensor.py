"""Sensoren: wanneer het hekken vanzelf sluit, welke regel loopt, wat er laatst gebeurde."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import R_NAME
from .controller import GateController
from .entity import HekkenEntity


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    ctrl: GateController = entry.runtime_data
    async_add_entities([AutoCloseSensor(ctrl), ActiveRuleSensor(ctrl), LastActionSensor(ctrl)])


class AutoCloseSensor(HekkenEntity, SensorEntity):
    _attr_translation_key = "auto_close_at"
    _attr_device_class = SensorDeviceClass.TIMESTAMP
    _attr_icon = "mdi:timer-outline"

    def __init__(self, ctrl: GateController) -> None:
        super().__init__(ctrl, "auto_close_at")

    @property
    def native_value(self) -> datetime | None:
        return self.ctrl.auto_close_at


class ActiveRuleSensor(HekkenEntity, SensorEntity):
    _attr_translation_key = "active_rule"
    _attr_icon = "mdi:calendar-check"

    def __init__(self, ctrl: GateController) -> None:
        super().__init__(ctrl, "active_rule")

    @property
    def native_value(self) -> str:
        names = [r[R_NAME] for r in self.ctrl.active_rules()]
        return ", ".join(names) if names else "Geen"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {"automatisch": self.ctrl.auto_enabled, "iemand_thuis": self.ctrl.anyone_home()}


class LastActionSensor(HekkenEntity, SensorEntity):
    _attr_translation_key = "last_action"
    _attr_icon = "mdi:history"

    def __init__(self, ctrl: GateController) -> None:
        super().__init__(ctrl, "last_action")

    @property
    def native_value(self) -> str | None:
        return self.ctrl.last_action[:255] if self.ctrl.last_action else None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {"tijdstip": self.ctrl.last_action_at}
