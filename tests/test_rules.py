"""Tests voor de tijdsvensters, zonder Home Assistant nodig."""

from datetime import datetime
import importlib.util
from pathlib import Path

_path = Path(__file__).parent.parent / "custom_components" / "hekken" / "rules.py"
_spec = importlib.util.spec_from_file_location("hekken_rules", _path)
rules = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(rules)

WORKDAY = {"start": "08:00:00", "end": "17:00:00", "days": ["mon", "tue", "wed", "thu", "fri"]}
NIGHT = {"start": "22:00:00", "end": "06:00:00", "days": ["fri"]}

# 2026-09-25 is een vrijdag
FRI = datetime(2026, 9, 25)
SAT = datetime(2026, 9, 26)


def at(day: datetime, hh: int, mm: int = 0) -> datetime:
    return day.replace(hour=hh, minute=mm)


def test_day_window():
    assert not rules.rule_active(WORKDAY, at(FRI, 7, 59))
    assert rules.rule_active(WORKDAY, at(FRI, 8, 0))
    assert rules.rule_active(WORKDAY, at(FRI, 16, 59))
    assert not rules.rule_active(WORKDAY, at(FRI, 17, 0))
    assert not rules.rule_active(WORKDAY, at(SAT, 12))


def test_overnight_window_belongs_to_start_day():
    assert rules.rule_active(NIGHT, at(FRI, 23))
    assert rules.rule_active(NIGHT, at(SAT, 5, 59))
    assert not rules.rule_active(NIGHT, at(SAT, 6))
    assert not rules.rule_active(NIGHT, at(SAT, 23))
    assert not rules.rule_active(NIGHT, at(FRI, 3))


def test_equal_times_mean_all_day():
    rule = {"start": "00:00:00", "end": "00:00:00", "days": ["sat"]}
    assert rules.rule_active(rule, at(SAT, 0))
    assert rules.rule_active(rule, at(SAT, 23, 59))
    assert not rules.rule_active(rule, at(FRI, 12))


def test_describe():
    rule = {**WORKDAY, "auto_close": True, "auto_close_minutes": 15, "skip_when_home": True}
    assert rules.describe(rule) == "ma-vr 08:00-17:00: sluit na 15 min, niet als iemand thuis is"


def test_normalize_rule():
    r = rules.normalize_rule(
        {"name": " Overdag ", "days": ["fri", "mon", "xx"], "start": "8:00", "end": "17:00",
         "auto_close": True, "auto_close_minutes": "15"}, "abc")
    assert r["id"] == "abc" and r["name"] == "Overdag"
    assert r["days"] == ["mon", "fri"] and r["start"] == "08:00:00" and r["auto_close_minutes"] == 15


def test_normalize_rule_rejects():
    import pytest
    base = {"name": "x", "days": ["mon"], "start": "08:00", "end": "17:00", "auto_close": True}
    for bad in ({"name": ""}, {"days": []}, {"start": "25:00"}, {"auto_close": False},
                {"auto_close_minutes": 0}):
        with pytest.raises(ValueError):
            rules.normalize_rule({**base, **bad}, "id")


def test_normalize_settings():
    s = rules.normalize_settings({"travel_time": "30", "retries": 1, "retry_delay": "5",
                                  "presence_entities": ["person.dave"], "notify_service": " notify.x "})
    assert s == {"travel_time": 30, "retries": 1, "retry_delay": 5.0, "presence_entities": ["person.dave"],
                 "notify_service": "notify.x", "sensor_inverted": False}
