"""Simulatie: de UniFi Access-koppeling tegen een nagebootste Access-API."""

import asyncio
from pathlib import Path
import sys
import tempfile
from types import SimpleNamespace

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from aiohttp import web

from homeassistant.core import HomeAssistant
from custom_components.hekken.controller import GateController
from custom_components.hekken.unifi_access import (
    UnifiAccessAuthError,
    UnifiAccessClient,
    UnifiAccessError,
)

TOKEN = "goed-token"


async def main():
    unlocks = []
    gate = {"open": False}
    hass = HomeAssistant(tempfile.mkdtemp())
    await hass.async_start()

    def auth_ok(request):
        return request.headers.get("Authorization") == f"Bearer {TOKEN}"

    async def doors(request):
        if not auth_ok(request):
            return web.json_response({"code": "CODE_UNAUTHORIZED", "msg": "unauthorized"}, status=401)
        return web.json_response({"code": "SUCCESS", "msg": "success", "data": [
            {"id": "d1", "name": "Poort", "full_name": "Thuis - Oprit poort", "door_position_status": "close"},
            {"id": "d2", "name": "Voordeur", "full_name": "Thuis - Voordeur"},
        ]})

    async def unlock(request):
        if not auth_ok(request):
            return web.json_response({"code": "CODE_UNAUTHORIZED"}, status=401)
        unlocks.append(request.match_info["id"])

        async def flip():
            await asyncio.sleep(0.3)
            gate["open"] = not gate["open"]
            hass.states.async_set("binary_sensor.strip", "on" if gate["open"] else "off")
        hass.async_create_task(flip())
        return web.json_response({"code": "SUCCESS", "msg": "success", "data": None})

    app = web.Application()
    app.router.add_get("/api/v1/developer/doors", doors)
    app.router.add_put("/api/v1/developer/doors/{id}/unlock", unlock)
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, "127.0.0.1", 0)
    await site.start()
    port = site._server.sockets[0].getsockname()[1]
    host = f"http://127.0.0.1:{port}"

    # 1. deuren ophalen
    client = UnifiAccessClient(hass, host, TOKEN, False)
    found = await client.async_get_doors()
    assert found == [{"id": "d1", "name": "Thuis - Oprit poort"}, {"id": "d2", "name": "Thuis - Voordeur"}], found
    # 2. fout token
    try:
        await UnifiAccessClient(hass, host, "fout", False).async_get_doors()
        raise AssertionError("fout token moet falen")
    except UnifiAccessAuthError:
        pass
    # 3. onbereikbaar
    try:
        await UnifiAccessClient(hass, "http://127.0.0.1:1", TOKEN, False).async_get_doors()
        raise AssertionError("moet onbereikbaar zijn")
    except UnifiAccessError:
        pass
    print("client ok")

    # 4. sturing via UniFi
    hass.states.async_set("binary_sensor.strip", "off")
    entry = SimpleNamespace(entry_id="e1", title="Hekken", data={
        "relay_type": "unifi", "unifi_host": host, "unifi_token": TOKEN, "unifi_verify_ssl": False,
        "unifi_door_id": "d1", "unifi_door_name": "Thuis - Oprit poort",
        "sensor_entity": "binary_sensor.strip", "travel_time": 1, "retries": 1, "retry_delay": 0.05,
        "presence_entities": [], "notify_service": ""}, options={"rules": []})
    c = GateController(hass, entry)
    await c.async_start()
    c.request(True, "test")
    await asyncio.sleep(1)
    assert gate["open"] and unlocks == ["d1"], (gate, unlocks)
    c.request(False, "test")
    await asyncio.sleep(1)
    assert not gate["open"] and unlocks == ["d1", "d1"], (gate, unlocks)
    print("sturen via UniFi ok")

    # 5. UniFi valt weg: twee mislukte pogingen, dan storing, geen crash
    await runner.cleanup()
    c.request(True, "test")
    # Twee pogingen: elk tot 10 s API-timeout plus looptijd + 10 s wachten.
    loop = asyncio.get_running_loop()
    start = loop.time()
    while not c.fault and loop.time() - start < 60:
        await asyncio.sleep(0.5)
    print(f"storing na {loop.time() - start:.0f} s")
    assert c.fault and "niet bereikbaar" in c.fault, c.fault
    print("storing bij onbereikbaar UniFi:", c.fault)

    c.async_stop()
    await hass.async_stop()
    print("ALLES OK")


if sys.platform == "win32":  # aiodns werkt op Windows enkel met de selector-lus
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
asyncio.run(main())
