"""Gemeenschappelijke basis voor alle entiteiten van één hekken."""

from __future__ import annotations

from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity import Entity

from .const import DOMAIN
from .controller import GateController


class HekkenEntity(Entity):
    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(self, ctrl: GateController, key: str) -> None:
        self.ctrl = ctrl
        self._attr_unique_id = f"{ctrl.entry.entry_id}_{key}"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, ctrl.entry.entry_id)},
            name=ctrl.entry.title,
            manufacturer="Hekkenplanner",
            model="Hekken met wisselpuls",
        )

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        self.async_on_remove(self.ctrl.add_listener(self.async_write_ha_state))
