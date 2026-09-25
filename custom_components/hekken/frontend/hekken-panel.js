// Hekkenplanner: de pagina in de zijbalk van Home Assistant.
// Eén bestand, geen build-stap, geen externe bibliotheken.

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const COLORS = ["#4f8cff", "#2bb673", "#f59e0b", "#a855f7", "#ec4899", "#14b8a6", "#ef4444"];

const STR = {
  nl: {
    loading: "Laden…",
    no_gates: "Nog geen hekken gekoppeld. Voeg de integratie Hekkenplanner toe via Instellingen → Apparaten en diensten.",
    closed: "Dicht", open: "Open", opening: "Gaat open…", closing: "Gaat dicht…",
    unavailable: "Sensor onbereikbaar", fault: "Storing",
    btn_open: "Openen", btn_close: "Sluiten",
    closes_in: "Sluit automatisch over {t}",
    someone_home: "Iemand thuis", nobody_home: "Niemand thuis",
    automatic: "Automatisch", auto_on: "Regels actief", auto_off: "Regels staan uit",
    active_rule: "Nu actief", none: "Geen regel actief",
    fault_title: "Het hekken staat in storing",
    fault_body: "Er worden geen pulsen meer gestuurd. Kijk het hekken na en reset daarna de storing.",
    reset: "Storing resetten", since: "sinds {t}",
    week: "Weekplanning", rules: "Regels", add_rule: "Regel toevoegen",
    no_rules: "Nog geen regels. Voeg er een toe om het hekken op tijd te laten sluiten of openen.",
    edit: "Bewerken", delete: "Verwijderen", confirm_delete: "Regel '{n}' verwijderen?",
    settings: "Instellingen", save: "Bewaren", cancel: "Annuleren", saved: "Bewaard",
    last_action: "Laatste actie",
    via_unifi: "Gestuurd via UniFi Access: {d}", via_entity: "Gestuurd via {e}",
    rule_new: "Nieuwe regel", rule_edit: "Regel bewerken",
    name: "Naam", days: "Dagen", from: "Van", to: "Tot",
    workdays: "Werkdagen", weekend: "Weekend", everyday: "Elke dag",
    act_auto_close: "Automatisch sluiten", act_auto_close_d: "Gaat het hekken open in dit venster, dan sluit het vanzelf.",
    after: "na", minutes: "min",
    act_skip_home: "Niet sluiten als iemand thuis is", act_skip_home_d: "Vertrekt de laatste persoon, dan begint de teller opnieuw.",
    act_open_start: "Openen bij het begin", act_open_start_d: "Het hekken gaat open op het beginuur.",
    act_close_end: "Sluiten bij het einde", act_close_end_d: "Het hekken gaat dicht op het einduur.",
    overnight: "Loopt over middernacht tot de volgende dag.",
    allday: "Gelijke uren: de hele dag.",
    err_name: "Geef de regel een naam.", err_days: "Kies minstens één dag.", err_action: "Kies minstens één actie.",
    travel_time: "Looptijd van het hekken", travel_time_d: "Hoe lang openen of sluiten duurt. Binnen deze tijd wordt nooit opnieuw gepulst.",
    retries: "Extra pogingen", retries_d: "Hoe vaak opnieuw pulsen voor het hekken in storing gaat.",
    retry_delay: "Wachttijd tussen pogingen", retry_delay_d: "Zolang wordt de sensor gevolgd voor een nieuwe poging.",
    presence: "Wie telt als thuis", presence_d: "Is één van deze thuis, dan slaan regels met 'niet als iemand thuis is' het sluiten over.",
    notify: "Melding bij storing", notify_none: "Enkel in Home Assistant",
    inverted: "Sensor omgekeerd", inverted_d: "Aanzetten als de sensor 'aan' geeft wanneer het hekken dicht is.",
    sec: "s", read_only: "Enkel beheerders kunnen regels en instellingen wijzigen.",
    d_mon: "Ma", d_tue: "Di", d_wed: "Wo", d_thu: "Do", d_fri: "Vr", d_sat: "Za", d_sun: "Zo",
    sum_auto: "sluit na {m} min", sum_home: "niet als iemand thuis is", sum_open: "open bij begin", sum_close: "dicht bij einde",
    now: "nu",
  },
  en: {
    loading: "Loading…",
    no_gates: "No gate connected yet. Add the Hekkenplanner integration via Settings → Devices & services.",
    closed: "Closed", open: "Open", opening: "Opening…", closing: "Closing…",
    unavailable: "Sensor unavailable", fault: "Fault",
    btn_open: "Open", btn_close: "Close",
    closes_in: "Closes automatically in {t}",
    someone_home: "Someone home", nobody_home: "Nobody home",
    automatic: "Automatic", auto_on: "Rules active", auto_off: "Rules are off",
    active_rule: "Active now", none: "No rule active",
    fault_title: "The gate is in fault",
    fault_body: "No more pulses are sent. Check the gate, then reset the fault.",
    reset: "Reset fault", since: "since {t}",
    week: "Week schedule", rules: "Rules", add_rule: "Add rule",
    no_rules: "No rules yet. Add one to close or open the gate on a schedule.",
    edit: "Edit", delete: "Delete", confirm_delete: "Delete rule '{n}'?",
    settings: "Settings", save: "Save", cancel: "Cancel", saved: "Saved",
    last_action: "Last action",
    via_unifi: "Controlled via UniFi Access: {d}", via_entity: "Controlled via {e}",
    rule_new: "New rule", rule_edit: "Edit rule",
    name: "Name", days: "Days", from: "From", to: "Until",
    workdays: "Weekdays", weekend: "Weekend", everyday: "Every day",
    act_auto_close: "Close automatically", act_auto_close_d: "When the gate opens within this window, it closes by itself.",
    after: "after", minutes: "min",
    act_skip_home: "Don't close when someone is home", act_skip_home_d: "When the last person leaves, the timer starts again.",
    act_open_start: "Open at the start", act_open_start_d: "The gate opens at the start time.",
    act_close_end: "Close at the end", act_close_end_d: "The gate closes at the end time.",
    overnight: "Runs past midnight into the next day.",
    allday: "Equal times: all day.",
    err_name: "Give the rule a name.", err_days: "Pick at least one day.", err_action: "Pick at least one action.",
    travel_time: "Gate travel time", travel_time_d: "How long opening or closing takes. No new pulse is sent within this time.",
    retries: "Extra attempts", retries_d: "How many extra pulses before the gate goes into fault.",
    retry_delay: "Wait between attempts", retry_delay_d: "The sensor is watched this long before trying again.",
    presence: "Who counts as home", presence_d: "If any of these is home, rules with 'don't close when someone is home' skip closing.",
    notify: "Notify on fault", notify_none: "Home Assistant only",
    inverted: "Sensor inverted", inverted_d: "Turn on if the sensor reports 'on' when the gate is closed.",
    sec: "s", read_only: "Only administrators can change rules and settings.",
    d_mon: "Mo", d_tue: "Tu", d_wed: "We", d_thu: "Th", d_fri: "Fr", d_sat: "Sa", d_sun: "Su",
    sum_auto: "closes after {m} min", sum_home: "not when someone is home", sum_open: "opens at start", sum_close: "closes at end",
    now: "now",
  },
};

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const toMin = (hhmm) => {
  const [h, m] = String(hhmm).split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

const hhmm = (v) => String(v || "").slice(0, 5);

const CSS = `
:host {
  --hk-card: var(--ha-card-background, var(--card-background-color, #fff));
  --hk-text: var(--primary-text-color, #1c1c1c);
  --hk-muted: var(--secondary-text-color, #6b7280);
  --hk-accent: var(--primary-color, #03a9f4);
  --hk-ok: var(--success-color, #2bb673);
  --hk-warn: var(--warning-color, #f59e0b);
  --hk-bad: var(--error-color, #ef4444);
  --hk-line: var(--divider-color, rgba(127,127,127,.2));
  --hk-soft: color-mix(in srgb, var(--hk-text) 6%, transparent);
  --hk-radius: var(--ha-card-border-radius, 16px);
  display: block;
  min-height: 100vh;
  background: var(--primary-background-color, #f5f5f5);
  color: var(--hk-text);
  font-family: var(--paper-font-body1_-_font-family, Roboto, system-ui, sans-serif);
}
* { box-sizing: border-box; }
.i { width: 18px; height: 18px; fill: currentColor; flex: none; }
h2 .i { opacity: .6; }
.toolbar {
  display: flex; align-items: center; gap: 4px;
  height: var(--header-height, 56px); padding: 0 12px;
  background: var(--app-header-background-color, var(--primary-color));
  color: var(--app-header-text-color, #fff);
  border-bottom: var(--app-header-border-bottom, none);
  position: sticky; top: 0; z-index: 5;
}
.toolbar .title { font-size: 20px; font-weight: 400; margin-left: 8px; flex: 1; }
.tabs { display: flex; gap: 4px; }
.tab { background: none; border: 0; color: inherit; opacity: .7; padding: 8px 12px; border-radius: 999px; cursor: pointer; font: inherit; }
.tab.on { opacity: 1; background: rgba(255,255,255,.18); }
.wrap { max-width: 1040px; margin: 0 auto; padding: 16px; display: grid; gap: 16px; }
.grid { display: grid; gap: 16px; grid-template-columns: 1fr; }
@media (min-width: 900px) { .grid { grid-template-columns: 1.1fr .9fr; align-items: start; } }
.card {
  background: var(--hk-card); border-radius: var(--hk-radius);
  box-shadow: var(--ha-card-box-shadow, 0 1px 3px rgba(0,0,0,.08));
  border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--hk-line));
  padding: 20px;
}
h2 { font-size: 16px; font-weight: 600; margin: 0 0 14px; display: flex; align-items: center; gap: 8px; }
h2 .sp { flex: 1; }
.muted { color: var(--hk-muted); }
.small { font-size: 13px; }

/* hero */
.hero { display: grid; gap: 20px; grid-template-columns: 1fr; overflow: hidden; position: relative; }
@media (min-width: 640px) { .hero { grid-template-columns: 280px 1fr; align-items: center; } }
.hero::before {
  content: ""; position: absolute; inset: 0; pointer-events: none; opacity: .10; transition: background .6s;
  background: radial-gradient(120% 90% at 0% 0%, var(--hk-state) 0%, transparent 60%);
}
.hero > * { position: relative; }
.hero { --hk-state: var(--hk-ok); }
.hero.is-open, .hero.is-opening { --hk-state: var(--hk-accent); }
.hero.is-closing { --hk-state: var(--hk-warn); }
.hero.is-fault, .hero.is-unavailable { --hk-state: var(--hk-bad); }
.gate-svg { width: 100%; max-width: 280px; height: auto; display: block; margin: 0 auto; }
.gate-leaf { transition: transform 2.4s cubic-bezier(.45,.05,.25,1); }
.is-open .gate-leaf { transform: translateX(-128px); }
.is-opening .gate-leaf, .is-closing .gate-leaf { transform: translateX(-64px); }
.lamp { fill: var(--hk-line); transition: fill .3s; }
.is-opening .lamp, .is-closing .lamp { fill: var(--hk-warn); animation: blink 1s steps(2, start) infinite; }
.is-fault .lamp { fill: var(--hk-bad); animation: blink 1.4s steps(2, start) infinite; }
@keyframes blink { to { visibility: hidden; } }
.status { font-size: 34px; font-weight: 600; letter-spacing: -.02em; display: flex; align-items: center; gap: 10px; }
.dot { width: 12px; height: 12px; border-radius: 50%; background: var(--hk-state); box-shadow: 0 0 0 6px color-mix(in srgb, var(--hk-state) 20%, transparent); }
.sub { margin-top: 6px; min-height: 20px; font-variant-numeric: tabular-nums; }
.actions { display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap; }
.btn {
  font: inherit; font-weight: 600; border-radius: 12px; padding: 12px 20px; cursor: pointer;
  border: 1px solid var(--hk-line); background: var(--hk-card); color: var(--hk-text);
  display: inline-flex; align-items: center; gap: 8px; transition: transform .08s, filter .15s, background .15s;
}
.btn:hover { filter: brightness(.97); }
.btn:active { transform: scale(.98); }
.btn[disabled] { opacity: .45; cursor: not-allowed; }
.btn.primary { background: var(--hk-accent); color: var(--text-primary-color, #fff); border-color: transparent; }
.btn.danger { background: var(--hk-bad); color: #fff; border-color: transparent; }
.btn.ghost { background: transparent; border-color: transparent; color: var(--hk-muted); padding: 8px 10px; }
.btn.big { padding: 14px 26px; font-size: 16px; min-width: 130px; justify-content: center; }
.btn svg { width: 18px; height: 18px; fill: currentColor; }
.chips { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 18px; }
.chip {
  display: inline-flex; align-items: center; gap: 8px; padding: 7px 12px; border-radius: 999px;
  background: var(--hk-soft); font-size: 13px; border: 1px solid transparent; color: var(--hk-text);
}
button.chip { cursor: pointer; font: inherit; font-size: 13px; }
.chip svg { width: 16px; height: 16px; fill: currentColor; opacity: .8; }
.chip.on { background: color-mix(in srgb, var(--hk-accent) 16%, transparent); color: var(--hk-accent); }
.chip.off { color: var(--hk-muted); }

/* fault */
.fault {
  border: 1px solid color-mix(in srgb, var(--hk-bad) 45%, transparent);
  background: color-mix(in srgb, var(--hk-bad) 10%, var(--hk-card));
  display: flex; gap: 16px; align-items: center; flex-wrap: wrap;
}
.fault .icon { width: 40px; height: 40px; border-radius: 12px; background: var(--hk-bad); display: grid; place-items: center; flex: none; }
.fault .icon svg { width: 24px; height: 24px; fill: #fff; }
.fault .txt { flex: 1; min-width: 220px; }
.fault b { display: block; margin-bottom: 2px; }

/* week */
.week { display: grid; gap: 6px; }
.hours { position: relative; height: 16px; margin-left: 38px; font-size: 11px; }
.hours span { position: absolute; transform: translateX(-50%); color: var(--hk-muted); }
.row { display: grid; grid-template-columns: 30px 1fr; gap: 8px; align-items: center; }
.row .lbl { font-size: 12px; color: var(--hk-muted); font-weight: 600; }
.row.today .lbl { color: var(--hk-accent); }
.track {
  position: relative; height: 30px; border-radius: 8px; background: var(--hk-soft); overflow: hidden;
  background-image: linear-gradient(to right, var(--hk-line) 1px, transparent 1px);
  background-size: calc(100% / 4) 100%;
}
.bar { position: absolute; border-radius: 5px; opacity: .9; }
.bar.off { opacity: .25; background-image: repeating-linear-gradient(45deg, transparent 0 4px, rgba(255,255,255,.5) 4px 6px) !important; }
.nowline { position: absolute; top: -2px; bottom: -2px; width: 2px; background: var(--hk-bad); border-radius: 2px; }
.nowline::after { content: ""; position: absolute; top: -3px; left: -3px; width: 8px; height: 8px; border-radius: 50%; background: var(--hk-bad); }

/* rules */
.rules { display: grid; gap: 10px; }
.rule {
  display: grid; grid-template-columns: 6px 1fr auto; gap: 14px; align-items: center;
  padding: 12px 12px 12px 0; border-radius: 12px; border: 1px solid var(--hk-line); overflow: hidden;
}
.rule .stripe { align-self: stretch; }
.rule .name { font-weight: 600; }
.rule .meta { font-size: 13px; color: var(--hk-muted); margin-top: 2px; }
.rule .tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
.tag { font-size: 11px; padding: 3px 8px; border-radius: 999px; background: var(--hk-soft); color: var(--hk-muted); }
.rule .right { display: flex; align-items: center; gap: 2px; }
.rule.disabled .name, .rule.disabled .tags { opacity: .5; }
.empty { text-align: center; padding: 24px 12px; color: var(--hk-muted); }

/* switch */
.sw { position: relative; width: 42px; height: 24px; flex: none; }
.sw input { opacity: 0; width: 0; height: 0; position: absolute; }
.sw span { position: absolute; inset: 0; border-radius: 999px; background: var(--hk-line); transition: background .2s; cursor: pointer; }
.sw span::after { content: ""; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,.3); transition: transform .2s; }
.sw input:checked + span { background: var(--hk-accent); }
.sw input:checked + span::after { transform: translateX(18px); }
.sw input:disabled + span { opacity: .5; cursor: not-allowed; }

/* forms */
.field { display: grid; gap: 6px; margin-bottom: 16px; }
.field label, .flabel { font-size: 13px; font-weight: 600; }
.field .hint { font-size: 12px; color: var(--hk-muted); }
input[type=text], input[type=number], input[type=time], select {
  font: inherit; color: var(--hk-text); background: var(--hk-soft);
  border: 1px solid var(--hk-line); border-radius: 10px; padding: 10px 12px; width: 100%;
}
input:focus, select:focus { outline: 2px solid color-mix(in srgb, var(--hk-accent) 50%, transparent); outline-offset: 0; }
.inline { display: flex; gap: 12px; }
.inline > * { flex: 1; }
.daypick { display: flex; gap: 6px; flex-wrap: wrap; }
.daypick button {
  font: inherit; font-size: 13px; font-weight: 600; width: 42px; height: 42px; border-radius: 50%; cursor: pointer;
  border: 1px solid var(--hk-line); background: transparent; color: var(--hk-muted);
}
.daypick button.on { background: var(--hk-accent); color: var(--text-primary-color, #fff); border-color: transparent; }
.presets { display: flex; gap: 6px; margin-top: 4px; }
.presets button { font: inherit; font-size: 12px; background: none; border: 0; color: var(--hk-accent); cursor: pointer; padding: 2px 4px; }
.opt { display: grid; grid-template-columns: 1fr auto; gap: 4px 12px; align-items: center; padding: 12px 0; border-top: 1px solid var(--hk-line); }
.opt .t { font-weight: 600; font-size: 14px; }
.opt .d { font-size: 12px; color: var(--hk-muted); grid-column: 1; }
.opt .extra { grid-column: 1 / -1; display: flex; align-items: center; gap: 8px; font-size: 14px; }
.opt .extra input { width: 90px; }
.stepper { display: inline-flex; align-items: center; gap: 4px; }
.stepper button { font: inherit; width: 34px; height: 34px; border-radius: 10px; border: 1px solid var(--hk-line); background: var(--hk-card); color: var(--hk-text); cursor: pointer; }
.stepper input { width: 70px !important; text-align: center; }
.err { color: var(--hk-bad); font-size: 13px; min-height: 18px; }
.pchips { display: flex; flex-wrap: wrap; gap: 6px; }
.pchips button { font: inherit; font-size: 13px; padding: 6px 12px; border-radius: 999px; border: 1px solid var(--hk-line); background: transparent; color: var(--hk-text); cursor: pointer; }
.pchips button.on { background: color-mix(in srgb, var(--hk-accent) 16%, transparent); color: var(--hk-accent); border-color: transparent; }

/* dialog */
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.45); display: grid; place-items: center; z-index: 20;
  padding: 16px; animation: fade .15s ease-out;
}
.dialog { width: min(520px, 100%); max-height: calc(100vh - 32px); overflow: auto; animation: pop .18s ease-out; }
.dialog .foot { display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px; align-items: center; }
.dialog .foot .sp { flex: 1; }
@keyframes fade { from { opacity: 0; } }
@keyframes pop { from { transform: translateY(12px) scale(.98); opacity: 0; } }

.footer { display: flex; gap: 16px; flex-wrap: wrap; justify-content: space-between; font-size: 13px; color: var(--hk-muted); }
.toast {
  position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%); z-index: 30;
  background: var(--hk-text); color: var(--hk-card); padding: 10px 16px; border-radius: 10px; font-size: 14px;
  box-shadow: 0 6px 20px rgba(0,0,0,.25); animation: pop .18s ease-out; max-width: calc(100% - 32px);
}
.toast.bad { background: var(--hk-bad); color: #fff; }
`;

const ICON = {
  up: "M7 14l5-5 5 5z",
  down: "M7 10l5 5 5-5z",
  alert: "M12 2L1 21h22L12 2zm1 15h-2v-2h2v2zm0-4h-2V9h2v4z",
  home: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
  away: "M12 7c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-2 3l-3 11h2l2-6 2 2v4h2v-5l-2-2 1-3c1 1.3 2.4 2 4 2v-2c-1.3 0-2.4-.7-3-1.7l-1-1.6c-.4-.6-1-.9-1.7-.9-.3 0-.5.1-.8.2L6 8.3V13h2V9.6l2-.6",
  clock: "M12 2a10 10 0 100 20 10 10 0 000-20zm1 11h-5v-2h3V6h2v7z",
  edit: "M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25zM20.7 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
  del: "M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
  plus: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
  cal: "M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 16H5V9h14v11z",
  restart: "M12 5V1L7 6l5 5V7a6 6 0 11-6 6H4a8 8 0 108-8z",
};
const svg = (name) => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICON[name]}"/></svg>`;

const GATE_SVG = `
<svg class="gate-svg" viewBox="0 0 280 150" aria-hidden="true">
  <defs>
    <clipPath id="hk-opening"><rect x="0" y="0" width="280" height="150"/></clipPath>
  </defs>
  <rect x="0" y="128" width="280" height="4" rx="2" fill="currentColor" opacity=".18"/>
  <rect x="10" y="70" width="118" height="58" rx="3" fill="currentColor" opacity=".07"/>
  <g clip-path="url(#hk-opening)">
    <g class="gate-leaf">
      <rect x="130" y="52" width="128" height="72" rx="4" fill="none" stroke="currentColor" stroke-width="5" opacity=".85"/>
      <g stroke="currentColor" stroke-width="4" opacity=".6">
        <line x1="148" y1="55" x2="148" y2="121"/><line x1="166" y1="55" x2="166" y2="121"/>
        <line x1="184" y1="55" x2="184" y2="121"/><line x1="202" y1="55" x2="202" y2="121"/>
        <line x1="220" y1="55" x2="220" y2="121"/><line x1="238" y1="55" x2="238" y2="121"/>
      </g>
      <line x1="132" y1="88" x2="256" y2="88" stroke="currentColor" stroke-width="3" opacity=".4"/>
      <circle cx="146" cy="128" r="4" fill="currentColor" opacity=".6"/>
      <circle cx="242" cy="128" r="4" fill="currentColor" opacity=".6"/>
    </g>
  </g>
  <rect x="120" y="40" width="10" height="90" rx="2" fill="currentColor" opacity=".9"/>
  <rect x="258" y="40" width="10" height="90" rx="2" fill="currentColor" opacity=".9"/>
  <circle class="lamp" cx="125" cy="32" r="7"/>
</svg>`;

class HekkenPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._data = null;
    this._idx = 0;
    this._sig = "";
    this._dialog = null;
    this._settingsDraft = null;
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (this._menu) this._menu.hass = hass;
    if (first) {
      this._shell();
      this._load();
    } else {
      this._live();
    }
  }
  get hass() { return this._hass; }
  set narrow(v) { this._narrow = v; if (this._menu) this._menu.narrow = v; }
  set panel(v) { this._panel = v; }

  connectedCallback() {
    this._tick = setInterval(() => this._countdown(), 1000);
    this._minute = setInterval(() => { this._sig = ""; this._live(); }, 30000);
  }
  disconnectedCallback() {
    clearInterval(this._tick);
    clearInterval(this._minute);
  }

  // --- helpers ---------------------------------------------------------

  t(key, vars) {
    const lang = (this._hass?.locale?.language || this._hass?.language || "en").startsWith("nl") ? "nl" : "en";
    let s = STR[lang][key] ?? STR.en[key] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(v);
    return s;
  }
  get entry() { return this._data?.entries?.[this._idx]; }
  st(id) { return id ? this._hass.states[id] : undefined; }
  $(sel) { return this.shadowRoot.querySelector(sel); }

  toast(msg, bad = false) {
    this.shadowRoot.querySelector(".toast")?.remove();
    const el = document.createElement("div");
    el.className = `toast${bad ? " bad" : ""}`;
    el.textContent = msg;
    this.shadowRoot.appendChild(el);
    setTimeout(() => el.remove(), bad ? 6000 : 2500);
  }

  async call(domain, service, entityId) {
    try {
      await this._hass.callService(domain, service, { entity_id: entityId });
    } catch (err) {
      this.toast(err?.message || String(err), true);
    }
  }

  // --- data ------------------------------------------------------------

  async _load(delay = 0) {
    if (delay) await new Promise((r) => setTimeout(r, delay));
    try {
      this._data = await this._hass.callWS({ type: "hekken/list" });
      this._error = null;
    } catch (err) {
      this._error = err?.message || String(err);
    }
    if (this._idx >= (this._data?.entries?.length || 0)) this._idx = 0;
    this._settingsDraft = null;
    this._render();
  }

  async _saveRules(rules) {
    try {
      await this._hass.callWS({ type: "hekken/save_rules", entry_id: this.entry.entry_id, rules });
      this.toast(this.t("saved"));
      this.entry.rules = rules;
      this._render();
      this._load(1500); // de integratie herlaadt; daarna de nieuwe entiteiten ophalen
      return true;
    } catch (err) {
      this.toast(err?.message || String(err), true);
      return false;
    }
  }

  // --- opbouw ----------------------------------------------------------

  _shell() {
    this.shadowRoot.innerHTML = `
      <style>${CSS}</style>
      <div class="toolbar">
        <span class="menu"></span>
        <div class="title">Hekken</div>
        <div class="tabs"></div>
      </div>
      <div class="wrap"><div class="card muted">${this.t("loading")}</div></div>`;
    this._menu = document.createElement("ha-menu-button");
    this._menu.hass = this._hass;
    this._menu.narrow = this._narrow;
    this.$(".menu").appendChild(this._menu);
  }

  _render() {
    const wrap = this.$(".wrap");
    const tabs = this.$(".tabs");
    if (this._error) {
      wrap.innerHTML = `<div class="card">${esc(this._error)}</div>`;
      return;
    }
    const entries = this._data?.entries || [];
    tabs.innerHTML = entries.length > 1
      ? entries.map((e, i) => `<button class="tab ${i === this._idx ? "on" : ""}" data-i="${i}">${esc(e.title)}</button>`).join("")
      : "";
    tabs.querySelectorAll(".tab").forEach((b) =>
      b.addEventListener("click", () => { this._idx = Number(b.dataset.i); this._sig = ""; this._render(); }));
    this.$(".title").textContent = entries.length === 1 ? entries[0].title : "Hekken";

    if (!entries.length) {
      wrap.innerHTML = `<div class="card empty">${this.t("no_gates")}</div>`;
      return;
    }

    wrap.innerHTML = `
      <div class="card hero">
        <div class="visual">${GATE_SVG}</div>
        <div>
          <div class="status"><span class="dot"></span><span class="label"></span></div>
          <div class="sub muted"></div>
          <div class="actions">
            <button class="btn primary big" data-act="open">${svg("up")}${this.t("btn_open")}</button>
            <button class="btn big" data-act="close">${svg("down")}${this.t("btn_close")}</button>
          </div>
          <div class="chips"></div>
        </div>
      </div>
      <div class="fault-slot"></div>
      <div class="grid">
        <div style="display:grid;gap:16px">
          <div class="card"><h2>${svg("cal")}${this.t("week")}</h2><div class="week"></div></div>
          <div class="card">
            <h2>${this.t("rules")}<span class="sp"></span>
              ${this._data.is_admin ? `<button class="btn ghost add">${svg("plus")}${this.t("add_rule")}</button>` : ""}
            </h2>
            <div class="rules"></div>
          </div>
        </div>
        <div class="card settings"></div>
      </div>
      <div class="footer"></div>`;

    wrap.querySelector('[data-act="open"]').addEventListener("click", () => this.call("cover", "open_cover", this.entry.entities.cover));
    wrap.querySelector('[data-act="close"]').addEventListener("click", () => this.call("cover", "close_cover", this.entry.entities.cover));
    wrap.querySelector(".add")?.addEventListener("click", () => this._openDialog(null));

    this._renderSettings();
    this._sig = "";
    this._live();
  }

  // --- live toestand -----------------------------------------------------

  _live() {
    const e = this.entry;
    if (!e || !this.$(".hero")) return;
    const ids = [e.entities.cover, e.entities.fault, e.entities.automatic, e.entities.auto_close_at,
      e.entities.active_rule, e.entities.last_action, ...Object.values(e.entities.rules || {}), ...e.settings.presence_entities];
    const sig = ids.map((id) => { const s = this.st(id); return s ? `${s.state}|${s.last_updated}` : "-"; }).join(",");
    if (sig === this._sig) return;
    this._sig = sig;

    const cover = this.st(e.entities.cover);
    const fault = this.st(e.entities.fault);
    const inFault = fault?.state === "on";
    const state = inFault ? "fault" : !cover || cover.state === "unavailable" || cover.state === "unknown" ? "unavailable" : cover.state;

    const hero = this.$(".hero");
    hero.className = `card hero is-${state}`;
    this.$(".label").textContent = this.t(state) || state;

    const open = this.$('[data-act="open"]');
    const close = this.$('[data-act="close"]');
    const blocked = inFault || state === "unavailable";
    open.disabled = blocked || state === "open" || state === "opening";
    close.disabled = blocked || state === "closed" || state === "closing";

    this._countdown();

    // chips
    const auto = this.st(e.entities.automatic);
    const autoOn = auto?.state === "on";
    const home = e.settings.presence_entities.some((id) => {
      const s = this.st(id);
      if (!s) return false;
      if (["home", "on"].includes(s.state)) return true;
      return id.startsWith("zone.") && Number(s.state) > 0;
    });
    const active = this.st(e.entities.active_rule)?.state;
    const hasActive = active && !["Geen", "unknown", "unavailable"].includes(active);
    const chips = this.$(".chips");
    chips.innerHTML = `
      <button class="chip ${autoOn ? "on" : "off"}" data-chip="auto" ${this._data.is_admin ? "" : "disabled"}>
        ${svg("clock")}${this.t("automatic")}: ${autoOn ? this.t("auto_on") : this.t("auto_off")}
      </button>
      ${e.settings.presence_entities.length ? `<span class="chip">${svg(home ? "home" : "away")}${this.t(home ? "someone_home" : "nobody_home")}</span>` : ""}
      <span class="chip ${hasActive ? "on" : "off"}">${svg("cal")}${hasActive ? `${this.t("active_rule")}: ${esc(active)}` : this.t("none")}</span>`;
    chips.querySelector('[data-chip="auto"]').addEventListener("click", () =>
      this.call("switch", autoOn ? "turn_off" : "turn_on", e.entities.automatic));

    // storing
    const slot = this.$(".fault-slot");
    if (inFault) {
      const since = fault.attributes?.sinds ? new Date(fault.attributes.sinds) : null;
      slot.innerHTML = `
        <div class="card fault">
          <div class="icon">${svg("alert")}</div>
          <div class="txt">
            <b>${this.t("fault_title")}</b>
            <div>${esc(fault.attributes?.reden || "")}</div>
            <div class="small muted">${this.t("fault_body")}${since ? " · " + this.t("since", { t: since.toLocaleString() }) : ""}</div>
          </div>
          <button class="btn danger">${svg("restart")}${this.t("reset")}</button>
        </div>`;
      slot.querySelector("button").addEventListener("click", () => this.call("button", "press", e.entities.reset));
    } else {
      slot.innerHTML = "";
    }

    this._renderWeek();
    this._renderRules();

    // voet
    const last = this.st(e.entities.last_action);
    const lastAt = last?.attributes?.tijdstip ? new Date(last.attributes.tijdstip) : null;
    const via = e.connection.type === "unifi"
      ? this.t("via_unifi", { d: esc(e.connection.door || "") })
      : this.t("via_entity", { e: esc(e.connection.entity_id || "") });
    this.$(".footer").innerHTML = `
      <span>${this.t("last_action")}: <b>${esc(last?.state && last.state !== "unknown" ? last.state : "–")}</b>${lastAt ? ` · ${lastAt.toLocaleString()}` : ""}</span>
      <span>${via} · v${esc(this._data.version)}</span>`;
  }

  _countdown() {
    const e = this.entry;
    const sub = this.$(".sub");
    if (!e || !sub) return;
    const at = this.st(e.entities.auto_close_at)?.state;
    const ts = at && !["unknown", "unavailable"].includes(at) ? new Date(at) : null;
    if (ts && !isNaN(ts)) {
      const left = Math.max(0, Math.round((ts - Date.now()) / 1000));
      const m = Math.floor(left / 60), s = String(left % 60).padStart(2, "0");
      sub.textContent = this.t("closes_in", { t: `${m}:${s}` });
    } else {
      sub.textContent = "";
    }
  }

  // --- week ------------------------------------------------------------

  _segments(rule) {
    const s = toMin(rule.start), e = toMin(rule.end);
    const out = [];
    for (const d of rule.days) {
      const i = DAYS.indexOf(d);
      if (s === e) out.push([i, 0, 1440]);
      else if (s < e) out.push([i, s, e]);
      else { out.push([i, s, 1440]); out.push([(i + 1) % 7, 0, e]); }
    }
    return out;
  }

  _renderWeek() {
    const e = this.entry;
    const box = this.$(".week");
    if (!box) return;
    const rules = e.rules;
    const lanes = Math.max(1, rules.length);
    const bars = DAYS.map(() => []);
    rules.forEach((r, lane) => {
      const on = this.st(e.entities.rules?.[r.id])?.state !== "off";
      const color = COLORS[lane % COLORS.length];
      for (const [d, a, b] of this._segments(r)) {
        const h = 100 / lanes;
        bars[d].push(`<div class="bar ${on ? "" : "off"}" title="${esc(r.name)} · ${hhmm(r.start)}–${hhmm(r.end)}"
          style="left:${(a / 1440) * 100}%;width:${((b - a) / 1440) * 100}%;top:calc(${lane * h}% + 3px);height:calc(${h}% - 6px);background:${color}"></div>`);
      }
    });
    const now = new Date();
    const today = (now.getDay() + 6) % 7;
    const nowPct = ((now.getHours() * 60 + now.getMinutes()) / 1440) * 100;
    box.innerHTML = `
      <div class="hours">${[0, 6, 12, 18, 24].map((h) => `<span style="left:${(h / 24) * 100}%">${String(h).padStart(2, "0")}</span>`).join("")}</div>
      ${DAYS.map((d, i) => `
        <div class="row ${i === today ? "today" : ""}">
          <div class="lbl">${this.t("d_" + d)}</div>
          <div class="track" style="height:${Math.max(30, lanes * 14)}px">${bars[i].join("")}${i === today ? `<div class="nowline" style="left:${nowPct}%" title="${this.t("now")}"></div>` : ""}</div>
        </div>`).join("")}`;
  }

  // --- regels ----------------------------------------------------------

  _daysText(days) {
    if (days.length === 7) return this.t("everyday");
    if (days.join() === DAYS.slice(0, 5).join()) return this.t("workdays");
    if (days.join() === DAYS.slice(5).join()) return this.t("weekend");
    return days.map((d) => this.t("d_" + d)).join(", ");
  }

  _renderRules() {
    const e = this.entry;
    const box = this.$(".rules");
    if (!box) return;
    if (!e.rules.length) {
      box.innerHTML = `<div class="empty">${this.t("no_rules")}</div>`;
      return;
    }
    const admin = this._data.is_admin;
    box.innerHTML = e.rules.map((r, i) => {
      const sw = this.st(e.entities.rules?.[r.id]);
      const on = sw?.state !== "off";
      const tags = [];
      if (r.auto_close) tags.push(this.t("sum_auto", { m: r.auto_close_minutes }));
      if (r.skip_when_home) tags.push(this.t("sum_home"));
      if (r.open_at_start) tags.push(this.t("sum_open"));
      if (r.close_at_end) tags.push(this.t("sum_close"));
      return `
        <div class="rule ${on ? "" : "disabled"}" data-id="${esc(r.id)}">
          <div class="stripe" style="background:${COLORS[i % COLORS.length]}"></div>
          <div>
            <div class="name">${esc(r.name)}</div>
            <div class="meta">${this._daysText(r.days)} · ${hhmm(r.start)}–${hhmm(r.end)}</div>
            <div class="tags">${tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
          </div>
          <div class="right">
            <label class="sw" title="${esc(r.name)}"><input type="checkbox" ${on ? "checked" : ""} ${sw && admin ? "" : "disabled"}><span></span></label>
            ${admin ? `<button class="btn ghost" data-edit title="${this.t("edit")}">${svg("edit")}</button>` : ""}
          </div>
        </div>`;
    }).join("");
    box.querySelectorAll(".rule").forEach((row) => {
      const rule = e.rules.find((r) => r.id === row.dataset.id);
      row.querySelector("input").addEventListener("change", (ev) =>
        this.call("switch", ev.target.checked ? "turn_on" : "turn_off", e.entities.rules[rule.id]));
      row.querySelector("[data-edit]")?.addEventListener("click", () => this._openDialog(rule));
    });
  }

  // --- regel-dialoog -----------------------------------------------------

  _openDialog(rule) {
    const draft = rule
      ? JSON.parse(JSON.stringify(rule))
      : { name: "", days: DAYS.slice(0, 5), start: "08:00:00", end: "17:00:00", auto_close: true,
          auto_close_minutes: 15, skip_when_home: true, open_at_start: false, close_at_end: false };
    const isNew = !rule;
    const overlay = document.createElement("div");
    overlay.className = "overlay";
    this.shadowRoot.appendChild(overlay);

    const opt = (key, title, desc, extra = "") => `
      <div class="opt">
        <div class="t">${title}</div>
        <label class="sw"><input type="checkbox" data-k="${key}" ${draft[key] ? "checked" : ""}><span></span></label>
        <div class="d">${desc}</div>
        ${extra}
      </div>`;

    const render = () => {
      const s = toMin(draft.start), en = toMin(draft.end);
      overlay.innerHTML = `
        <div class="card dialog" role="dialog" aria-modal="true">
          <h2>${this.t(isNew ? "rule_new" : "rule_edit")}</h2>
          <div class="field"><label>${this.t("name")}</label><input type="text" data-f="name" value="${esc(draft.name)}" maxlength="60"></div>
          <div class="field">
            <label>${this.t("days")}</label>
            <div class="daypick">${DAYS.map((d) => `<button type="button" data-day="${d}" class="${draft.days.includes(d) ? "on" : ""}">${this.t("d_" + d)}</button>`).join("")}</div>
            <div class="presets">
              <button type="button" data-preset="work">${this.t("workdays")}</button>
              <button type="button" data-preset="weekend">${this.t("weekend")}</button>
              <button type="button" data-preset="all">${this.t("everyday")}</button>
            </div>
          </div>
          <div class="field">
            <div class="inline">
              <div><label class="flabel">${this.t("from")}</label><input type="time" data-f="start" value="${hhmm(draft.start)}"></div>
              <div><label class="flabel">${this.t("to")}</label><input type="time" data-f="end" value="${hhmm(draft.end)}"></div>
            </div>
            <div class="hint">${s === en ? this.t("allday") : s > en ? this.t("overnight") : ""}</div>
          </div>
          ${opt("auto_close", this.t("act_auto_close"), this.t("act_auto_close_d"),
            draft.auto_close ? `<div class="extra">${this.t("after")}
              <span class="stepper"><button type="button" data-step="-5">−</button><input type="number" data-f="auto_close_minutes" min="1" max="240" value="${draft.auto_close_minutes}"><button type="button" data-step="5">+</button></span>
              ${this.t("minutes")}</div>` : "")}
          ${opt("skip_when_home", this.t("act_skip_home"), this.t("act_skip_home_d"))}
          ${opt("open_at_start", this.t("act_open_start"), this.t("act_open_start_d"))}
          ${opt("close_at_end", this.t("act_close_end"), this.t("act_close_end_d"))}
          <div class="err"></div>
          <div class="foot">
            ${isNew ? "" : `<button class="btn ghost" data-del style="color:var(--hk-bad)">${svg("del")}${this.t("delete")}</button>`}
            <span class="sp"></span>
            <button class="btn" data-cancel>${this.t("cancel")}</button>
            <button class="btn primary" data-save>${this.t("save")}</button>
          </div>
        </div>`;

      overlay.querySelectorAll("[data-f]").forEach((el) =>
        el.addEventListener("input", () => {
          const k = el.dataset.f;
          draft[k] = k === "auto_close_minutes" ? Number(el.value) : el.value;
          if (k === "start" || k === "end") {
            const a = toMin(draft.start), b = toMin(draft.end);
            overlay.querySelector(".hint").textContent = a === b ? this.t("allday") : a > b ? this.t("overnight") : "";
          }
        }));
      overlay.querySelectorAll("[data-day]").forEach((b) =>
        b.addEventListener("click", () => {
          const d = b.dataset.day;
          draft.days = draft.days.includes(d) ? draft.days.filter((x) => x !== d) : DAYS.filter((x) => x === d || draft.days.includes(x));
          b.classList.toggle("on");
        }));
      overlay.querySelectorAll("[data-preset]").forEach((b) =>
        b.addEventListener("click", () => {
          draft.days = { work: DAYS.slice(0, 5), weekend: DAYS.slice(5), all: [...DAYS] }[b.dataset.preset];
          render();
        }));
      overlay.querySelectorAll("[data-k]").forEach((el) =>
        el.addEventListener("change", () => { draft[el.dataset.k] = el.checked; if (el.dataset.k === "auto_close") render(); }));
      overlay.querySelectorAll("[data-step]").forEach((b) =>
        b.addEventListener("click", () => {
          draft.auto_close_minutes = Math.min(240, Math.max(1, Number(draft.auto_close_minutes || 0) + Number(b.dataset.step)));
          overlay.querySelector('[data-f="auto_close_minutes"]').value = draft.auto_close_minutes;
        }));
      overlay.querySelector("[data-cancel]").addEventListener("click", close);
      overlay.querySelector("[data-del]")?.addEventListener("click", async () => {
        if (!confirm(this.t("confirm_delete", { n: rule.name }))) return;
        if (await this._saveRules(this.entry.rules.filter((r) => r.id !== rule.id))) close();
      });
      overlay.querySelector("[data-save]").addEventListener("click", async () => {
        const err = overlay.querySelector(".err");
        draft.name = draft.name.trim();
        if (!draft.name) return (err.textContent = this.t("err_name"));
        if (!draft.days.length) return (err.textContent = this.t("err_days"));
        if (!draft.auto_close && !draft.open_at_start && !draft.close_at_end) return (err.textContent = this.t("err_action"));
        const rules = isNew ? [...this.entry.rules, draft] : this.entry.rules.map((r) => (r.id === rule.id ? draft : r));
        if (await this._saveRules(rules)) close();
      });
      if (isNew) overlay.querySelector('[data-f="name"]').focus();
    };

    const onKey = (ev) => { if (ev.key === "Escape") close(); };
    const close = () => { overlay.remove(); document.removeEventListener("keydown", onKey); };
    overlay.addEventListener("click", (ev) => { if (ev.target === overlay) close(); });
    document.addEventListener("keydown", onKey);
    render();
  }

  // --- instellingen ------------------------------------------------------

  _renderSettings() {
    const box = this.$(".settings");
    const e = this.entry;
    if (!box || !e) return;
    const admin = this._data.is_admin;
    const d = this._settingsDraft || (this._settingsDraft = JSON.parse(JSON.stringify(e.settings)));
    const people = Object.keys(this._hass.states)
      .filter((id) => id.startsWith("person.") || id === "zone.home" || d.presence_entities.includes(id))
      .sort();
    const notifies = Object.keys(this._hass.services?.notify || {})
      .filter((s) => !["send_message", "persistent_notification"].includes(s))
      .map((s) => `notify.${s}`);
    const name = (id) => this._hass.states[id]?.attributes?.friendly_name || id;
    const dis = admin ? "" : "disabled";

    box.innerHTML = `
      <h2>${this.t("settings")}</h2>
      ${admin ? "" : `<p class="small muted">${this.t("read_only")}</p>`}
      <div class="field">
        <label>${this.t("travel_time")}</label>
        <div class="stepper"><button type="button" data-s="travel_time" data-d="-5" ${dis}>−</button><input type="number" data-n="travel_time" min="5" max="180" value="${d.travel_time}" ${dis}><button type="button" data-s="travel_time" data-d="5" ${dis}>+</button> ${this.t("sec")}</div>
        <div class="hint">${this.t("travel_time_d")}</div>
      </div>
      <div class="field">
        <label>${this.t("retries")}</label>
        <div class="stepper"><button type="button" data-s="retries" data-d="-1" ${dis}>−</button><input type="number" data-n="retries" min="0" max="3" value="${d.retries}" ${dis}><button type="button" data-s="retries" data-d="1" ${dis}>+</button></div>
        <div class="hint">${this.t("retries_d")}</div>
      </div>
      <div class="field">
        <label>${this.t("retry_delay")}</label>
        <div class="stepper"><button type="button" data-s="retry_delay" data-d="-1" ${dis}>−</button><input type="number" data-n="retry_delay" min="1" max="60" step="0.5" value="${d.retry_delay}" ${dis}><button type="button" data-s="retry_delay" data-d="1" ${dis}>+</button> ${this.t("minutes")}</div>
        <div class="hint">${this.t("retry_delay_d")}</div>
      </div>
      <div class="field">
        <label>${this.t("presence")}</label>
        <div class="pchips">${people.map((id) => `<button type="button" data-p="${esc(id)}" class="${d.presence_entities.includes(id) ? "on" : ""}" ${dis}>${esc(name(id))}</button>`).join("")}</div>
        <div class="hint">${this.t("presence_d")}</div>
      </div>
      <div class="field">
        <label>${this.t("notify")}</label>
        <select data-notify ${dis}>
          <option value="">${this.t("notify_none")}</option>
          ${[...new Set([...notifies, d.notify_service].filter(Boolean))].map((s) => `<option value="${esc(s)}" ${s === d.notify_service ? "selected" : ""}>${esc(s)}</option>`).join("")}
        </select>
      </div>
      <div class="opt" style="border-top:0;padding-top:0">
        <div class="t">${this.t("inverted")}</div>
        <label class="sw"><input type="checkbox" data-inv ${d.sensor_inverted ? "checked" : ""} ${dis}><span></span></label>
        <div class="d">${this.t("inverted_d")}</div>
      </div>
      ${admin ? `<div class="foot" style="display:flex;justify-content:flex-end;margin-top:12px"><button class="btn primary" data-save-settings>${this.t("save")}</button></div>` : ""}`;

    if (!admin) return;
    const limits = { travel_time: [5, 180], retries: [0, 3], retry_delay: [1, 60] };
    box.querySelectorAll("[data-n]").forEach((el) => el.addEventListener("input", () => { d[el.dataset.n] = Number(el.value); }));
    box.querySelectorAll("[data-s]").forEach((b) =>
      b.addEventListener("click", () => {
        const k = b.dataset.s, [lo, hi] = limits[k];
        d[k] = Math.min(hi, Math.max(lo, Number(d[k]) + Number(b.dataset.d)));
        box.querySelector(`[data-n="${k}"]`).value = d[k];
      }));
    box.querySelectorAll("[data-p]").forEach((b) =>
      b.addEventListener("click", () => {
        const id = b.dataset.p;
        d.presence_entities = d.presence_entities.includes(id) ? d.presence_entities.filter((x) => x !== id) : [...d.presence_entities, id];
        b.classList.toggle("on");
      }));
    box.querySelector("[data-notify]").addEventListener("change", (ev) => { d.notify_service = ev.target.value; });
    box.querySelector("[data-inv]").addEventListener("change", (ev) => { d.sensor_inverted = ev.target.checked; });
    box.querySelector("[data-save-settings]").addEventListener("click", async () => {
      try {
        await this._hass.callWS({ type: "hekken/save_settings", entry_id: e.entry_id, settings: d });
        this.toast(this.t("saved"));
        this._load(1500);
      } catch (err) {
        this.toast(err?.message || String(err), true);
      }
    });
  }
}

customElements.define("hekken-panel", HekkenPanel);
