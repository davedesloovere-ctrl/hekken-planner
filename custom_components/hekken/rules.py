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

    acts = []
    if rule.get("open_at_start"):
        acts.append("open bij start")
    if rule.get("auto_close"):
        acts.append(f"sluit na {int(rule.get('auto_close_minutes', 15))} min")
    if rule.get("close_at_end"):
        acts.append("dicht bij einde")
    if rule.get("skip_when_home"):
        acts.append("niet als iemand thuis is")

    return f"{day_txt} {rule['start'][:5]}-{rule['end'][:5]}: {', '.join(acts) or 'geen actie'}"
