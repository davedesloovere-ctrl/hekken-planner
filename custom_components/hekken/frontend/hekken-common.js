// Gedeeld tussen de Hekken-pagina en de Hekken-kaart.

export const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
export const COLORS = ["#4f8cff", "#2bb673", "#f59e0b", "#a855f7", "#ec4899", "#14b8a6", "#ef4444"];

export const STR = {
  nl: {
    loading: "Laden…",
    no_gates: "Nog geen hekken gekoppeld. Voeg de integratie Hekkenplanner toe via Instellingen → Apparaten en diensten.",
    closed: "Dicht", open: "Open", opening: "Gaat open…", closing: "Gaat dicht…",
    unavailable: "Sensor onbereikbaar", fault: "FOUT",
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
    at_start: "Bij het begin", at_end: "Bij het einde",
    act_none: "Niets", act_open: "Openen", act_close: "Sluiten",
    at_start_d: "Wat de poort doet op het beginuur.", at_end_d: "Wat de poort doet op het einduur.",
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
    sum_auto: "sluit na {m} min", sum_home: "niet als iemand thuis is", sum_start_open: "open bij begin", sum_start_close: "dicht bij begin", sum_end_open: "open bij einde", sum_end_close: "dicht bij einde",
    now: "nu",
    pos_open: "Poort staat open", pos_closed: "Poort staat dicht", pos_unknown: "Stand onbekend",
    today: "Vandaag", card_today: "Tijdlijn van vandaag tonen", card_last: "Laatste actie tonen",
    gate: "Poort", card_name: "Naam op de kaart", card_chips: "Chips tonen (automatisch, thuis, regel)",
  },
  en: {
    loading: "Loading…",
    no_gates: "No gate connected yet. Add the Hekkenplanner integration via Settings → Devices & services.",
    closed: "Closed", open: "Open", opening: "Opening…", closing: "Closing…",
    unavailable: "Sensor unavailable", fault: "FAULT",
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
    at_start: "At the start", at_end: "At the end",
    act_none: "Nothing", act_open: "Open", act_close: "Close",
    at_start_d: "What the gate does at the start time.", at_end_d: "What the gate does at the end time.",
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
    sum_auto: "closes after {m} min", sum_home: "not when someone is home", sum_start_open: "opens at start", sum_start_close: "closes at start", sum_end_open: "opens at end", sum_end_close: "closes at end",
    now: "now",
    pos_open: "Gate is open", pos_closed: "Gate is closed", pos_unknown: "Position unknown",
    today: "Today", card_today: "Show today's timeline", card_last: "Show last action",
    gate: "Gate", card_name: "Name on the card", card_chips: "Show chips (automatic, home, rule)",
  },
};

export const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export const toMin = (hhmm) => {
  const [h, m] = String(hhmm).split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

export const hhmm = (v) => String(v || "").slice(0, 5);

export const ICON = {
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
export const svg = (name) => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICON[name]}"/></svg>`;

export const GATE_SVG = `
<svg class="gate-svg" viewBox="0 0 280 150" aria-hidden="true">
  <path class="swing" d="M40 132 A100 18 0 0 0 138 150 M240 132 A100 18 0 0 1 142 150" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4 5" opacity=".25"/>
  <rect x="10" y="128" width="260" height="4" rx="2" fill="currentColor" opacity=".18"/>
    <g class="leaf left">
      <path d="M40 60 Q90 46 140 60" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
      <rect x="40" y="60" width="100" height="62" rx="3" fill="none" stroke="currentColor" stroke-width="5"/>
      <g stroke="currentColor" stroke-width="3.5" opacity=".6">
        <line x1="60" y1="56" x2="60" y2="120"/><line x1="80" y1="53" x2="80" y2="120"/>
        <line x1="100" y1="53" x2="100" y2="120"/><line x1="120" y1="56" x2="120" y2="120"/>
      </g>
      <line x1="42" y1="91" x2="138" y2="91" stroke="currentColor" stroke-width="3" opacity=".45"/>
    </g>
    <g class="leaf right">
      <path d="M140 60 Q190 46 240 60" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
      <rect x="140" y="60" width="100" height="62" rx="3" fill="none" stroke="currentColor" stroke-width="5"/>
      <g stroke="currentColor" stroke-width="3.5" opacity=".6">
        <line x1="160" y1="56" x2="160" y2="120"/><line x1="180" y1="53" x2="180" y2="120"/>
        <line x1="200" y1="53" x2="200" y2="120"/><line x1="220" y1="56" x2="220" y2="120"/>
      </g>
      <line x1="142" y1="91" x2="238" y2="91" stroke="currentColor" stroke-width="3" opacity=".45"/>
    </g>
  <rect x="28" y="44" width="12" height="88" rx="2" fill="currentColor" opacity=".9"/>
  <rect x="240" y="44" width="12" height="88" rx="2" fill="currentColor" opacity=".9"/>
  <circle class="lamp" cx="34" cy="34" r="7"/>
  <g class="badge badge-fault">
    <circle cx="140" cy="30" r="20"/>
    <rect x="137" y="17" width="6" height="17" rx="3" fill="#fff"/><circle cx="140" cy="41" r="3.5" fill="#fff"/>
  </g>
  <g class="badge badge-unknown">
    <circle cx="140" cy="30" r="20"/>
    <text x="140" y="38" text-anchor="middle" font-size="24" font-weight="700" fill="#fff">?</text>
  </g>
</svg>`;

export const TOKENS_CSS = `
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
`;

export const SHARED_CSS = `
* { box-sizing: border-box; }
.i { width: 18px; height: 18px; fill: currentColor; flex: none; }
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
.gate-svg { width: 100%; max-width: 280px; height: auto; display: block; margin: 0 auto; overflow: visible; }
.leaf { transform-box: view-box; transition: transform 2.4s cubic-bezier(.45,.05,.25,1), color .4s; }
.leaf.left { transform-origin: 40px 91px; }
.leaf.right { transform-origin: 240px 91px; }
/* Een vleugel die opendraait, zie je van voren steeds smaller worden. */
.pos-open .leaf.left { transform: scaleX(.16) skewY(14deg); }
.pos-open .leaf.right { transform: scaleX(.16) skewY(-14deg); }
.pos-opening .leaf.left, .pos-closing .leaf.left { transform: scaleX(.6) skewY(7deg); }
.pos-opening .leaf.right, .pos-closing .leaf.right { transform: scaleX(.6) skewY(-7deg); }
.is-fault .leaf { color: var(--hk-bad); }
.is-unavailable .gate-svg { opacity: .45; }
.badge { opacity: 0; transform-box: fill-box; transform-origin: center; transform: scale(.6); transition: opacity .3s, transform .3s; }
.badge circle:first-child { fill: var(--hk-bad); }
.badge-unknown circle:first-child { fill: var(--hk-muted); }
.is-fault .badge-fault, .is-unavailable .badge-unknown { opacity: 1; transform: none; }
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

`;

export function tr(hass, key, vars) {
  const lang = (hass?.locale?.language || hass?.language || "en").startsWith("nl") ? "nl" : "en";
  let s = STR[lang][key] ?? STR.en[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(v);
  return s;
}

// Alles wat de kaart en de pagina live tonen, uit de entiteiten van één hekken.
export function gateView(hass, entry) {
  const st = (id) => (id ? hass.states[id] : undefined);
  const cover = st(entry.entities.cover);
  const fault = st(entry.entities.fault);
  const inFault = fault?.state === "on";
  const state = inFault ? "fault"
    : !cover || cover.state === "unavailable" || cover.state === "unknown" ? "unavailable" : cover.state;
  // De echte stand, ook tijdens een storing: zo zie je of de poort open of dicht staat.
  const pos = !cover || ["unavailable", "unknown"].includes(cover.state) ? "unknown" : cover.state;
  const home = entry.settings.presence_entities.some((id) => {
    const s = st(id);
    if (!s) return false;
    if (["home", "on"].includes(s.state)) return true;
    return id.startsWith("zone.") && Number(s.state) > 0;
  });
  const active = st(entry.entities.active_rule)?.state;
  const at = st(entry.entities.auto_close_at)?.state;
  const closeAt = at && !["unknown", "unavailable"].includes(at) ? new Date(at) : null;
  return {
    state, pos, inFault, fault,
    autoOn: st(entry.entities.automatic)?.state === "on",
    home, hasPresence: entry.settings.presence_entities.length > 0,
    active, hasActive: !!active && !["Geen", "unknown", "unavailable"].includes(active),
    closeAt: closeAt && !isNaN(closeAt) ? closeAt : null,
  };
}

export function countdown(closeAt) {
  if (!closeAt) return "";
  const left = Math.max(0, Math.round((closeAt - Date.now()) / 1000));
  return `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
}

// Tekst onder de status: aftellen, of bij een storing de echte stand.
export function subText(hass, view) {
  if (view.inFault) return tr(hass, `pos_${["open", "closed"].includes(view.pos) ? view.pos : "unknown"}`);
  return view.closeAt ? tr(hass, "closes_in", { t: countdown(view.closeAt) }) : "";
}

// Oude regels kenden enkel open_at_start en close_at_end.
export const startAction = (r) => (["none", "open", "close"].includes(r.start_action) ? r.start_action : r.open_at_start ? "open" : "none");
export const endAction = (r) => (["none", "open", "close"].includes(r.end_action) ? r.end_action : r.close_at_end ? "close" : "none");
