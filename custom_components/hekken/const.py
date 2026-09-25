"""Constanten voor de hekkenplanner."""

from .rules import DAYS  # noqa: F401

DOMAIN = "hekken"
VERSION = "0.3.1"

CONF_RELAY_TYPE = "relay_type"
RELAY_UNIFI = "unifi"
RELAY_ENTITY = "entity"
CONF_UNIFI_HOST = "unifi_host"
CONF_UNIFI_TOKEN = "unifi_token"
CONF_UNIFI_VERIFY_SSL = "unifi_verify_ssl"
CONF_UNIFI_DOOR_ID = "unifi_door_id"
CONF_UNIFI_DOOR_NAME = "unifi_door_name"

CONF_RELAY = "relay_entity"
CONF_SENSOR = "sensor_entity"
CONF_SENSOR_INVERTED = "sensor_inverted"
CONF_TRAVEL_TIME = "travel_time"
CONF_RETRIES = "retries"
CONF_RETRY_DELAY = "retry_delay"
CONF_PRESENCE = "presence_entities"
CONF_NOTIFY = "notify_service"
CONF_RULES = "rules"
CONF_OBSTACLE_ENTITIES = "obstacle_entities"
CONF_OBSTACLE_HOLD = "obstacle_hold"
CONF_OBSTACLE_STOP = "obstacle_stop"
CONF_WEBHOOK_ID = "webhook_id"

R_ID = "id"
R_NAME = "name"
R_DAYS = "days"
R_START = "start"
R_END = "end"
R_START_ACTION = "start_action"
R_END_ACTION = "end_action"
ACTIONS = ["none", "open", "close"]
R_AUTO_CLOSE = "auto_close"
R_AUTO_CLOSE_MIN = "auto_close_minutes"
R_SKIP_HOME = "skip_when_home"

DEFAULT_TRAVEL_TIME = 30
DEFAULT_RETRIES = 1
DEFAULT_OBSTACLE_HOLD = 60  # seconden dat een camerasignaal als 'bezet' telt
MAX_OBSTACLE_WAIT = 600  # langer wachten op een vrije zone doen we niet
DEFAULT_RETRY_DELAY = 5  # minuten tussen twee pogingen

# Noodrem: zoveel pulsen binnen dit venster en de planner gaat in storing,
# wat er ook om vraagt.
MAX_PULSES = 6
MAX_PULSES_WINDOW = 600  # seconden

RELAY_DOMAINS = ["button", "input_button", "switch", "lock", "script"]
PRESENCE_DOMAINS = ["person", "device_tracker", "binary_sensor", "input_boolean", "group", "zone"]

EVENT_FAILED = f"{DOMAIN}_failed"
