"""De Hekken-pagina in de zijbalk."""

from __future__ import annotations

from pathlib import Path

from homeassistant.components import panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant

from .const import DOMAIN, VERSION

STATIC_URL = f"/{DOMAIN}_static"
PANEL_PATH = DOMAIN


async def async_register(hass: HomeAssistant) -> None:
    frontend_dir = Path(__file__).parent / "frontend"
    await hass.http.async_register_static_paths(
        [StaticPathConfig(STATIC_URL, str(frontend_dir), cache_headers=False)]
    )
    await panel_custom.async_register_panel(
        hass,
        frontend_url_path=PANEL_PATH,
        webcomponent_name="hekken-panel",
        sidebar_title="Hekken",
        sidebar_icon="mdi:gate",
        # Versie in de URL, zodat de browser na een update de nieuwe pagina laadt.
        module_url=f"{STATIC_URL}/hekken-panel.js?v={VERSION}",
        require_admin=False,
        config={},
    )
