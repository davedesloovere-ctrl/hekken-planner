// Hekken-kaart voor dashboards. De integratie laadt dit bestand zelf in;
// de kaart haalt hekken, entiteiten en aanwezigheid uit de Hekkenplanner.

import { DAYS, GATE_SVG, SHARED_CSS, TOKENS_CSS, esc, gateView, subText, svg, toMin, tr } from "./hekken-common.js?v=0.2.6";

const CSS = `
:host { ${TOKENS_CSS} display: block; }
${SHARED_CSS}
ha-card {
  --hk-state: var(--hk-ok);
  display: block; padding: 16px; overflow: hidden; color: var(--hk-text); height: 100%; box-sizing: border-box;
  background:
    radial-gradient(130% 70% at 0% 0%, color-mix(in srgb, var(--hk-state) 13%, transparent), transparent 70%),
    var(--ha-card-background, var(--card-background-color, #fff));
  transition: background .6s;
}
ha-card.is-open, ha-card.is-opening { --hk-state: var(--hk-accent); }
ha-card.is-closing { --hk-state: var(--hk-warn); }
ha-card.is-fault, ha-card.is-unavailable { --hk-state: var(--hk-bad); }
.gc { container-type: inline-size; }
.top { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.top .name { font-weight: 600; font-size: 16px; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.top a { color: var(--hk-muted); display: inline-flex; padding: 4px; border-radius: 8px; cursor: pointer; }
.top a:hover { color: var(--hk-accent); }
.body { display: grid; gap: 8px; grid-template-columns: 1fr; align-items: center; }
@container (min-width: 380px) { .body { grid-template-columns: 170px 1fr; } }
.gate-svg { max-width: 220px; }
.status { font-size: 26px; padding-left: 6px; }
.sub { padding-left: 6px; min-height: 0; }
.actions { margin-top: 12px; }
.actions .btn { flex: 1; justify-content: center; padding: 11px 14px; }
.chips { margin-top: 12px; }
.chips:empty { display: none; }
.fault { margin-top: 12px; padding: 12px; border-radius: 12px; }
.fault .txt { min-width: 0; font-size: 13px; }
.fault .btn { padding: 8px 12px; font-size: 13px; }
.today { margin-top: 14px; }
.today .lbl { display: flex; justify-content: space-between; font-size: 11px; color: var(--hk-muted); margin-bottom: 4px; }
.today .track { position: relative; height: 14px; border-radius: 7px; background: var(--hk-soft); overflow: hidden; }
.today .bar { position: absolute; top: 3px; bottom: 3px; border-radius: 4px; background: var(--hk-accent); opacity: .75; }
.today .bar.off { opacity: .25; }
.today .now { position: absolute; top: 0; bottom: 0; width: 2px; background: var(--hk-bad); }
.last { margin-top: 12px; font-size: 12px; color: var(--hk-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.msg { color: var(--hk-muted); padding: 8px 0; }
`;

class HekkenCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement("hekken-card-editor");
  }

  static getStubConfig() {
    return {};
  }

  setConfig(config) {
    this._config = { show_chips: true, show_today: true, show_last: true, ...config };
    this._sig = "";
    if (this._hass) this._load();
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (!this.shadowRoot) this._build();
    if (first) this._load();
    else this._update();
  }

  getCardSize() {
    return 4;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: "auto" };
  }

  connectedCallback() {
    this._tick = setInterval(() => this._countdown(), 1000);
    this._minute = setInterval(() => { this._sig = ""; this._update(); }, 60000);
  }

  disconnectedCallback() {
    clearInterval(this._tick);
    clearInterval(this._minute);
  }

  t(key, vars) {
    return tr(this._hass, key, vars);
  }

  _build() {
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `<style>${CSS}</style><ha-card><div class="msg">${this.t("loading")}</div></ha-card>`;
  }

  async _load() {
    try {
      const data = await this._hass.callWS({ type: "hekken/list" });
      this._isAdmin = data.is_admin;
      const entries = data.entries || [];
      this._entry = entries.find((e) => e.entry_id === this._config?.entry_id) || entries[0] || null;
      this._error = null;
    } catch (err) {
      this._error = err?.message || String(err);
    }
    this._render();
  }

  _render() {
    const card = this.shadowRoot.querySelector("ha-card");
    if (this._error || !this._entry) {
      card.innerHTML = `<div class="msg">${esc(this._error || this.t("no_gates"))}</div>`;
      return;
    }
    const e = this._entry;
    card.innerHTML = `
      <div class="gc">
        <div class="top">
          <span class="name">${esc(this._config.name || e.title)}</span>
          <a data-open title="${this.t("week")}">${svg("cal")}</a>
        </div>
        <div class="body">
          <div>${GATE_SVG}</div>
          <div>
            <div class="status"><span class="dot"></span><span class="label"></span></div>
            <div class="sub muted small"></div>
          </div>
        </div>
        <div class="actions">
          <button class="btn primary" data-act="open">${svg("up")}${this.t("btn_open")}</button>
          <button class="btn" data-act="close">${svg("down")}${this.t("btn_close")}</button>
        </div>
        <div class="fault-slot"></div>
        <div class="chips"></div>
        ${this._config.show_today ? `<div class="today"></div>` : ""}
        ${this._config.show_last ? `<div class="last"></div>` : ""}
      </div>`;
    card.querySelector('[data-act="open"]').addEventListener("click", () => this._call("cover", "open_cover", e.entities.cover));
    card.querySelector('[data-act="close"]').addEventListener("click", () => this._call("cover", "close_cover", e.entities.cover));
    card.querySelector("[data-open]").addEventListener("click", () => {
      history.pushState(null, "", "/hekken");
      window.dispatchEvent(new CustomEvent("location-changed"));
    });
    this._sig = "";
    this._update();
  }

  _update() {
    const e = this._entry;
    const card = this.shadowRoot?.querySelector("ha-card");
    if (!e || !card?.querySelector(".gc")) return;
    const watch = [e.entities.cover, e.entities.fault, e.entities.automatic, e.entities.auto_close_at,
      e.entities.active_rule, e.entities.last_action, ...Object.values(e.entities.rules || {}), ...e.settings.presence_entities];
    const sig = watch.map((id) => this._hass.states[id]?.state ?? "-").join("|");
    if (sig === this._sig) return;
    this._sig = sig;

    const v = gateView(this._hass, e);
    card.className = `is-${v.state} pos-${v.pos}`;
    card.querySelector(".label").textContent = this.t(v.state);
    const blocked = v.inFault || v.state === "unavailable";
    card.querySelector('[data-act="open"]').disabled = blocked || ["open", "opening"].includes(v.state);
    card.querySelector('[data-act="close"]').disabled = blocked || ["closed", "closing"].includes(v.state);
    this._countdown();

    const slot = card.querySelector(".fault-slot");
    if (v.inFault) {
      slot.innerHTML = `
        <div class="fault">
          <div class="txt"><b>${this.t("fault_title")}</b>${esc(v.fault.attributes?.reden || "")}</div>
          <button class="btn danger">${svg("restart")}${this.t("reset")}</button>
        </div>`;
      slot.querySelector("button").addEventListener("click", () => this._call("button", "press", e.entities.reset));
    } else {
      slot.innerHTML = "";
    }

    this._renderToday(card);
    this._renderLast(card);

    const chips = card.querySelector(".chips");
    if (!this._config.show_chips) {
      chips.innerHTML = "";
      return;
    }
    chips.innerHTML = `
      <button class="chip ${v.autoOn ? "on" : "off"}" data-auto ${this._isAdmin ? "" : "disabled"}>
        ${svg("clock")}${this.t("automatic")}
      </button>
      ${v.hasPresence ? `<span class="chip">${svg(v.home ? "home" : "away")}${this.t(v.home ? "someone_home" : "nobody_home")}</span>` : ""}
      ${v.hasActive ? `<span class="chip on">${svg("cal")}${esc(v.active)}</span>` : ""}`;
    chips.querySelector("[data-auto]").addEventListener("click", () =>
      this._call("switch", v.autoOn ? "turn_off" : "turn_on", e.entities.automatic));
  }

  // Tijdlijn van vandaag: welke regels gelden er, en waar staan we nu.
  _renderToday(card) {
    const box = card.querySelector(".today");
    if (!box) return;
    const e = this._entry;
    const now = new Date();
    const today = DAYS[(now.getDay() + 6) % 7];
    const yesterday = DAYS[(now.getDay() + 5) % 7];
    const bars = [];
    for (const r of e.rules) {
      const on = this._hass.states[e.entities.rules?.[r.id]]?.state !== "off";
      const a = toMin(r.start), b = toMin(r.end);
      const add = (x, y) => bars.push(`<div class="bar ${on ? "" : "off"}" title="${esc(r.name)}" style="left:${(x / 1440) * 100}%;width:${((y - x) / 1440) * 100}%"></div>`);
      if (a === b) { if (r.days.includes(today)) add(0, 1440); }
      else if (a < b) { if (r.days.includes(today)) add(a, b); }
      else {
        if (r.days.includes(today)) add(a, 1440);
        if (r.days.includes(yesterday)) add(0, b);
      }
    }
    const pct = ((now.getHours() * 60 + now.getMinutes()) / 1440) * 100;
    box.innerHTML = `
      <div class="lbl"><span>${this.t("today")}</span><span>00 · 06 · 12 · 18 · 24</span></div>
      <div class="track">${bars.join("")}<div class="now" style="left:${pct}%"></div></div>`;
  }

  _renderLast(card) {
    const box = card.querySelector(".last");
    if (!box) return;
    const s = this._hass.states[this._entry.entities.last_action];
    if (!s || ["unknown", "unavailable"].includes(s.state)) { box.textContent = ""; return; }
    const at = s.attributes?.tijdstip ? new Date(s.attributes.tijdstip) : null;
    const when = at && !isNaN(at) ? ` · ${at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "";
    box.textContent = `${this.t("last_action")}: ${s.state}${when}`;
    box.title = box.textContent;
  }

  _countdown() {
    const sub = this.shadowRoot?.querySelector(".sub");
    if (!sub || !this._entry) return;
    sub.textContent = subText(this._hass, gateView(this._hass, this._entry));
  }

  async _call(domain, service, entityId) {
    try {
      await this._hass.callService(domain, service, { entity_id: entityId });
    } catch (err) {
      const ev = new Event("hass-notification", { bubbles: true, composed: true });
      ev.detail = { message: err?.message || String(err) };
      this.dispatchEvent(ev);
    }
  }
}

class HekkenCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first) {
      hass.callWS({ type: "hekken/list" }).then((d) => {
        this._entries = d.entries || [];
        this._render();
      });
    }
  }

  _render() {
    if (!this._config) return;
    const entries = this._entries || [];
    const t = (k) => tr(this._hass, k);
    this.innerHTML = `
      <style>
        .ed { display: grid; gap: 14px; padding: 4px 0; }
        .ed label { display: grid; gap: 6px; font-size: 14px; }
        .ed select, .ed input[type=text] { font: inherit; padding: 10px; border-radius: 8px; border: 1px solid var(--divider-color); background: var(--card-background-color); color: var(--primary-text-color); }
        .ed .row { display: flex; align-items: center; gap: 10px; }
      </style>
      <div class="ed">
        ${entries.length > 1 ? `
        <label>${t("gate")}
          <select data-k="entry_id">
            ${entries.map((e) => `<option value="${esc(e.entry_id)}" ${e.entry_id === this._config.entry_id ? "selected" : ""}>${esc(e.title)}</option>`).join("")}
          </select>
        </label>` : ""}
        <label>${t("card_name")}
          <input type="text" data-k="name" value="${esc(this._config.name || "")}" placeholder="${esc(entries[0]?.title || "")}">
        </label>
        <label class="row"><input type="checkbox" data-k="show_chips" ${this._config.show_chips === false ? "" : "checked"}>${t("card_chips")}</label>
        <label class="row"><input type="checkbox" data-k="show_today" ${this._config.show_today === false ? "" : "checked"}>${t("card_today")}</label>
        <label class="row"><input type="checkbox" data-k="show_last" ${this._config.show_last === false ? "" : "checked"}>${t("card_last")}</label>
      </div>`;
    this.querySelectorAll("[data-k]").forEach((el) =>
      el.addEventListener("change", () => {
        const k = el.dataset.k;
        const value = el.type === "checkbox" ? el.checked : el.value;
        const config = { ...this._config, [k]: value };
        if (value === "" || (k.startsWith("show_") && value === true)) delete config[k];
        this._config = config;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
      }));
  }
}

customElements.define("hekken-card", HekkenCard);
customElements.define("hekken-card-editor", HekkenCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "hekken-card",
  name: "Hekken",
  description: "Stand van je poort met open en dicht, aftellen en storing, uit de Hekkenplanner.",
  preview: true,
  documentationURL: "https://github.com/davedesloovere-ctrl/hekken-planner",
});
