"""Kleine client voor de UniFi Access Developer API (poort 12445 op je console)."""

from __future__ import annotations

import asyncio
from typing import Any
from urllib.parse import urlsplit

import aiohttp

from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession

DEFAULT_PORT = 12445


class UnifiAccessError(Exception):
    """UniFi Access is niet bereikbaar of gaf een fout."""


class UnifiAccessAuthError(UnifiAccessError):
    """Het API-token klopt niet of heeft te weinig rechten."""


class UnifiAccessCertError(UnifiAccessError):
    """Het certificaat van de console wordt niet vertrouwd."""


def api_base(host: str) -> str:
    """'192.168.1.1' of 'https://unifi.local' naar de basis-URL van de API."""
    host = host.strip().rstrip("/")
    if "://" not in host:
        host = f"https://{host}"
    parts = urlsplit(host)
    netloc = parts.netloc if parts.port else f"{parts.hostname}:{DEFAULT_PORT}"
    return f"{parts.scheme}://{netloc}/api/v1/developer"


class UnifiAccessClient:
    def __init__(self, hass: HomeAssistant, host: str, token: str, verify_ssl: bool) -> None:
        self._session = async_get_clientsession(hass, verify_ssl=verify_ssl)
        self._base = api_base(host)
        self._headers = {"Authorization": f"Bearer {token}", "Accept": "application/json"}

    async def _request(self, method: str, path: str) -> Any:
        try:
            async with asyncio.timeout(10):
                async with self._session.request(
                    method, f"{self._base}{path}", headers=self._headers
                ) as resp:
                    if resp.status in (401, 403):
                        raise UnifiAccessAuthError(f"token geweigerd (HTTP {resp.status})")
                    payload = await resp.json(content_type=None)
                    status = resp.status
        except UnifiAccessError:
            raise
        except (aiohttp.ClientConnectorCertificateError, aiohttp.ClientSSLError) as err:
            raise UnifiAccessCertError(f"certificaat niet vertrouwd: {err}") from err
        except (aiohttp.ClientError, TimeoutError, ValueError) as err:
            raise UnifiAccessError(f"UniFi Access niet bereikbaar: {err}") from err

        if not isinstance(payload, dict):
            raise UnifiAccessError(f"onverwacht antwoord (HTTP {status})")
        code = str(payload.get("code", ""))
        if status >= 400 or code != "SUCCESS":
            message = payload.get("msg") or code or f"HTTP {status}"
            if "AUTH" in code.upper() or "TOKEN" in code.upper():
                raise UnifiAccessAuthError(message)
            raise UnifiAccessError(message)
        return payload.get("data")

    async def async_get_doors(self) -> list[dict[str, Any]]:
        data = await self._request("GET", "/doors") or []
        return [
            {
                "id": door["id"],
                "name": door.get("full_name") or door.get("name") or door["id"],
            }
            for door in data
            if isinstance(door, dict) and door.get("id")
        ]

    async def async_unlock(self, door_id: str) -> None:
        """Ontgrendel de deur op afstand: voor je hekken is dat één puls."""
        await self._request("PUT", f"/doors/{door_id}/unlock")
