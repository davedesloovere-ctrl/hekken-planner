# Hekkenplanner

Home Assistant-integratie voor een hekken dat je enkel met een wisselpuls kunt sturen
(zoals een UniFi Access-relais), met een aparte sensor die ziet of het open of dicht staat
(zoals een Sensative strip).

Je stelt alles in via de interface van Home Assistant: tijdsregels, automatisch sluiten na
X minuten, en uitzonderingen als er iemand thuis is.

## Wat het doet

- **Open en dicht in plaats van een wisselpuls.** Vraag je "dicht" terwijl het al dicht is,
  dan gebeurt er niets. Er wordt nooit gepulst terwijl het hekken nog loopt.
- **Controle.** Na een puls wacht de planner op de sensor. Geen reactie? Dan nog eens
  proberen, en daarna een melding in Home Assistant (en op je gsm als je dat instelt).
- **Regels** met dagen en een tijdsvenster. Per regel kies je:
  - automatisch sluiten na X minuten open,
  - niet sluiten als iemand thuis is,
  - openen bij het begin van het venster,
  - sluiten bij het einde van het venster.
- **Schakelaars** om alles of één regel tijdelijk uit te zetten, bv. voor een feestje.

Voorbeeld: *werkdagen 08:00-17:00, sluit na 15 minuten, niet als iemand thuis is.*
Gaat het hekken om 10:00 open voor de postbode, dan sluit het om 10:15. Ben je thuis,
dan blijft het open. Vertrek je om 11:00 en staat het nog open, dan sluit het om 11:15.

## Installeren

**Via HACS (aanrader):** HACS → drie puntjes → *Aangepaste repositories* → deze repo als
type *Integratie* → installeren → Home Assistant herstarten.

**Met de hand:** kopieer `custom_components/hekken` naar `/config/custom_components/hekken`
(via de Samba- of File editor-add-on) en herstart Home Assistant.

Daarna: **Instellingen → Apparaten en diensten → Integratie toevoegen → Hekkenplanner.**

Regels beheer je via **Hekkenplanner → Configureren**.

## Wat je nodig hebt

- Het relais als entiteit in Home Assistant: een knop, schakelaar, slot of script.
  Voor UniFi Access is dat de deur van je hekken via een UniFi Access-integratie.
  Zet de deur in UniFi Access op een korte ontgrendeling, niet op "blijvend open".
- De Sensative strip als `binary_sensor` (Z-Wave). Standaard: aan = open.
- Voor "iemand thuis": je personen (`person.*`) of `zone.home`.

## Entiteiten

| Entiteit | Wat |
|---|---|
| `cover.hekken` | Het hekken, met open en dicht |
| `switch.hekken_automatisch` | Alle regels aan of uit |
| `switch.hekken_regel_<naam>` | Eén regel aan of uit |
| `sensor.hekken_sluit_automatisch_om` | Wanneer het vanzelf sluit |
| `sensor.hekken_actieve_regel` | Welke regel nu geldt |
| `sensor.hekken_laatste_actie` | Wat er laatst gebeurde en waarom |

Mislukt een beweging, dan vuurt ook het event `hekken_failed` af, voor je eigen automatisaties.

## Dashboardkaart

Pas de entity-ids aan als ze bij jou anders heten.

```yaml
type: vertical-stack
cards:
  - type: tile
    entity: cover.hekken
    features:
      - type: cover-open-close
  - type: entities
    entities:
      - entity: switch.hekken_automatisch
      - entity: sensor.hekken_sluit_automatisch_om
      - entity: sensor.hekken_actieve_regel
      - entity: sensor.hekken_laatste_actie
      - type: section
        label: Regels
      - entity: switch.hekken_regel_overdag
```

## Goed om te weten

- Een sensor op één plek ziet enkel "dicht" of "niet dicht". Staat het hekken half open,
  dan ziet de planner dat als open. Een tweede strip op de open-eindstand maakt het
  sluitend; dat kan later worden toegevoegd.
- Automatisch sluiten zonder dat iemand kijkt: zorg voor fotocellen of obstakeldetectie
  op de motor.
- Na een herstart van Home Assistant voert de planner geen "open bij start" of "sluiten
  bij einde" alsnog uit. Staat het hekken open binnen een regel met automatisch sluiten,
  dan begint de teller opnieuw.
