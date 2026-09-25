"""Websocket-opdrachten voor de Hekken-pagina in de zijbalk.

Live toestand leest de pagina rechtstreeks uit de entiteiten; hier zit enkel
het ophalen en bewaren van regels en instellingen.
"""

from __future__ import annotations

from typing import Any
from uuid import uuid4

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.config_entries import ConfigEntry, ConfigEntryState
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import device_registry as dr, entity_registry as er

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
    DOMAIN,
    R_ID,
    RELAY_UNIFI,
    VERSION,
)
from .rules import normalize_rule, normalize_settings


@callback
def async_register(hass: HomeAssistant) -> None:
    websocket_api.async_register_command(hass, ws_list)
    websocket_api.async_register_command(hass, ws_save_rules)
    websocket_api.async_register_command(hass, ws_save_settings)


def _loaded_entries(hass: HomeAssistant) -> list[ConfigEntry]:
    return [
        e for e in hass.config_entries.async_entries(DOMAIN) if e.state is ConfigEntryState.LOADED
    ]


def _entry_payload(hass: HomeAssistant, entry: ConfigEntry) -> dict[str, Any]:
    reg = er.async_get(hass)
    device = dr.async_get(hass).async_get_device(identifiers={(DOMAIN, entry.entry_id)})
    # Hernoem je het apparaat in Home Assistant ("Poort"), dan tonen pagina en kaart die naam.
    name = (device.name_by_user or device.name) if device else entry.title
    ctrl = entry.runtime_data
    cfg = {**entry.data, **entry.options}

    def eid(platform: str, key: str) -> str | None:
        return reg.async_get_entity_id(platform, DOMAIN, f"{entry.entry_id}_{key}")

    if ctrl.relay_type == RELAY_UNIFI:
        # Het token gaat nooit naar de browser.
        connection = {"type": "unifi", "door": ctrl.door_name, "host": ctrl.unifi_host}
    else:
        connection = {"type": "entity", "entity_id": cfg.get(CONF_RELAY)}

    rules = list(entry.options.get(CONF_RULES, []))
    return {
        "entry_id": entry.entry_id,
        "title": name or entry.title,
        "connection": connection,
        "settings": {
            "sensor_entity": cfg.get(CONF_SENSOR),
            "sensor_inverted": bool(cfg.get(CONF_SENSOR_INVERTED, False)),
            "travel_time": int(cfg.get(CONF_TRAVEL_TIME, DEFAULT_TRAVEL_TIME)),
            "retries": int(cfg.get(CONF_RETRIES, DEFAULT_RETRIES)),
            "retry_delay": float(cfg.get(CONF_RETRY_DELAY, DEFAULT_RETRY_DELAY)),
            "presence_entities": list(cfg.get(CONF_PRESENCE) or []),
            "notify_service": cfg.get(CONF_NOTIFY) or "",
        },
        "rules": rules,
        "entities": {
            "cover": eid("cover", "cover"),
            "fault": eid("binary_sensor", "fault"),
            "reset": eid("button", "reset_fault"),
            "automatic": eid("switch", "automatic"),
            "auto_close_at": eid("sensor", "auto_close_at"),
            "active_rule": eid("sensor", "active_rule"),
            "last_action": eid("sensor", "last_action"),
            "rules": {r[R_ID]: eid("switch", f"rule_{r[R_ID]}") for r in rules},
        },
    }


def _get_entry(hass: HomeAssistant, connection, msg) -> ConfigEntry | None:
    entry = hass.config_entries.async_get_entry(msg["entry_id"])
    if entry is None or entry.domain != DOMAIN:
        connection.send_error(msg["id"], "not_found", "Hekken niet gevonden")
        return None
    return entry


@websocket_api.websocket_command({vol.Required("type"): "hekken/list"})
@callback
def ws_list(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict) -> None:
    connection.send_result(
        msg["id"],
        {
            "version": VERSION,
            "is_admin": connection.user.is_admin,
            "entries": [_entry_payload(hass, e) for e in _loaded_entries(hass)],
        },
    )


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "hekken/save_rules",
        vol.Required("entry_id"): str,
        vol.Required("rules"): [dict],
    }
)
@callback
def ws_save_rules(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict) -> None:
    if (entry := _get_entry(hass, connection, msg)) is None:
        return
    try:
        rules = [normalize_rule(raw, uuid4().hex) for raw in msg["rules"]]
    except ValueError as err:
        connection.send_error(msg["id"], "invalid_format", str(err))
        return
    hass.config_entries.async_update_entry(entry, options={**entry.options, CONF_RULES: rules})
    connection.send_result(msg["id"], {"rules": rules})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "hekken/save_settings",
        vol.Required("entry_id"): str,
        vol.Required("settings"): dict,
    }
)
@callback
def ws_save_settings(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict) -> None:
    if (entry := _get_entry(hass, connection, msg)) is None:
        return
    try:
        settings = normalize_settings(msg["settings"])
    except ValueError as err:
        connection.send_error(msg["id"], "invalid_format", str(err))
        return
    hass.config_entries.async_update_entry(entry, options={**entry.options, **settings})
    connection.send_result(msg["id"], {"settings": settings})
