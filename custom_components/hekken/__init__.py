"""Hekkenplanner: een hekken met één wisselpuls sturen op tijdsregels."""

from __future__ import annotations

import secrets

from homeassistant.components import webhook
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType

from . import panel, websocket
from .const import CONF_WEBHOOK_ID, DOMAIN
from .controller import GateController

PLATFORMS = [
    Platform.BINARY_SENSOR,
    Platform.BUTTON,
    Platform.COVER,
    Platform.SENSOR,
    Platform.SWITCH,
]

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

type HekkenConfigEntry = ConfigEntry[GateController]


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    websocket.async_register(hass)
    await panel.async_register(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: HekkenConfigEntry) -> bool:
    if CONF_WEBHOOK_ID not in entry.data:
        # Eigen, geheim webhook-adres voor de camera (UniFi Protect Alarm Manager).
        hass.config_entries.async_update_entry(
            entry, data={**entry.data, CONF_WEBHOOK_ID: secrets.token_hex(16)}
        )
    ctrl = GateController(hass, entry)
    entry.runtime_data = ctrl

    async def _handle_webhook(hass: HomeAssistant, webhook_id: str, request) -> None:
        ctrl.trigger_obstacle("camera")

    webhook.async_register(
        hass, DOMAIN, f"{entry.title} obstakel", entry.data[CONF_WEBHOOK_ID], _handle_webhook,
        local_only=True, allowed_methods=("GET", "POST", "PUT"),
    )
    entry.async_on_unload(lambda: webhook.async_unregister(hass, entry.data[CONF_WEBHOOK_ID]))
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    await ctrl.async_start()
    entry.async_on_unload(ctrl.async_stop)
    entry.async_on_unload(entry.add_update_listener(_async_reload))
    return True


async def async_unload_entry(hass: HomeAssistant, entry: HekkenConfigEntry) -> bool:
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


async def _async_reload(hass: HomeAssistant, entry: HekkenConfigEntry) -> None:
    await hass.config_entries.async_reload(entry.entry_id)
