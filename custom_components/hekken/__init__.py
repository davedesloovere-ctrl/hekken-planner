"""Hekkenplanner: een hekken met één wisselpuls sturen op tijdsregels."""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant

from .controller import GateController

PLATFORMS = [
    Platform.BINARY_SENSOR,
    Platform.BUTTON,
    Platform.COVER,
    Platform.SENSOR,
    Platform.SWITCH,
]

type HekkenConfigEntry = ConfigEntry[GateController]


async def async_setup_entry(hass: HomeAssistant, entry: HekkenConfigEntry) -> bool:
    ctrl = GateController(hass, entry)
    entry.runtime_data = ctrl
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    await ctrl.async_start()
    entry.async_on_unload(ctrl.async_stop)
    entry.async_on_unload(entry.add_update_listener(_async_reload))
    return True


async def async_unload_entry(hass: HomeAssistant, entry: HekkenConfigEntry) -> bool:
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


async def _async_reload(hass: HomeAssistant, entry: HekkenConfigEntry) -> None:
    await hass.config_entries.async_reload(entry.entry_id)
