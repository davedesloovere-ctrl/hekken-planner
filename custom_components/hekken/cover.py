"""Het hekken zelf, als poort-cover met open en dicht."""

from __future__ import annotations

from typing import Any

from homeassistant.components.cover import CoverDeviceClass, CoverEntity, CoverEntityFeature
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .controller import CLOSING, OPENING
from .entity import HekkenEntity


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    async_add_entities([HekkenCover(entry.runtime_data)])


class HekkenCover(HekkenEntity, CoverEntity):
    _attr_name = None
    _attr_device_class = CoverDeviceClass.GATE
    _attr_supported_features = CoverEntityFeature.OPEN | CoverEntityFeature.CLOSE

    def __init__(self, ctrl) -> None:
        super().__init__(ctrl, "cover")

    @property
    def available(self) -> bool:
        return self.ctrl.is_open is not None

    @property
    def is_closed(self) -> bool | None:
        is_open = self.ctrl.is_open
        return None if is_open is None else not is_open

    @property
    def is_opening(self) -> bool:
        return self.ctrl.motion == OPENING

    @property
    def is_closing(self) -> bool:
        return self.ctrl.motion == CLOSING

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {
            "automatisch_sluiten_om": self.ctrl.auto_close_at,
            "iemand_thuis": self.ctrl.anyone_home(),
            "storing": self.ctrl.fault,
        }

    async def async_open_cover(self, **kwargs: Any) -> None:
        self._check_fault()
        self.ctrl.request(True, "Handmatig geopend")

    async def async_close_cover(self, **kwargs: Any) -> None:
        self._check_fault()
        self.ctrl.request(False, "Handmatig gesloten")

    def _check_fault(self) -> None:
        if self.ctrl.fault:
            raise HomeAssistantError(
                f"{self.ctrl.entry.title} staat in storing ({self.ctrl.fault}). "
                "Kijk het hekken na en druk dan op 'Storing resetten'."
            )
