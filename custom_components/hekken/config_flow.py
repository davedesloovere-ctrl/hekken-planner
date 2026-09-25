"""Instellen via de interface: eerst het hekken koppelen, daarna regels beheren."""

from __future__ import annotations

from typing import Any
from uuid import uuid4

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry, ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.const import CONF_NAME
from homeassistant.core import callback
from homeassistant.helpers.selector import (
    BooleanSelector,
    EntitySelector,
    EntitySelectorConfig,
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
    SelectOptionDict,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
    TextSelector,
    TimeSelector,
)

from .const import (
    CONF_NOTIFY,
    CONF_PRESENCE,
    CONF_RELAY,
    CONF_RETRIES,
    CONF_RULES,
    CONF_SENSOR,
    CONF_SENSOR_INVERTED,
    CONF_TRAVEL_TIME,
    DAYS,
    DEFAULT_RETRIES,
    DEFAULT_TRAVEL_TIME,
    DOMAIN,
    PRESENCE_DOMAINS,
    R_AUTO_CLOSE,
    R_AUTO_CLOSE_MIN,
    R_CLOSE_AT_END,
    R_DAYS,
    R_END,
    R_ID,
    R_NAME,
    R_OPEN_AT_START,
    R_SKIP_HOME,
    R_START,
    RELAY_DOMAINS,
)
from .rules import describe

RULE_SELECT = "rule"


def _settings_schema(d: dict[str, Any]) -> dict:
    return {
        vol.Required(CONF_RELAY, description={"suggested_value": d.get(CONF_RELAY)}): EntitySelector(
            EntitySelectorConfig(domain=RELAY_DOMAINS)
        ),
        vol.Required(CONF_SENSOR, description={"suggested_value": d.get(CONF_SENSOR)}): EntitySelector(
            EntitySelectorConfig(domain="binary_sensor")
        ),
        vol.Required(CONF_SENSOR_INVERTED, default=d.get(CONF_SENSOR_INVERTED, False)): BooleanSelector(),
        vol.Required(CONF_TRAVEL_TIME, default=d.get(CONF_TRAVEL_TIME, DEFAULT_TRAVEL_TIME)): NumberSelector(
            NumberSelectorConfig(min=5, max=180, step=1, unit_of_measurement="s", mode=NumberSelectorMode.BOX)
        ),
        vol.Required(CONF_RETRIES, default=d.get(CONF_RETRIES, DEFAULT_RETRIES)): NumberSelector(
            NumberSelectorConfig(min=0, max=3, step=1, mode=NumberSelectorMode.SLIDER)
        ),
        vol.Optional(CONF_PRESENCE, description={"suggested_value": d.get(CONF_PRESENCE)}): EntitySelector(
            EntitySelectorConfig(domain=PRESENCE_DOMAINS, multiple=True)
        ),
        vol.Optional(CONF_NOTIFY, description={"suggested_value": d.get(CONF_NOTIFY)}): TextSelector(),
    }


def _clean_settings(user_input: dict[str, Any]) -> dict[str, Any]:
    # Een leeggemaakt optioneel veld komt niet terug; zet het expliciet leeg.
    out = dict(user_input)
    out[CONF_PRESENCE] = user_input.get(CONF_PRESENCE, [])
    out[CONF_NOTIFY] = user_input.get(CONF_NOTIFY, "")
    out[CONF_TRAVEL_TIME] = int(user_input[CONF_TRAVEL_TIME])
    out[CONF_RETRIES] = int(user_input[CONF_RETRIES])
    return out


def _rule_schema(r: dict[str, Any]) -> vol.Schema:
    return vol.Schema(
        {
            vol.Required(R_NAME, default=r.get(R_NAME, "")): TextSelector(),
            vol.Required(R_DAYS, default=r.get(R_DAYS, DAYS[:5])): SelectSelector(
                SelectSelectorConfig(
                    options=DAYS, multiple=True, mode=SelectSelectorMode.LIST, translation_key="days"
                )
            ),
            vol.Required(R_START, default=r.get(R_START, "08:00:00")): TimeSelector(),
            vol.Required(R_END, default=r.get(R_END, "17:00:00")): TimeSelector(),
            vol.Required(R_AUTO_CLOSE, default=r.get(R_AUTO_CLOSE, True)): BooleanSelector(),
            vol.Required(R_AUTO_CLOSE_MIN, default=r.get(R_AUTO_CLOSE_MIN, 15)): NumberSelector(
                NumberSelectorConfig(min=1, max=240, step=1, unit_of_measurement="min", mode=NumberSelectorMode.BOX)
            ),
            vol.Required(R_SKIP_HOME, default=r.get(R_SKIP_HOME, True)): BooleanSelector(),
            vol.Required(R_OPEN_AT_START, default=r.get(R_OPEN_AT_START, False)): BooleanSelector(),
            vol.Required(R_CLOSE_AT_END, default=r.get(R_CLOSE_AT_END, False)): BooleanSelector(),
        }
    )


def _validate_rule(user_input: dict[str, Any]) -> dict[str, str]:
    errors: dict[str, str] = {}
    if not user_input[R_NAME].strip():
        errors[R_NAME] = "no_name"
    if not user_input[R_DAYS]:
        errors[R_DAYS] = "no_days"
    if not (user_input[R_AUTO_CLOSE] or user_input[R_OPEN_AT_START] or user_input[R_CLOSE_AT_END]):
        errors["base"] = "no_action"
    return errors


def _example_rule() -> dict[str, Any]:
    return {
        R_ID: uuid4().hex,
        R_NAME: "Overdag",
        R_DAYS: DAYS[:5],
        R_START: "08:00:00",
        R_END: "17:00:00",
        R_AUTO_CLOSE: True,
        R_AUTO_CLOSE_MIN: 15,
        R_SKIP_HOME: True,
        R_OPEN_AT_START: False,
        R_CLOSE_AT_END: False,
    }


class HekkenConfigFlow(ConfigFlow, domain=DOMAIN):
    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            await self.async_set_unique_id(user_input[CONF_SENSOR])
            self._abort_if_unique_id_configured()
            title = user_input.pop(CONF_NAME)
            return self.async_create_entry(
                title=title,
                data=_clean_settings(user_input),
                options={CONF_RULES: [_example_rule()]},
            )

        schema = vol.Schema({vol.Required(CONF_NAME, default="Hekken"): TextSelector(), **_settings_schema({})})
        return self.async_show_form(step_id="user", data_schema=schema)

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        return HekkenOptionsFlow()


class HekkenOptionsFlow(OptionsFlow):
    def __init__(self) -> None:
        self._rule_id: str | None = None

    @property
    def _rules(self) -> list[dict[str, Any]]:
        return list(self.config_entry.options.get(CONF_RULES, []))

    def _save(self, **changes: Any) -> ConfigFlowResult:
        return self.async_create_entry(data={**self.config_entry.options, **changes})

    def _rule_options(self) -> list[SelectOptionDict]:
        return [SelectOptionDict(value=r[R_ID], label=f"{r[R_NAME]} ({describe(r)})") for r in self._rules]

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        rules = self._rules
        menu = ["add_rule"]
        if rules:
            menu += ["edit_rule", "delete_rule"]
        menu.append("settings")
        overview = "\n".join(f"- **{r[R_NAME]}**: {describe(r)}" for r in rules) or "_Nog geen regels._"
        return self.async_show_menu(
            step_id="init", menu_options=menu, description_placeholders={"rules": overview}
        )

    async def async_step_add_rule(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        self._rule_id = None
        return await self.async_step_rule()

    async def async_step_edit_rule(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            self._rule_id = user_input[RULE_SELECT]
            return await self.async_step_rule()
        schema = vol.Schema(
            {vol.Required(RULE_SELECT): SelectSelector(SelectSelectorConfig(options=self._rule_options()))}
        )
        return self.async_show_form(step_id="edit_rule", data_schema=schema)

    async def async_step_rule(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        rules = self._rules
        current = next((r for r in rules if r[R_ID] == self._rule_id), {})
        errors: dict[str, str] = {}

        if user_input is not None:
            errors = _validate_rule(user_input)
            if not errors:
                rule = {
                    **user_input,
                    R_ID: self._rule_id or uuid4().hex,
                    R_NAME: user_input[R_NAME].strip(),
                    R_DAYS: [d for d in DAYS if d in user_input[R_DAYS]],
                    R_AUTO_CLOSE_MIN: int(user_input[R_AUTO_CLOSE_MIN]),
                }
                if self._rule_id:
                    rules = [rule if r[R_ID] == self._rule_id else r for r in rules]
                else:
                    rules.append(rule)
                return self._save(**{CONF_RULES: rules})
            current = user_input

        return self.async_show_form(step_id="rule", data_schema=_rule_schema(current), errors=errors)

    async def async_step_delete_rule(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            remove = set(user_input.get(RULE_SELECT, []))
            return self._save(**{CONF_RULES: [r for r in self._rules if r[R_ID] not in remove]})
        schema = vol.Schema(
            {
                vol.Optional(RULE_SELECT): SelectSelector(
                    SelectSelectorConfig(
                        options=self._rule_options(), multiple=True, mode=SelectSelectorMode.LIST
                    )
                )
            }
        )
        return self.async_show_form(step_id="delete_rule", data_schema=schema)

    async def async_step_settings(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            return self._save(**_clean_settings(user_input))
        current = {**self.config_entry.data, **self.config_entry.options}
        return self.async_show_form(step_id="settings", data_schema=vol.Schema(_settings_schema(current)))
