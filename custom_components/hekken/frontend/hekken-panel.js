// Hekkenplanner: de pagina in de zijbalk van Home Assistant.
// Geen build-stap, geen externe bibliotheken; gedeelde stukken in hekken-common.js.

import { COLORS, DAYS, GATE_SVG, SHARED_CSS, TOKENS_CSS, endAction, esc, gateView, hhmm, startAction, subText, svg, toMin, tr } from "./hekken-common.js?v=0.3.1";

const CSS = `
:host {
${TOKENS_CSS}  display: block;
  min-height: 100vh;
  background: var(--primary-background-color, #f5f5f5);
  color: var(--hk-text);
  font-family: var(--paper-font-body1_-_font-family, Roboto, system-ui, sans-serif);
}
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
.grid { display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr); }
.grid > * { min-width: 0; }
@media (min-width: 900px) { .grid { grid-template-columns: minmax(0, 1.1fr) minmax(0, .9fr); align-items: start; } }
.card {
  background: var(--hk-card); border-radius: var(--hk-radius);
  box-shadow: var(--ha-card-box-shadow, 0 1px 3px rgba(0,0,0,.08));
  border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--hk-line));
  padding: 20px;
}
h2 { font-size: 16px; font-weight: 600; margin: 0 0 14px; display: flex; align-items: center; gap: 8px; }
h2 .sp { flex: 1; }
${SHARED_CSS}
/* instellingen */
.stabs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; padding: 4px; border-radius: 14px; background: var(--hk-soft); margin-bottom: 18px; }
.stabs button { font: inherit; font-size: 13px; font-weight: 600; border: 0; background: transparent; color: var(--hk-muted); border-radius: 10px; padding: 9px 6px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px; transition: background .2s, color .2s; }
.stabs button .i { width: 20px; height: 20px; }
.stabs button.on { background: var(--hk-card); color: var(--hk-accent); box-shadow: 0 1px 3px rgba(0,0,0,.12); }
.spane { animation: fade .2s ease-out; }
.lead { margin: 0 0 14px; font-size: 13px; color: var(--hk-muted); line-height: 1.45; }
.sl .slhead { display: flex; align-items: baseline; justify-content: space-between; }
.sl output { font-weight: 700; font-size: 15px; color: var(--hk-accent); font-variant-numeric: tabular-nums; }
input[type=range] {
  -webkit-appearance: none; appearance: none; width: 100%; height: 6px; border-radius: 3px; margin: 10px 0 4px; cursor: pointer;
  background: linear-gradient(to right, var(--hk-accent) var(--p, 50%), var(--hk-soft) var(--p, 50%));
}
input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 22px; height: 22px; border-radius: 50%; background: var(--hk-card); border: 3px solid var(--hk-accent); box-shadow: 0 1px 4px rgba(0,0,0,.25); transition: transform .1s; }
input[type=range]::-webkit-slider-thumb:active { transform: scale(1.15); }
input[type=range]::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: var(--hk-card); border: 3px solid var(--hk-accent); }
input[type=range]:disabled { opacity: .5; cursor: not-allowed; }
.seg.big { display: grid; grid-template-columns: repeat(4, 1fr); }
.seg.big button { padding: 10px 0; font-size: 15px; font-weight: 700; }
.flow { border: 1px dashed var(--hk-line); border-radius: 14px; padding: 12px 14px; margin-bottom: 18px; }
.flow-t { font-size: 12px; font-weight: 600; color: var(--hk-muted); margin-bottom: 8px; }
.flow-s { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.fs { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600; padding: 5px 10px; border-radius: 999px; }
.fs .i { width: 14px; height: 14px; }
.fs.pulse { background: color-mix(in srgb, var(--hk-accent) 15%, transparent); color: var(--hk-accent); }
.fs.wait { background: var(--hk-soft); color: var(--hk-muted); font-weight: 500; }
.fs.fault { background: color-mix(in srgb, var(--hk-bad) 15%, transparent); color: var(--hk-bad); }
.fa { width: 14px; height: 2px; background: var(--hk-line); position: relative; }
.fa::after { content: ""; position: absolute; right: -1px; top: -3px; border: 4px solid transparent; border-left-color: var(--hk-line); border-right: 0; }
.people { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
.person {
  font: inherit; text-align: left; display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 14px; cursor: pointer;
  border: 2px solid var(--hk-line); background: transparent; color: var(--hk-text); position: relative; transition: border-color .2s, background .2s;
}
.person.on { border-color: var(--hk-accent); background: color-mix(in srgb, var(--hk-accent) 8%, transparent); }
.person .av { width: 40px; height: 40px; border-radius: 50%; background: var(--hk-soft); display: grid; place-items: center; font-weight: 700; position: relative; flex: none; }
.person .av img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
.person .st { position: absolute; right: -1px; bottom: -1px; width: 12px; height: 12px; border-radius: 50%; border: 2px solid var(--hk-card); background: var(--hk-muted); }
.person .st.home { background: var(--hk-ok); }
.person .pn { display: grid; min-width: 0; }
.person .pn b { font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.person .pn small { font-size: 12px; color: var(--hk-muted); }
.person .ck { position: absolute; top: 6px; right: 6px; width: 18px; height: 18px; border-radius: 50%; background: var(--hk-accent); color: #fff; display: grid; place-items: center; opacity: 0; transform: scale(.5); transition: all .2s; }
.person .ck .i { width: 12px; height: 12px; }
.person.on .ck { opacity: 1; transform: none; }
.devs { display: grid; gap: 8px; }
.dev { display: flex; align-items: center; gap: 12px; padding: 12px; border: 2px solid var(--hk-line); border-radius: 14px; cursor: pointer; transition: border-color .2s, background .2s; outline: none; }
.dev:focus-visible { box-shadow: 0 0 0 3px color-mix(in srgb, var(--hk-accent) 35%, transparent); }
.dev.on { border-color: var(--hk-accent); background: color-mix(in srgb, var(--hk-accent) 8%, transparent); }
.dev .di { width: 36px; height: 36px; border-radius: 10px; background: var(--hk-soft); display: grid; place-items: center; flex: none; color: var(--hk-muted); }
.dev.on .di { background: var(--hk-accent); color: #fff; }
.dev .dn { flex: 1; display: grid; min-width: 0; }
.dev .dn b { font-size: 14px; }
.dev .dn b.cap { text-transform: capitalize; }
.dev .dn small { font-size: 11px; color: var(--hk-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dev .radio { width: 20px; height: 20px; border-radius: 50%; border: 2px solid var(--hk-line); flex: none; position: relative; }
.dev.on .radio { border-color: var(--hk-accent); }
.dev.on .radio::after { content: ""; position: absolute; inset: 3px; border-radius: 50%; background: var(--hk-accent); }
.btn.small { padding: 6px 10px; font-size: 12px; border-radius: 9px; }
.btn.small .i, .btn.small svg { width: 14px; height: 14px; }
.wh { grid-template-columns: minmax(0, 1fr); border-radius: 14px; padding: 14px; background: var(--hk-soft); margin-bottom: 18px; display: grid; gap: 10px; }
.wh-head { display: flex; align-items: center; gap: 8px; font-size: 14px; }
.wh-status { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--hk-muted); }
.wh-status i { width: 8px; height: 8px; border-radius: 50%; background: var(--hk-muted); flex: none; }
.wh-status.ok i { background: var(--hk-ok); }
.wh-status.live { color: var(--hk-bad); font-weight: 600; }
.wh-status.live i { background: var(--hk-bad); animation: blink 1s steps(2, start) infinite; }
.wh-url { display: flex; gap: 8px; align-items: center; min-width: 0; }
.wh-url code { flex: 1; min-width: 0; font-size: 12px; padding: 9px 10px; border-radius: 10px; background: var(--hk-card); border: 1px solid var(--hk-line); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.howto summary { cursor: pointer; font-size: 13px; color: var(--hk-accent); font-weight: 600; }
.howto ol { margin: 8px 0 0; padding-left: 20px; font-size: 13px; line-height: 1.6; }
input[type=search] { font: inherit; color: var(--hk-text); background: var(--hk-soft); border: 1px solid var(--hk-line); border-radius: 10px; padding: 9px 12px; width: 100%; }
.linkbtn { font: inherit; font-size: 12px; background: none; border: 0; color: var(--hk-accent); cursor: pointer; padding: 4px 0; justify-self: start; }
.warnbox { display: grid; grid-template-columns: auto 1fr auto; gap: 12px; align-items: start; padding: 14px; border-radius: 14px; border: 1px solid color-mix(in srgb, var(--hk-warn) 50%, transparent); background: color-mix(in srgb, var(--hk-warn) 10%, transparent); }
.warnbox .wi { color: var(--hk-warn); }
.warnbox .wi .i { width: 22px; height: 22px; }
.warnbox b { font-size: 14px; }
.warnbox > div { min-width: 0; }
.warnbox .d { font-size: 12px; color: var(--hk-muted); margin-top: 2px; }
.savebar {
  position: sticky; bottom: 12px; z-index: 4; margin-top: 18px; display: flex; align-items: center; gap: 10px;
  padding: 10px 10px 10px 16px; border-radius: 14px; background: var(--hk-card); font-size: 13px; font-weight: 600;
  border: 1px solid var(--hk-line); box-shadow: 0 8px 24px rgba(0,0,0,.18); animation: pop .2s ease-out;
}
.savebar[hidden] { display: none; }
.savebar .sp { flex: 1; }
.pulse-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--hk-warn); box-shadow: 0 0 0 0 var(--hk-warn); animation: ring 1.6s infinite; }
@keyframes ring { 70% { box-shadow: 0 0 0 8px transparent; } }

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
.opt .d { font-size: 12px; color: var(--hk-muted); grid-column: 1 / -1; }
.opt .extra { grid-column: 1 / -1; display: flex; align-items: center; gap: 8px; font-size: 14px; }
.opt .extra input { width: 90px; }
.seg { display: inline-flex; border: 1px solid var(--hk-line); border-radius: 10px; overflow: hidden; }
.seg button { font: inherit; font-size: 13px; padding: 7px 12px; border: 0; background: transparent; color: var(--hk-muted); cursor: pointer; }
.seg button + button { border-left: 1px solid var(--hk-line); }
.seg button.on { background: var(--hk-accent); color: var(--text-primary-color, #fff); }
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
    return tr(this._hass, key, vars);
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
    const ids = [e.entities.cover, e.entities.fault, e.entities.obstacle, e.entities.automatic, e.entities.auto_close_at,
      e.entities.active_rule, e.entities.last_action, ...Object.values(e.entities.rules || {}), ...e.settings.presence_entities];
    const sig = ids.map((id) => { const s = this.st(id); return s ? `${s.state}|${s.last_updated}` : "-"; }).join(",");
    if (sig === this._sig) return;
    this._sig = sig;

    const v = gateView(this._hass, e);
    const { state, inFault, fault, autoOn, home, active, hasActive, obstacle } = v;

    const hero = this.$(".hero");
    hero.className = `card hero is-${state} pos-${v.pos}`;
    this.$(".label").textContent = this.t(state) || state;

    const open = this.$('[data-act="open"]');
    const close = this.$('[data-act="close"]');
    const blocked = inFault || state === "unavailable";
    open.disabled = blocked || state === "open" || state === "opening";
    close.disabled = blocked || state === "closed" || state === "closing";

    this._countdown();

    // chips
    const chips = this.$(".chips");
    chips.innerHTML = `
      ${obstacle ? `<span class="chip warn">${svg("motion")}${this.t("obstacle")}</span>` : ""}
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
    this._settingsLive();

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
    sub.textContent = subText(this._hass, gateView(this._hass, e));
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
      if (startAction(r) !== "none") tags.push(this.t(`sum_start_${startAction(r)}`));
      if (endAction(r) !== "none") tags.push(this.t(`sum_end_${endAction(r)}`));
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
      ? { ...JSON.parse(JSON.stringify(rule)), start_action: startAction(rule), end_action: endAction(rule) }
      : { name: "", days: DAYS.slice(0, 5), start: "08:00:00", end: "17:00:00", auto_close: true,
          auto_close_minutes: 15, skip_when_home: true, start_action: "none", end_action: "none" };
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

    const seg = (key, title, desc) => `
      <div class="opt">
        <div class="t">${title}</div>
        <div class="seg">${["none", "open", "close"].map((a) =>
          `<button type="button" data-seg="${key}" data-v="${a}" class="${draft[key] === a ? "on" : ""}">${this.t("act_" + a)}</button>`).join("")}</div>
        <div class="d">${desc}</div>
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
          ${seg("start_action", this.t("at_start"), this.t("at_start_d"))}
          ${seg("end_action", this.t("at_end"), this.t("at_end_d"))}
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
      overlay.querySelectorAll("[data-seg]").forEach((b) =>
        b.addEventListener("click", () => {
          draft[b.dataset.seg] = b.dataset.v;
          overlay.querySelectorAll(`[data-seg="${b.dataset.seg}"]`).forEach((x) => x.classList.toggle("on", x === b));
        }));
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
        if (!draft.auto_close && draft.start_action === "none" && draft.end_action === "none") return (err.textContent = this.t("err_action"));
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
    const d = this._settingsDraft || (this._settingsDraft = this._settingsBase(e));
    const tab = this._settingsTab || "gate";
    const tabs = [["gate", "tune"], ["home", "home"], ["notify", "bell"], ["safety", "shield"]];
    box.innerHTML = `
      <h2>${this.t("settings")}</h2>
      ${admin ? "" : `<p class="small muted">${this.t("read_only")}</p>`}
      <div class="stabs" role="tablist">${tabs.map(([k, ic]) =>
        `<button type="button" role="tab" data-tab="${k}" class="${k === tab ? "on" : ""}">${svg(ic)}<span>${this.t("tab_" + k)}</span></button>`).join("")}</div>
      <div class="spane">${this._settingsPane(tab, d, admin ? "" : "disabled")}</div>
      <div class="savebar" hidden>
        <span class="pulse-dot"></span><span>${this.t("unsaved")}</span><span class="sp"></span>
        <button class="btn ghost" data-reset>${this.t("cancel")}</button>
        <button class="btn primary" data-save-settings>${svg("check")}${this.t("save")}</button>
      </div>`;
    box.querySelectorAll("[data-tab]").forEach((b) =>
      b.addEventListener("click", () => { this._settingsTab = b.dataset.tab; this._renderSettings(); }));
    if (admin) this._bindSettings(box, d, e);
    this._settingsLive();
    this._markDirty();
  }

  _settingsBase(e) {
    return { obstacle_entities: [], obstacle_hold: 60, obstacle_stop: false, ...JSON.parse(JSON.stringify(e.settings)) };
  }

  _markDirty() {
    const bar = this.$(".settings .savebar");
    if (!bar || !this.entry) return;
    bar.hidden = JSON.stringify(this._settingsDraft) === JSON.stringify(this._settingsBase(this.entry));
  }

  _slider(k, label, hint, min, max, step, unit, d, dis) {
    const pct = ((d[k] - min) / (max - min)) * 100;
    return `
      <div class="field sl">
        <div class="slhead"><label>${label}</label><output data-out="${k}">${d[k]} ${unit}</output></div>
        <input type="range" data-r="${k}" data-unit="${unit}" min="${min}" max="${max}" step="${step}" value="${d[k]}" style="--p:${pct}%" ${dis}>
        <div class="hint">${hint}</div>
      </div>`;
  }

  _flowHtml(d) {
    const parts = [];
    for (let i = 0; i <= d.retries; i++) {
      const last = i === d.retries;
      parts.push(`<span class="fs pulse">${svg("send")}${this.t("flow_pulse")} ${i + 1}</span>`);
      parts.push(`<span class="fa"></span><span class="fs wait">${this.t("flow_watch", { t: last ? `${d.travel_time + 10} s` : `${d.retry_delay} min` })}</span><span class="fa"></span>`);
    }
    parts.push(`<span class="fs fault">${svg("alert")}${this.t("fault")}</span>`);
    return `<div class="flow"><div class="flow-t">${this.t("flow_title")}</div><div class="flow-s">${parts.join("")}</div></div>`;
  }

  _isHome(id) {
    const s = this.st(id);
    if (!s) return false;
    if (["home", "on"].includes(s.state)) return true;
    return id.startsWith("zone.") && Number(s.state) > 0;
  }

  _obstacleCandidates(d) {
    const e = this.entry;
    const q = (this._oSearch || "").toLowerCase();
    const name = (id) => this.st(id)?.attributes?.friendly_name || id;
    return Object.entries(this._hass.states)
      .filter(([id, s]) => {
        if (!id.startsWith("binary_sensor.") || id === e.entities.obstacle || id === e.entities.fault) return false;
        if (d.obstacle_entities.includes(id)) return true;
        const camera = /(person|vehicle|animal|object)/.test(id) && !/(tamper|interference|magnetic|battery|problem)/.test(id);
        const motion = ["motion", "occupancy", "presence"].includes(s.attributes?.device_class);
        return camera || (this._oAll && motion);
      })
      .map(([id]) => id)
      .filter((id) => !q || id.includes(q) || name(id).toLowerCase().includes(q))
      .sort((a, b) => name(a).localeCompare(name(b)));
  }

  _settingsPane(tab, d, dis) {
    const name = (id) => this.st(id)?.attributes?.friendly_name || id;
    if (tab === "gate") {
      return `
        ${this._flowHtml(d)}
        ${this._slider("travel_time", this.t("travel_time"), this.t("travel_time_d"), 5, 180, 5, "s", d, dis)}
        <div class="field">
          <label>${this.t("retries")}</label>
          <div class="seg big">${[0, 1, 2, 3].map((n) => `<button type="button" data-retries="${n}" class="${d.retries === n ? "on" : ""}" ${dis}>${n}</button>`).join("")}</div>
          <div class="hint">${this.t("retries_d")}</div>
        </div>
        ${this._slider("retry_delay", this.t("retry_delay"), this.t("retry_delay_d"), 1, 30, 0.5, "min", d, dis)}
        <div class="opt">
          <div class="t">${this.t("inverted")}</div>
          <label class="sw"><input type="checkbox" data-inv ${d.sensor_inverted ? "checked" : ""} ${dis}><span></span></label>
          <div class="d">${this.t("inverted_d")}</div>
        </div>`;
    }
    if (tab === "home") {
      const people = Object.keys(this._hass.states)
        .filter((id) => id.startsWith("person.") || id === "zone.home" || d.presence_entities.includes(id))
        .sort((a, b) => (a.startsWith("person.") ? 0 : 1) - (b.startsWith("person.") ? 0 : 1) || name(a).localeCompare(name(b)));
      return `
        <p class="lead">${this.t("presence_d")}</p>
        <div class="people">${people.map((id) => {
          const pic = this.st(id)?.attributes?.entity_picture;
          const initial = esc(name(id).trim().charAt(0).toUpperCase() || "?");
          return `
            <button type="button" class="person ${d.presence_entities.includes(id) ? "on" : ""}" data-p="${esc(id)}" ${dis}>
              <span class="av">${pic ? `<img src="${esc(pic)}" alt="">` : initial}<i class="st" data-pst="${esc(id)}"></i></span>
              <span class="pn"><b>${esc(name(id))}</b><small data-pstate="${esc(id)}"></small></span>
              <span class="ck">${svg("check")}</span>
            </button>`;
        }).join("")}</div>`;
    }
    if (tab === "notify") {
      const services = Object.keys(this._hass.services?.notify || {})
        .filter((s) => !["send_message", "persistent_notification", "notify"].includes(s))
        .map((s) => `notify.${s}`);
      if (d.notify_service && !services.includes(d.notify_service)) services.push(d.notify_service);
      const label = (svc) => svc.replace(/^notify\./, "").replace(/^mobile_app_/, "").replace(/_/g, " ");
      const row = (svc, icon, title, sub, cap = true) => `
        <div class="dev ${d.notify_service === svc ? "on" : ""}" data-nt="${esc(svc)}" role="radio" aria-checked="${d.notify_service === svc}" tabindex="0">
          <span class="di">${svg(icon)}</span>
          <span class="dn"><b class="${cap ? "cap" : ""}">${esc(title)}</b><small>${esc(sub)}</small></span>
          ${svc ? `<button type="button" class="btn ghost small" data-test="${esc(svc)}" ${dis}>${svg("send")}${this.t("test")}</button>` : ""}
          <span class="radio"></span>
        </div>`;
      return `
        <p class="lead">${this.t("notify_d")}</p>
        <div class="devs">
          ${row("", "bell", this.t("notify_ha"), this.t("notify_ha_d"), false)}
          ${services.map((svc) => row(svc, svc.includes("mobile_app") ? "phone" : "send", label(svc), svc)).join("")}
        </div>`;
    }
    const e = this.entry;
    return `
      <p class="lead">${this.t("safety_d")}</p>
      ${e.webhook_url ? `
      <div class="wh">
        <div class="wh-head">${svg("motion")}<b>${this.t("webhook")}</b></div>
        <div class="wh-status" data-whs></div>
        <div class="wh-url"><code>${esc(e.webhook_url)}</code><button type="button" class="btn small" data-copy>${svg("copy")}${this.t("copy")}</button></div>
        <details class="howto"><summary>${this.t("howto")}</summary>
          <ol><li>${this.t("howto_1")}</li><li>${this.t("howto_2")}</li><li>${this.t("howto_3")}</li><li>${this.t("howto_4")}</li></ol>
        </details>
      </div>` : ""}
      <div class="field">
        <label>${this.t("obstacle_entities")}</label>
        <input type="search" data-osearch placeholder="${this.t("search")}" value="${esc(this._oSearch || "")}">
        <div class="pchips" data-olist></div>
        <button type="button" class="linkbtn" data-oall>${this.t(this._oAll ? "show_less" : "show_all")}</button>
      </div>
      ${this._slider("obstacle_hold", this.t("obstacle_hold"), this.t("obstacle_hold_d"), 10, 300, 10, "s", d, dis)}
      <div class="warnbox">
        <span class="wi">${svg("alert")}</span>
        <div><b>${this.t("obstacle_stop")}</b><div class="d">${this.t("obstacle_stop_d")}</div></div>
        <label class="sw"><input type="checkbox" data-ostop ${d.obstacle_stop ? "checked" : ""} ${dis}><span></span></label>
      </div>`;
  }

  _renderObstacleList(box, d) {
    const list = box.querySelector("[data-olist]");
    if (!list) return;
    const ids = this._obstacleCandidates(d);
    const name = (id) => this.st(id)?.attributes?.friendly_name || id;
    list.innerHTML = ids.length
      ? ids.map((id) => `<button type="button" data-o="${esc(id)}" class="${d.obstacle_entities.includes(id) ? "on" : ""}">${esc(name(id))}</button>`).join("")
      : `<span class="small muted">${this.t("no_obstacle_entities")}</span>`;
    list.querySelectorAll("[data-o]").forEach((b) =>
      b.addEventListener("click", () => {
        const id = b.dataset.o;
        d.obstacle_entities = d.obstacle_entities.includes(id) ? d.obstacle_entities.filter((x) => x !== id) : [...d.obstacle_entities, id];
        b.classList.toggle("on");
        this._markDirty();
      }));
  }

  // Live stukjes in de instellingen, zonder invoervelden te verstoren.
  _settingsLive() {
    const box = this.$(".settings");
    if (!box || !this.entry) return;
    box.querySelectorAll("[data-pst]").forEach((el) => {
      const home = this._isHome(el.dataset.pst);
      el.className = `st ${home ? "home" : "away"}`;
      const label = box.querySelector(`[data-pstate="${el.dataset.pst}"]`);
      if (label) label.textContent = this.t(home ? "at_home" : "away");
    });
    const whs = box.querySelector("[data-whs]");
    if (whs) {
      const s = this.st(this.entry.entities.obstacle);
      const last = s?.attributes?.laatst_gezien ? new Date(s.attributes.laatst_gezien) : null;
      whs.className = `wh-status ${s?.state === "on" ? "live" : last ? "ok" : ""}`;
      whs.innerHTML = `<i></i>${last ? this.t("wh_last", { t: `${last.toLocaleString()}${s.attributes.bron ? ` · ${esc(s.attributes.bron)}` : ""}` }) : this.t("wh_none")}`;
    }
  }

  _bindSettings(box, d, e) {
    const dirty = () => this._markDirty();
    box.querySelectorAll("[data-r]").forEach((el) =>
      el.addEventListener("input", () => {
        const k = el.dataset.r;
        d[k] = Number(el.value);
        el.style.setProperty("--p", `${((d[k] - el.min) / (el.max - el.min)) * 100}%`);
        box.querySelector(`[data-out="${k}"]`).textContent = `${d[k]} ${el.dataset.unit}`;
        const flow = box.querySelector(".flow");
        if (flow) flow.outerHTML = this._flowHtml(d);
        dirty();
      }));
    box.querySelectorAll("[data-retries]").forEach((b) =>
      b.addEventListener("click", () => {
        d.retries = Number(b.dataset.retries);
        box.querySelectorAll("[data-retries]").forEach((x) => x.classList.toggle("on", x === b));
        const flow = box.querySelector(".flow");
        if (flow) flow.outerHTML = this._flowHtml(d);
        dirty();
      }));
    box.querySelector("[data-inv]")?.addEventListener("change", (ev) => { d.sensor_inverted = ev.target.checked; dirty(); });
    box.querySelectorAll("[data-p]").forEach((b) =>
      b.addEventListener("click", () => {
        const id = b.dataset.p;
        d.presence_entities = d.presence_entities.includes(id) ? d.presence_entities.filter((x) => x !== id) : [...d.presence_entities, id];
        b.classList.toggle("on");
        dirty();
      }));
    box.querySelectorAll("[data-nt]").forEach((row) => {
      const pick = () => {
        d.notify_service = row.dataset.nt;
        box.querySelectorAll("[data-nt]").forEach((x) => {
          x.classList.toggle("on", x === row);
          x.setAttribute("aria-checked", String(x === row));
        });
        dirty();
      };
      row.addEventListener("click", pick);
      row.addEventListener("keydown", (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); pick(); } });
    });
    box.querySelectorAll("[data-test]").forEach((b) =>
      b.addEventListener("click", async (ev) => {
        ev.stopPropagation();
        const svc = b.dataset.test.replace(/^notify\./, "");
        try {
          await this._hass.callService("notify", svc, { title: e.title, message: this.t("test_msg") });
          this.toast(this.t("test_sent"));
        } catch (err) {
          this.toast(err?.message || String(err), true);
        }
      }));
    this._renderObstacleList(box, d);
    box.querySelector("[data-osearch]")?.addEventListener("input", (ev) => { this._oSearch = ev.target.value; this._renderObstacleList(box, d); });
    box.querySelector("[data-oall]")?.addEventListener("click", (ev) => {
      this._oAll = !this._oAll;
      ev.target.textContent = this.t(this._oAll ? "show_less" : "show_all");
      this._renderObstacleList(box, d);
    });
    box.querySelector("[data-ostop]")?.addEventListener("change", (ev) => { d.obstacle_stop = ev.target.checked; dirty(); });
    box.querySelector("[data-copy]")?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(e.webhook_url);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = e.webhook_url;
        box.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      this.toast(this.t("copied"));
    });
    box.querySelector("[data-reset]").addEventListener("click", () => { this._settingsDraft = null; this._renderSettings(); });
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
