import asyncio, sys, tempfile, logging
from types import SimpleNamespace
sys.path.insert(0, r"C:\AI\hekken-planner")
from homeassistant.core import HomeAssistant
from custom_components.hekken.controller import GateController

async def main():
    hass = HomeAssistant(tempfile.mkdtemp())
    await hass.async_start()
    pulses = []
    gate = {"open": False}
    async def press(call):
        pulses.append(call.data)
        # hekken reageert: wissel na 0.3s
        async def flip():
            await asyncio.sleep(0.3)
            gate["open"] = not gate["open"]
            hass.states.async_set("binary_sensor.strip", "on" if gate["open"] else "off")
        hass.async_create_task(flip())
    hass.services.async_register("button", "press", press)
    hass.states.async_set("button.hek", "unknown")
    hass.states.async_set("binary_sensor.strip", "off")
    hass.states.async_set("person.dave", "not_home")

    rule = {"id":"r1","name":"Overdag","days":["mon","tue","wed","thu","fri","sat","sun"],
            "start":"00:00:00","end":"00:00:00","auto_close":True,"auto_close_minutes":0.05,
            "skip_when_home":True,"open_at_start":False,"close_at_end":False}
    entry = SimpleNamespace(entry_id="e1", title="Hekken",
        data={"relay_entity":"button.hek","sensor_entity":"binary_sensor.strip","travel_time":1,"retries":1,
              "presence_entities":["person.dave"],"notify_service":""},
        options={"rules":[rule]})
    c = GateController(hass, entry)
    await c.async_start()

    # 1. dicht vragen terwijl dicht: geen puls
    c.request(False, "test"); await asyncio.sleep(0.5)
    assert pulses == [], pulses
    # 2. openen: een puls, gaat open, auto-close timer start
    c.request(True, "test"); await asyncio.sleep(1)
    assert len(pulses) == 1 and gate["open"] and c.auto_close_at is not None, (pulses, gate, c.auto_close_at)
    # 3. openen terwijl open: geen puls
    c.request(True, "test"); await asyncio.sleep(0.3); assert len(pulses) == 1
    # 4. iemand thuis: timer weg
    hass.states.async_set("person.dave", "home"); await asyncio.sleep(0.1)
    assert c.auto_close_at is None
    # 5. weg: timer opnieuw, na 3s sluit hij (wacht ook looptijd sinds opengaan)
    hass.states.async_set("person.dave", "not_home"); await asyncio.sleep(0.1)
    assert c.auto_close_at is not None
    await asyncio.sleep(5)
    assert not gate["open"] and len(pulses) == 2, (gate, pulses)
    print("laatste actie:", c.last_action)
    # 6. hekken reageert niet: 2 pogingen, dan melding
    hass.services.async_remove("button","press")
    async def dead(call): pulses.append("dood")
    hass.services.async_register("button","press",dead)
    c.request(True, "test"); await asyncio.sleep(25)
    assert pulses.count("dood") == 2, pulses
    print("na falen:", c.last_action)
    c.async_stop(); await hass.async_stop()
    print("ALLES OK")
asyncio.run(main())
