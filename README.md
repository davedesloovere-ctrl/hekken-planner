# Hekkenplanner

Home Assistant-integratie voor een hekken dat je enkel met een wisselpuls kunt sturen
(zoals een UniFi Access-relais), met een aparte sensor die ziet of het open of dicht staat
(zoals een Sensative strip).

Je beheert alles op een eigen pagina **Hekken** in de zijbalk van Home Assistant: de stand
van het hekken met grote open- en dichtknoppen, een weekplanning, regels met automatisch
sluiten na X minuten, uitzonderingen als er iemand thuis is, en de instellingen.

Het hekken koppel je **rechtstreeks via de UniFi Access-API** of via een bestaande
entiteit (knop, schakelaar, slot of script).

## Wat het doet

- **Open en dicht in plaats van een wisselpuls.** Vraag je "dicht" terwijl het al dicht is,
  dan gebeurt er niets. Er wordt nooit gepulst terwijl het hekken nog loopt.
- **Controle.** Na een puls volgt de planner de sensor. Geen reactie? Dan wacht hij de
  ingestelde tijd (standaard 5 minuten) en pulst hij nog één keer.
- **Storing in plaats van blijven sturen.** Staat het hekken na de laatste poging nog
  altijd niet goed, dan gaat het in storing: je krijgt een melding en er wordt **geen
  enkele puls meer** gestuurd, niet door regels, niet door automatisch sluiten en niet via
  de open/dicht-knoppen, tot je op *Storing resetten* drukt. De storing blijft staan na
  een herstart van Home Assistant.
- **Noodrem.** Zijn er al 6 pulsen gestuurd in 10 minuten, dan komt er geen zevende maar een storing, om welke reden ook.
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

Daarna verschijnt **Hekken** in de zijbalk. Daar beheer je de regels en instellingen.
Het menu onder *Hekkenplanner → Configureren* blijft als reserve, en daar wijzig je ook de
UniFi-verbinding.

## Wat je nodig hebt

- **UniFi Access:** een API-token. Maak het aan in UniFi Access bij Instellingen → Algemeen →
  Geavanceerd → API Token, met rechten om deuren te bekijken en te ontgrendelen. Home
  Assistant moet je console op poort 12445 kunnen bereiken. Bij het koppelen kies je de
  poort uit de lijst. Zet de deur in UniFi Access op een korte ontgrendeling, niet op
  "blijvend open".
- **Positiesensor:** de Sensative strip als `binary_sensor` (Z-Wave). Standaard: aan = open.
- **Wie is thuis:** de personen in Home Assistant (`person.*`). Hun thuis- of weg-status komt
  van de Home Assistant-app op je gsm. Je kan ook `zone.home` gebruiken.

## Entiteiten

| Entiteit | Wat |
|---|---|
| `cover.hekken` | Het hekken, met open en dicht |
| `switch.hekken_automatisch` | Alle regels aan of uit |
| `switch.hekken_regel_<naam>` | Eén regel aan of uit |
| `sensor.hekken_sluit_automatisch_om` | Wanneer het vanzelf sluit |
| `sensor.hekken_actieve_regel` | Welke regel nu geldt |
| `sensor.hekken_laatste_actie` | Wat er laatst gebeurde en waarom |
| `binary_sensor.hekken_storing` | Aan als het hekken in storing staat, met reden en tijdstip |
| `button.hekken_storing_resetten` | Storing wissen nadat je het hekken hebt nagekeken |

Bij een storing vuurt ook het event `hekken_failed` af, voor je eigen automatisaties.

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
      - entity: binary_sensor.hekken_storing
      - entity: button.hekken_storing_resetten
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
