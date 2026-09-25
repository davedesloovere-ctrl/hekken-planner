"""Knop om een storing te wissen nadat je het hekken hebt nagekeken."""

from __future__ import annotations

from homeassistant.components.button import ButtonEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .controller import GateController
from .entity import HekkenEntity


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    async_add_entities([ResetFaultButton(entry.runtime_data)])


class ResetFaultButton(HekkenEntity, ButtonEntity):
    _attr_translation_key = "reset_fault"
    _attr_icon = "mdi:restart-alert"

    def __init__(self, ctrl: GateController) -> None:
        super().__init__(ctrl, "reset_fault")

    async def async_press(self) -> None:
        self.ctrl.clear_fault()
