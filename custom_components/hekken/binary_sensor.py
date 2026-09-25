"""Storing: aan zodra het hekken niet reageerde. Blijft staan na een herstart."""

from __future__ import annotations

from typing import Any

from homeassistant.components.binary_sensor import BinarySensorDeviceClass, BinarySensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.restore_state import RestoreEntity
from homeassistant.util import dt as dt_util

from .controller import GateController
from .entity import HekkenEntity


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    async_add_entities([FaultSensor(entry.runtime_data)])


class FaultSensor(HekkenEntity, BinarySensorEntity, RestoreEntity):
    _attr_translation_key = "fault"
    _attr_device_class = BinarySensorDeviceClass.PROBLEM

    def __init__(self, ctrl: GateController) -> None:
        super().__init__(ctrl, "fault")

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        # Een storing mag niet verdwijnen door Home Assistant te herstarten.
        last = await self.async_get_last_state()
        if last is not None and last.state == "on" and not self.ctrl.fault:
            since = last.attributes.get("sinds")
            self.ctrl.set_fault(
                last.attributes.get("reden") or "Storing van voor de herstart",
                dt_util.parse_datetime(since) if isinstance(since, str) else None,
            )

    @property
    def is_on(self) -> bool:
        return self.ctrl.fault is not None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {
            "reden": self.ctrl.fault,
            "sinds": self.ctrl.fault_since.isoformat() if self.ctrl.fault_since else None,
        }
