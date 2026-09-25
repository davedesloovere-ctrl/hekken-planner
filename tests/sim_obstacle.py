"""Simulatie: obstakeldetectie via camera-webhook (geen fotocel)."""

import asyncio
from pathlib import Path
import sys
import tempfile
from types import SimpleNamespace

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from homeassistant.core import HomeAssistant
from custom_components.hekken import controller as ctl
from custom_components.hekken.controller import GateController


async def main():
    hass = HomeAssistant(tempfile.mkdtemp())
    await hass.async_start()
    pulses, gate = [], {"open": False}
    travel = 2.0

    async def press(call):
        pulses.append(1)

        async def flip():
            # Sluiten duurt 'travel' seconden; de sensor ziet 'dicht' pas op het einde.
            await asyncio.sleep(0.2 if not gate["open"] else travel)
            gate["open"] = not gate["open"]
            hass.states.async_set("binary_sensor.strip", "on" if gate["open"] else "off")
        hass.async_create_task(flip())

    hass.services.async_register("button", "press", press)
    hass.states.async_set("binary_sensor.strip", "off")
    every = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
    rule = {"id": "r", "name": "Altijd", "days": every, "start": "00:00:00", "end": "00:00:00",
            "auto_close": True, "auto_close_minutes": 0.05, "skip_when_home": False}

    def make(stop):
        entry = SimpleNamespace(entry_id="e1", title="Poort", options={"rules": [rule]}, data={
            "relay_entity": "button.hek", "sensor_entity": "binary_sensor.strip", "travel_time": 1,
            "retries": 0, "retry_delay": 1, "presence_entities": [], "notify_service": "",
            "obstacle_hold": 10, "obstacle_stop": stop})
        return GateController(hass, entry)

    ctl.MAX_OBSTACLE_WAIT = 60
    c = make(stop=False)
    await c.async_start()

    # 1. open, camera ziet iemand: automatisch sluiten schuift op tot de zone vrij is
    c.request(True, "test"); await asyncio.sleep(0.6)
    assert gate["open"]
    c.trigger_obstacle("camera")
    first = c.auto_close_at
    assert c.obstacle_active and first is not None
    await asyncio.sleep(5)  # normaal zou hij na 3 s sluiten
    assert gate["open"] and len(pulses) == 1, "mag niet sluiten met beweging in de zone"
    print("uitgesteld tot", c.auto_close_at.strftime("%H:%M:%S"), "|", c.last_action)
    await asyncio.sleep(10 + 5 + travel + 2)
    assert not gate["open"] and len(pulses) == 2, "sluit na vrije zone"
    print("gesloten na vrije zone")

    # 2. handmatig sluiten terwijl er beweging is: wacht
    c.request(True, "test"); await asyncio.sleep(0.6)
    c._cancel_auto_close()
    c.trigger_obstacle("camera")
    c.request(False, "handmatig")
    await asyncio.sleep(3)
    assert gate["open"] and c.last_action.startswith("Wacht"), c.last_action
    await asyncio.sleep(10 + travel + 3)
    assert not gate["open"], "sluit na wachten"
    print("handmatig sluiten wachtte op vrije zone")

    # 3. beweging tijdens het sluiten, zonder stoppuls: enkel melding
    c.request(True, "test"); await asyncio.sleep(0.6)
    c._cancel_auto_close()
    n = len(pulses)
    c.request(False, "test"); await asyncio.sleep(1.5)  # sluitpuls is vertrokken, poort loopt
    assert c._closing_pulsed
    c.trigger_obstacle("camera")
    await asyncio.sleep(travel + 1)
    assert len(pulses) == n + 1 and not c.fault, ("geen extra puls zonder stoppuls-optie", len(pulses) - n, c.fault, c.last_action, gate)
    print("melding zonder stoppuls:", c.last_action)
    c.async_stop()

    # 4. met stoppuls: één puls extra en storing
    c = make(stop=True)
    c.obstacle_until = None
    await c.async_start()
    c.request(True, "test"); await asyncio.sleep(0.6)
    c._cancel_auto_close()
    await asyncio.sleep(11)  # oude bezetting laten verlopen
    n = len(pulses)
    c.request(False, "test"); await asyncio.sleep(1.5)  # sluitpuls is vertrokken, poort loopt
    assert c._closing_pulsed
    c.trigger_obstacle("camera")
    await asyncio.sleep(1)
    assert len(pulses) == n + 2 and c.fault and "gestopt" in c.fault, (len(pulses) - n, c.fault)
    print("stoppuls:", c.fault)
    c.async_stop()
    await hass.async_stop()
    print("ALLES OK")


asyncio.run(main())
