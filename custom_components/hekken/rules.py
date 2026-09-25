"""Tijdsregels van de hekkenplanner.

Bewust zonder Home Assistant-imports, zodat de logica los te testen is.
"""

from __future__ import annotations

from datetime import datetime, time

DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]


def parse_time(value: str) -> time:
    """'08:00' of '08:00:00' naar een time."""
    parts = [int(p) for p in value.split(":")]
    while len(parts) < 3:
        parts.append(0)
    return time(parts[0], parts[1], parts[2])


def rule_active(rule: dict, now: datetime) -> bool:
    """Valt `now` binnen het venster van de regel?

    Een venster over middernacht (22:00 - 06:00) hoort bij de dag waarop het
    begint. Gelijke begin- en einduren betekenen de hele dag.
    """
    start = parse_time(rule["start"])
    end = parse_time(rule["end"])
    days = rule.get("days") or DAYS
    today = DAYS[now.weekday()]
    yesterday = DAYS[(now.weekday() - 1) % 7]
    t = now.time()

    if start == end:
        return today in days
    if start < end:
        return today in days and start <= t < end
    if t >= start:
        return today in days
    if t < end:
        return yesterday in days
    return False


ACTIONS = ["none", "open", "close"]


def start_action(rule: dict) -> str:
    """Wat er gebeurt bij het begin van het venster. Oude regels kenden enkel 'open_at_start'."""
    action = rule.get("start_action")
    if action in ACTIONS:
        return action
    return "open" if rule.get("open_at_start") else "none"


def end_action(rule: dict) -> str:
    """Wat er gebeurt bij het einde van het venster. Oude regels kenden enkel 'close_at_end'."""
    action = rule.get("end_action")
    if action in ACTIONS:
        return action
    return "close" if rule.get("close_at_end") else "none"


def describe(rule: dict) -> str:
    """Korte samenvatting voor het menu, bv. 'ma-vr 08:00-17:00: sluit na 15 min'."""
    short = {"mon": "ma", "tue": "di", "wed": "wo", "thu": "do", "fri": "vr", "sat": "za", "sun": "zo"}
    days = rule.get("days") or DAYS
    if len(days) == 7:
        day_txt = "elke dag"
    elif days == DAYS[:5]:
        day_txt = "ma-vr"
    elif days == DAYS[5:]:
        day_txt = "weekend"
    else:
        day_txt = ",".join(short[d] for d in DAYS if d in days)

    word = {"open": "open", "close": "dicht"}
    acts = []
    if start_action(rule) != "none":
        acts.append(f"{word[start_action(rule)]} bij start")
    if rule.get("auto_close"):
        acts.append(f"sluit na {int(rule.get('auto_close_minutes', 15))} min")
    if end_action(rule) != "none":
        acts.append(f"{word[end_action(rule)]} bij einde")
    if rule.get("skip_when_home"):
        acts.append("niet als iemand thuis is")

    return f"{day_txt} {rule['start'][:5]}-{rule['end'][:5]}: {', '.join(acts) or 'geen actie'}"


def _time(value: object) -> str:
    text = str(value).strip()
    try:
        t = parse_time(text)
    except (ValueError, IndexError) as err:
        raise ValueError(f"ongeldig uur: {text}") from err
    return t.strftime("%H:%M:%S")


def normalize_rule(raw: dict, new_id: str) -> dict:
    """Controleer een regel uit de interface en zet hem in de vaste vorm."""
    name = str(raw.get("name", "")).strip()
    if not name:
        raise ValueError("een regel heeft een naam nodig")
    days = [d for d in DAYS if d in (raw.get("days") or [])]
    if not days:
        raise ValueError(f"regel {name}: kies minstens één dag")
    try:
        minutes = int(raw.get("auto_close_minutes", 15))
    except (TypeError, ValueError) as err:
        raise ValueError(f"regel {name}: ongeldig aantal minuten") from err
    if not 1 <= minutes <= 240:
        raise ValueError(f"regel {name}: sluiten na 1 tot 240 minuten")
    for key in ("start_action", "end_action"):
        if raw.get(key) is not None and raw[key] not in ACTIONS:
            raise ValueError(f"regel {name}: ongeldige actie {raw[key]}")
    rule = {
        "id": str(raw.get("id") or new_id),
        "name": name[:60],
        "days": days,
        "start": _time(raw.get("start", "08:00")),
        "end": _time(raw.get("end", "17:00")),
        "auto_close": bool(raw.get("auto_close")),
        "auto_close_minutes": minutes,
        "skip_when_home": bool(raw.get("skip_when_home")),
        "start_action": start_action(raw),
        "end_action": end_action(raw),
    }
    if not (rule["auto_close"] or rule["start_action"] != "none" or rule["end_action"] != "none"):
        raise ValueError(f"regel {name}: kies minstens één actie")
    return rule


def normalize_settings(raw: dict) -> dict:
    """De instellingen die je op de pagina kan aanpassen, gecontroleerd."""

    def number(key: str, low: float, high: float, cast=int):
        try:
            value = cast(raw[key])
        except (KeyError, TypeError, ValueError) as err:
            raise ValueError(f"{key} ontbreekt of is ongeldig") from err
        if not low <= value <= high:
            raise ValueError(f"{key} moet tussen {low} en {high} liggen")
        return value

    presence = raw.get("presence_entities") or []
    if not isinstance(presence, list) or not all(isinstance(e, str) and "." in e for e in presence):
        raise ValueError("presence_entities moet een lijst entiteiten zijn")
    notify = str(raw.get("notify_service") or "").strip()
    obstacles = raw.get("obstacle_entities") or []
    if not isinstance(obstacles, list) or not all(isinstance(e, str) and "." in e for e in obstacles):
        raise ValueError("obstacle_entities moet een lijst entiteiten zijn")
    hold = raw.get("obstacle_hold", 60)
    try:
        hold = int(hold)
    except (TypeError, ValueError) as err:
        raise ValueError("obstacle_hold is ongeldig") from err
    if not 10 <= hold <= 600:
        raise ValueError("obstacle_hold moet tussen 10 en 600 liggen")
    return {
        "travel_time": number("travel_time", 5, 180),
        "retries": number("retries", 0, 3),
        "retry_delay": number("retry_delay", 1, 60, float),
        "presence_entities": presence,
        "notify_service": notify,
        "sensor_inverted": bool(raw.get("sensor_inverted")),
        "obstacle_entities": obstacles,
        "obstacle_hold": hold,
        "obstacle_stop": bool(raw.get("obstacle_stop")),
    }
