/* ================= Sesión del día: briefing → planificación → ejecución =================
   1. Briefing: régimen y sesgo por activo (/api/macro), noticias por tema y agenda de hoy (/api/sesion).
   2. Planificación: reglas operativas, objetivos del día y balance psicológico (semáforo).
   3. Ejecución: estrategia, filtros, plan con entrada/stop/objetivo, ratio y tamaño de posición.
   La configuración y el día se guardan en este navegador (localStorage). */
(() => {
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };
  const TZ = "Europe/Madrid";
  const dayKey = () => new Date().toLocaleDateString("en-CA", { timeZone: TZ });
  const hm = iso => new Date(iso).toLocaleTimeString("es-ES", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
  const dayHm = iso => new Date(iso).toLocaleString("es-ES", { timeZone: TZ, weekday: "short", hour: "2-digit", minute: "2-digit" });
  const num = (v, d = 2) => Number(v).toLocaleString("es-ES", { maximumFractionDigits: d });
  const money = v => "$" + Number(v).toLocaleString("es-ES", { maximumFractionDigits: 0 });

  /* ---------- Activos: valor de 1 punto por contrato/lote (USD) y clave macro ---------- */
  const ASSETS = [
    { s: "MNQ", n: "Micro Nasdaq", pv: 2, unit: "contratos", macro: "MNQ" },
    { s: "NQ", n: "Nasdaq 100", pv: 20, unit: "contratos", macro: "NQ" },
    { s: "USTEC", n: "US Tech 100 (CFD)", pv: 1, unit: "lotes", lots: true, macro: "USTEC" },
    { s: "MES", n: "Micro S&P 500", pv: 5, unit: "contratos", macro: "ES" },
    { s: "ES", n: "S&P 500", pv: 50, unit: "contratos", macro: "ES" },
    { s: "MYM", n: "Micro Dow", pv: 0.5, unit: "contratos", macro: "MYM" },
    { s: "GC", n: "Oro", pv: 100, unit: "contratos", macro: "GC" },
    { s: "MGC", n: "Micro Oro", pv: 10, unit: "contratos", macro: "GC" },
    { s: "CL", n: "Crudo WTI", pv: 1000, unit: "contratos", macro: "CL" },
    { s: "EUR/USD", n: "Euro / Dólar", pv: 100000, unit: "lotes", lots: true, macro: "EUR/USD" },
    { s: "GBP/USD", n: "Libra / Dólar", pv: 100000, unit: "lotes", lots: true, macro: "GBP/USD" },
    { s: "USD/JPY", n: "Dólar / Yen", pv: "jpy", unit: "lotes", lots: true, macro: "USD/JPY" },
  ];
  const asset = s => ASSETS.find(a => a.s === s) || ASSETS[0];
  const qty = (n, a) => `${num(n)} ${n === 1 ? a.unit.slice(0, -1) : a.unit}`;

  /* ---------- Estrategias y sus filtros ---------- */
  const STRATS = {
    kairos: { name: "Método Kairos MNQ", hint: "Apertura de Nueva York en M5. Entrada al cierre de la vela con el delta confirmado; objetivo 150–200 ticks; ratio mínimo 1:1.", filters: [
      "Horario: uno de los momentos clave (15:33, 15:45, 16:00, 16:15, 16:45)",
      "Precio en una zona de desequilibrio marcada antes de la apertura",
      "Pico de liquidez dentro o cerca de la zona",
      "Imbalances fuertes (idealmente tres o más apilados)",
      "Delta de la vela M5 de ±3.000 o más a favor",
      "Recorrido libre de 150–200 ticks hasta la siguiente zona",
      "Ruptura de VAL, VAH o del nivel máximo con ese delta",
      "Mercado en tendencia, no en rango",
    ] },
    oyd: { name: "Oferta y demanda", hint: "Zonas de 1H con confluencias, entrada en 5 min a favor del sesgo.", filters: [
      "Zona válida: base pequeña y salida fuerte",
      "Zona sin tocar o tocada una sola vez",
      "Dos o más confluencias (VWAP, máx./mín. del día anterior, número redondo)",
      "La zona va a favor del sesgo",
      "Entrada definida: orden límite o vela de rechazo cerrada",
      "Stop al otro lado de la zona",
    ] },
    of: { name: "Orderflow: absorción o divergencia", hint: "Confirmación con huella y delta en una zona ya marcada.", filters: [
      "Precio en una zona o nivel marcado de antemano",
      "Absorción o divergencia de delta visible",
      "El delta gira a tu favor al cierre de la vela",
      "Flujo fuera de la franja de duda (45–55 %)",
      "Stop por detrás de la absorción o del extremo",
    ] },
  };
  const defaultStrat = s => (["MNQ", "NQ", "USTEC"].includes(s) ? "kairos" : "oyd");

  /* ---------- Configuración (persistente) y estado del día ---------- */
  const DEF = {
    assets: ["MNQ", "GC", "EUR/USD"],
    rules: [
      "Solo opero en Londres (9:00–11:30) y Nueva York (15:30–18:00)",
      "No abro operaciones 5 minutos antes ni después de un dato de alto impacto",
      "Stop puesto en la plataforma antes de entrar",
      "No muevo el stop en contra",
      "Si llego a la pérdida máxima diaria, cierro la plataforma",
      "Registro cada operación en el diario",
    ],
    capital: 10000, riskPct: 0.5, maxLossPct: 1.5, targetPct: 1, maxTrades: 3,
  };
  let cfg = { ...DEF, ...store.get("kairos-sesion-config", {}) };
  const saveCfg = () => store.set("kairos-sesion-config", cfg);
  let day, dayId;
  function loadDay() {
    dayId = dayKey();
    day = { rules: {}, psych: { sueno: 3, estres: 3, foco: 3, emocion: 3 }, note: "", plans: [], ...store.get("kairos-sesion-" + dayId, {}) };
  }
  const saveDay = () => store.set("kairos-sesion-" + dayId, day);

  /* ---------- Semáforo psicológico ---------- */
  const PSYCH = [
    ["sueno", "Descanso", "1 = dormí mal · 5 = descansado"],
    ["estres", "Estrés", "1 = tranquilo · 5 = muy estresado"],
    ["foco", "Concentración", "1 = disperso · 5 = muy centrado"],
    ["emocion", "Estado emocional", "1 = ansioso o con ganas de recuperar · 5 = sereno"],
  ];
  function light() {
    const p = day.psych, score = p.sueno + (6 - p.estres) + p.foco + p.emocion;
    const worst = Math.min(p.sueno, 6 - p.estres, p.foco, p.emocion);
    if (score <= 10 || worst === 1 && score <= 12) return { k: "red", t: "Hoy no operes", d: "Tu estado no es el adecuado. Revisa el mercado, estudia o haz backtesting, pero no arriesgues dinero.", size: 0, score };
    if (score <= 14 || worst <= 2) return { k: "amber", t: "Opera con la mitad de tamaño", d: "Algo no está al 100 %. Reduce el riesgo a la mitad y limítate a las operaciones más claras.", size: 0.5, score };
    return { k: "green", t: "Listo para operar", d: "Buen estado. Sigue tu plan y tus reglas sin forzar operaciones.", size: 1, score };
  }
  const riskUsd = () => cfg.capital * cfg.riskPct / 100 * light().size;

  /* ---------- Datos remotos ---------- */
  let macro = null, sesion = null, loading = null, loaded = false, topicFilter = "todas";
  function loadData() {
    if (loading) return loading;
    loading = Promise.allSettled([
      fetch("/api/macro").then(r => (r.ok ? r.json() : null)),
      fetch("/api/sesion").then(r => (r.ok ? r.json() : null)),
    ]).then(([m, s]) => {
      macro = m.status === "fulfilled" ? m.value : null;
      sesion = s.status === "fulfilled" ? s.value : null;
      loaded = true;
      if (!$("view-sesion").hidden) render();
    });
    return loading;
  }
  const biasOf = s => macro?.assets?.[asset(s).macro] || null;
  const biasCls = b => (/alcista/i.test(b) ? "up" : /bajista/i.test(b) ? "down" : "flat");
  const eventsFor = s => (sesion?.agenda?.today || []).filter(e => e.assets.includes(asset(s).macro));
  const newsFor = s => (sesion?.news || []).filter(n => n.assets.includes(asset(s).macro));

  /* ================= PASO 1 · BRIEFING ================= */
  function summary() {
    const out = [];
    const g = macro?.global;
    if (g) out.push(`Régimen <b>${esc(g.regime)}</b> con convicción ${g.conviction}/100; el motor principal es <b>${esc(g.primaryDriver)}</b>.`);
    const tp = (sesion?.topics || []).filter(t => t.id !== "mercados" && t.id !== "empresas").sort((a, b) => b.count - a.count).slice(0, 2);
    if (tp.length) out.push(`En las noticias de las últimas 24 h dominan <b>${tp.map(t => esc(t.name.toLowerCase())).join("</b> y <b>")}</b>.`);
    const ev = sesion?.agenda?.today || [], hi = ev.filter(e => e.impact === "alto");
    if (sesion?.agenda) out.push(hi.length ? `Hoy hay <b>${hi.length} evento${hi.length > 1 ? "s" : ""} de alto impacto</b>; el primero a las <b>${hm(hi[0].time)}</b> (${esc(hi[0].title)}).` : ev.length ? `Hoy solo hay eventos de impacto medio.` : `Hoy no hay eventos de impacto medio o alto en la agenda.`);
    const as = cfg.assets.map(s => { const b = biasOf(s); return b ? `${s} <span class="${biasCls(b.bias)}">${esc(b.bias.toLowerCase())}</span>` : null; }).filter(Boolean);
    if (as.length) out.push(`Sesgo macro de tus activos: ${as.join(" · ")}.`);
    return out.length ? out.map(p => `<p>${p}</p>`).join("") : `<p style="color:var(--muted)">Cargando el contexto del día…</p>`;
  }

  function step1() {
    const g = macro?.global, ag = sesion?.agenda;
    const news = (sesion?.news || []).filter(n => topicFilter === "todas" || n.topic === topicFilter);
    const topicName = id => (sesion?.topics || []).find(t => t.id === id)?.name || "Mercados";
    return `
    <div class="grid">
      <div class="card span-12 ss-hero">
        <div class="card-head"><span class="label">Lectura del día</span>${macro ? `<span class="demo-tag live-src">DATOS REALES · FRED · NOTICIAS</span>` : ""}</div>
        <div class="ss-summary">${summary()}</div>
      </div>

      <div class="card span-8">
        <div class="card-head"><span class="label">Contexto financiero global</span><a class="icon-btn" href="#macro">Ver Macro →</a></div>
        ${g ? `<div class="ss-global">
          <div><span class="label">Régimen</span><b class="ss-big">${esc(g.regime)}</b><small>Convicción ${g.conviction}/100</small></div>
          <div><span class="label">Motor principal</span><b>${esc(g.primaryDriver)}</b><small>Sesgo macro: ${esc(g.macroBias)}</small></div>
          <div><span class="label">Tipos oficiales</span><b>Fed ${num(g.policy?.fed_upper)} % · BCE ${num(g.policy?.ecb_deposit)} %</b><small>Ventana de riesgo: ${esc(g.riskWindow)}</small></div>
        </div>
        <p class="ss-brief">${esc(g.brief)}</p>
        <div class="ss-scores">${(g.scores || []).map(s => `<div><span>${esc(s.name)}</span><i><b style="${s.v >= 0 ? "left:50%" : "right:50%"};width:${Math.min(50, Math.abs(s.v) / 2)}%" class="${s.v >= 0 ? "pos" : "neg"}"></b></i><em>${s.v > 0 ? "+" : ""}${s.v}</em></div>`).join("")}</div>`
        : `<p style="color:var(--muted)">${loaded ? "No se pudieron cargar los datos macro." : "Cargando datos macro…"}</p>`}
      </div>

      <div class="card span-4">
        <div class="card-head"><span class="label">Agenda de hoy</span><a class="icon-btn" href="#cal">Calendario →</a></div>
        ${!sesion ? `<p style="color:var(--muted)">${loaded ? "No se pudo cargar la agenda. Consulta el Calendario." : "Cargando agenda…"}</p>` : !ag ? `<p style="color:var(--muted)">No se pudo cargar la agenda ahora mismo. Consulta el Calendario.</p>` :
        `${ag.today.length ? `<ul class="ss-agenda">${ag.today.map(e => `<li><span class="mono">${hm(e.time)}</span><span class="ss-imp ${e.impact}">${e.impact}</span><span>${esc(e.title)}<small>${esc(e.country)}${e.forecast ? ` · prev. ${esc(e.forecast)}` : ""}${e.previous ? ` · ant. ${esc(e.previous)}` : ""}</small></span></li>`).join("")}</ul>`
          : `<p style="color:var(--muted);margin:0">Hoy no hay eventos de impacto medio o alto.</p>`}
        ${ag.next.length ? `<span class="label" style="margin-top:6px">Próximos de alto impacto</span><ul class="ss-agenda">${ag.next.map(e => `<li><span class="mono">${dayHm(e.time)}</span><span class="ss-imp alto">alto</span><span>${esc(e.title)}<small>${esc(e.country)}</small></span></li>`).join("")}</ul>` : ""}`}
      </div>

      <div class="card span-12">
        <div class="card-head"><span class="label">Impacto en tus activos</span><span class="label">Elige los activos que operas</span></div>
        <div class="ss-chips" id="ssAssetChips">${ASSETS.map(a => `<button class="chip" aria-pressed="${cfg.assets.includes(a.s)}" data-asset="${a.s}">${a.s}</button>`).join("")}</div>
        <div class="ss-assets">${cfg.assets.map(s => {
          const b = biasOf(s), ev = eventsFor(s), nw = newsFor(s);
          return `<div class="ss-asset">
            <div class="card-head"><b class="ss-sym">${s}</b>${b ? `<span class="pill ${biasCls(b.bias)} ${biasCls(b.bias)}">${esc(b.bias.toUpperCase())}</span>` : `<span class="tag">sin datos macro</span>`}</div>
            <small style="color:var(--muted)">${esc(asset(s).n)}</small>
            ${b ? `<div class="ss-conv"><i style="width:${b.conv}%"></i></div><small>Convicción ${b.conv}/100 · ${esc(b.key)}</small><p>${esc(b.brief)}</p>` : ""}
            <div class="ss-meta">
              <span class="${ev.some(e => e.impact === "alto") ? "down" : ""}">📅 ${ev.length ? `${ev.length} evento${ev.length > 1 ? "s" : ""} hoy${ev[0] ? ` · ${hm(ev[0].time)}` : ""}` : "Sin eventos hoy"}</span>
              <span>📰 ${nw.length} noticia${nw.length === 1 ? "" : "s"} en 24 h</span>
            </div>
          </div>`; }).join("") || `<p style="color:var(--muted)">Selecciona al menos un activo.</p>`}</div>
      </div>

      <div class="card span-12">
        <div class="card-head"><span class="label">Qué está pasando en el mundo · últimas 24 h</span><small style="color:var(--muted)">Titulares en inglés · Yahoo Finance</small></div>
        <div class="ss-chips" id="ssTopics"><button class="chip" aria-pressed="${topicFilter === "todas"}" data-topic="todas">Todas</button>${(sesion?.topics || []).map(t => `<button class="chip" aria-pressed="${topicFilter === t.id}" data-topic="${t.id}">${esc(t.name)} · ${t.count}</button>`).join("")}</div>
        <ul class="ss-news">${news.slice(0, 20).map(n => `<li><span class="mono">${hm(n.date)}</span><span class="tag">${esc(topicName(n.topic))}</span><a href="${esc(n.link)}" target="_blank" rel="noopener">${esc(n.title)}</a><small>${n.assets.map(esc).join(" · ")}</small></li>`).join("") || `<li style="color:var(--muted)">${sesion ? "No hay titulares para este tema." : loaded ? "No se pudieron cargar las noticias." : "Cargando noticias…"}</li>`}</ul>
      </div>
    </div>
    <div class="ss-next"><button class="btn primary" data-go="2">Continuar a la planificación →</button></div>`;
  }

  /* ================= PASO 2 · PLANIFICACIÓN ================= */
  function step2() {
    const l = light(), done = cfg.rules.filter((_, i) => day.rules[i]).length;
    return `
    <div class="grid">
      <div class="card span-7">
        <div class="card-head"><span class="label">Reglas operativas</span><span class="label" id="ssRulesCount">${done}/${cfg.rules.length} confirmadas</span></div>
        <p style="margin:0;color:var(--muted);font-size:14px">Léelas y confírmalas una a una antes de abrir la plataforma.</p>
        <ul class="ss-check" id="ssRules">${cfg.rules.map((r, i) => `<li><label><input type="checkbox" data-rule="${i}" ${day.rules[i] ? "checked" : ""}><span>${esc(r)}</span></label><button class="icon-btn" data-delrule="${i}" aria-label="Eliminar regla">✕</button></li>`).join("")}</ul>
        <form class="ss-addrule" id="ssAddRule"><input id="ssRuleInput" placeholder="Añadir una regla propia" maxlength="140"><button class="btn" type="submit">Añadir</button></form>
      </div>

      <div class="card span-5">
        <span class="label">Objetivos y límites del día</span>
        <div class="ss-form" id="ssGoals">
          <label class="field"><span class="label">Capital de la cuenta ($)</span><input type="number" min="0" step="100" data-cfg="capital" value="${cfg.capital}"></label>
          <label class="field"><span class="label">Riesgo por operación (%)</span><input type="number" min="0" step="0.1" data-cfg="riskPct" value="${cfg.riskPct}"></label>
          <label class="field"><span class="label">Pérdida máxima diaria (%)</span><input type="number" min="0" step="0.1" data-cfg="maxLossPct" value="${cfg.maxLossPct}"></label>
          <label class="field"><span class="label">Objetivo diario (%)</span><input type="number" min="0" step="0.1" data-cfg="targetPct" value="${cfg.targetPct}"></label>
          <label class="field"><span class="label">Máximo de operaciones</span><input type="number" min="1" step="1" data-cfg="maxTrades" value="${cfg.maxTrades}"></label>
        </div>
        <div class="ss-goals" id="ssGoalsOut">${goalsOut()}</div>
      </div>

      <div class="card span-7">
        <span class="label">Balance psicológico</span>
        <div class="ss-psych" id="ssPsych">${PSYCH.map(([k, t, h]) => `<label class="field"><span class="label">${t} · <b id="ssV-${k}">${day.psych[k]}</b></span><input type="range" min="1" max="5" step="1" data-psych="${k}" value="${day.psych[k]}"><small>${h}</small></label>`).join("")}</div>
        <label class="field"><span class="label">¿Cómo llegas hoy? (opcional)</span><input id="ssNote" maxlength="200" value="${esc(day.note)}" placeholder="Ej.: ayer perdí y quiero recuperar; hoy estoy cansado…"></label>
      </div>

      <div class="card span-5 ss-light ${l.k}" id="ssLight">${lightOut()}</div>
    </div>
    <div class="ss-next"><button class="btn" data-go="1">← Briefing</button><button class="btn primary" data-go="3">Continuar a la ejecución →</button></div>`;
  }
  const goalsOut = () => `
    <div><span>Riesgo por operación</span><b>${money(cfg.capital * cfg.riskPct / 100)}</b></div>
    <div><span>Pérdida máxima hoy</span><b class="down">−${money(cfg.capital * cfg.maxLossPct / 100)}</b></div>
    <div><span>Objetivo de hoy</span><b class="up">+${money(cfg.capital * cfg.targetPct / 100)}</b></div>
    <div><span>Pérdidas seguidas que aguantas</span><b>${cfg.riskPct > 0 ? Math.floor(cfg.maxLossPct / cfg.riskPct) : "—"}</b></div>`;
  function lightOut() {
    const l = light(), done = cfg.rules.filter((_, i) => day.rules[i]).length, ok = done === cfg.rules.length;
    return `<span class="label">Semáforo del día</span>
      <div class="ss-bulb"><i class="red"></i><i class="amber"></i><i class="green"></i></div>
      <b class="ss-light-t">${l.t}</b><p>${l.d}</p>
      <small>Puntuación ${l.score}/20 · riesgo por operación hoy: <b>${money(riskUsd())}</b></small>
      <p class="${ok ? "up" : "down"}" style="margin:6px 0 0">${ok ? "✓ Reglas confirmadas" : `Te faltan ${cfg.rules.length - done} regla${cfg.rules.length - done > 1 ? "s" : ""} por confirmar`}</p>`;
  }

  /* ================= PASO 3 · EJECUCIÓN ================= */
  let draft = null;
  function newDraft() {
    const s = cfg.assets[0] || "MNQ";
    draft = { sym: s, side: "L", strat: defaultStrat(s), checks: {}, entry: "", stop: "", target: "", note: "" };
  }
  function journalToday() {
    return (store.get("kairos-journal", []) || []).filter(t => t.date === dayId && !t.demo);
  }
  function step3() {
    if (!draft) newDraft();
    const l = light(), jt = journalToday(), pts = jt.reduce((a, t) => a + (t.side === "L" ? t.exit - t.entry : t.entry - t.exit), 0);
    const st = STRATS[draft.strat];
    return `
    <div class="kpis">
      <div class="kpi"><span class="label">Semáforo</span><b class="ss-k-${l.k}">${l.k === "green" ? "Verde" : l.k === "amber" ? "Ámbar" : "Rojo"}</b><small>${esc(l.t)}</small></div>
      <div class="kpi"><span class="label">Riesgo por operación</span><b>${money(riskUsd())}</b><small>${l.size === 0.5 ? "Reducido a la mitad" : l.size === 0 ? "Hoy no se opera" : `${cfg.riskPct} % de ${money(cfg.capital)}`}</small></div>
      <div class="kpi"><span class="label">Planes del día</span><b>${day.plans.length}/${cfg.maxTrades}</b><small>Máximo de operaciones</small></div>
      <div class="kpi"><span class="label">Diario de hoy</span><b class="${pts > 0 ? "up" : pts < 0 ? "down" : ""}">${jt.length} op. · ${pts > 0 ? "+" : ""}${num(pts)} pts</b><small><a href="#journal">Abrir el diario →</a></small></div>
    </div>
    <div class="grid">
      <form class="card span-7" id="ssPlan" autocomplete="off">
        <span class="label">Nuevo plan de operación</span>
        <div class="ss-form">
          <label class="field"><span class="label">Activo</span><select data-d="sym">${ASSETS.map(a => `<option ${a.s === draft.sym ? "selected" : ""}>${a.s}</option>`).join("")}</select></label>
          <label class="field"><span class="label">Dirección</span><select data-d="side"><option value="L" ${draft.side === "L" ? "selected" : ""}>Largo (compra)</option><option value="S" ${draft.side === "S" ? "selected" : ""}>Corto (venta)</option></select></label>
          <label class="field" style="grid-column:1/-1"><span class="label">Estrategia</span><select data-d="strat">${Object.entries(STRATS).map(([k, v]) => `<option value="${k}" ${k === draft.strat ? "selected" : ""}>${v.name}</option>`).join("")}</select></label>
        </div>
        <p class="ss-hint">${esc(st.hint)}</p>
        <span class="label">Filtros de la estrategia</span>
        <ul class="ss-check">${st.filters.map((f, i) => `<li><label><input type="checkbox" data-check="${i}" ${draft.checks[i] ? "checked" : ""}><span>${esc(f)}</span></label></li>`).join("")}</ul>
        <div class="ss-form">
          <label class="field"><span class="label">Entrada</span><input type="number" step="any" data-d="entry" value="${esc(draft.entry)}"></label>
          <label class="field"><span class="label">Stop</span><input type="number" step="any" data-d="stop" value="${esc(draft.stop)}"></label>
          <label class="field"><span class="label">Objetivo</span><input type="number" step="any" data-d="target" value="${esc(draft.target)}"></label>
        </div>
        <label class="field"><span class="label">Plan y notas</span><input data-d="note" maxlength="240" value="${esc(draft.note)}" placeholder="Qué tiene que pasar para entrar y qué invalida la idea"></label>
        <div class="ss-calc" id="ssCalc">${calcOut()}</div>
        <div class="ss-next" style="margin:0"><button class="btn" type="button" data-reset>Limpiar</button><button class="btn primary" type="submit">Guardar plan</button></div>
      </form>

      <div class="card span-5">
        <div class="card-head"><span class="label">Planes de hoy</span><span class="label">${day.plans.length} guardado${day.plans.length === 1 ? "" : "s"}</span></div>
        <div class="ss-plans">${day.plans.map((p, i) => planCard(p, i)).join("") || `<p style="color:var(--muted);margin:0">Aún no hay planes. Prepara el primero a la izquierda.</p>`}</div>
      </div>
    </div>
    <div class="ss-next"><button class="btn" data-go="2">← Planificación</button></div>`;
  }

  function calc(d = draft) {
    const e = parseFloat(d.entry), s = parseFloat(d.stop), t = parseFloat(d.target), a = asset(d.sym);
    const out = { warns: [], ok: false };
    if ([e, s].every(isFinite)) {
      out.risk = Math.abs(e - s);
      if (d.side === "L" && s >= e || d.side === "S" && s <= e) out.warns.push("El stop está en el lado equivocado de la entrada.");
      const pv = a.pv === "jpy" ? 100000 / e : a.pv;
      out.riskPer = out.risk * pv;
      if (out.riskPer > 0) {
        const raw = riskUsd() / out.riskPer;
        out.size = a.lots ? Math.floor(raw * 100) / 100 : Math.floor(raw);
        out.cost = out.size * out.riskPer;
      }
    }
    if ([e, t].every(isFinite)) {
      out.reward = Math.abs(t - e);
      if (d.side === "L" && t <= e || d.side === "S" && t >= e) out.warns.push("El objetivo está en el lado equivocado de la entrada.");
      if (out.risk) out.rr = out.reward / out.risk;
    }
    const st = STRATS[d.strat], done = st.filters.filter((_, i) => d.checks[i]).length;
    out.filters = `${done}/${st.filters.length}`;
    if (done < st.filters.length) out.warns.push(`Faltan ${st.filters.length - done} filtro${st.filters.length - done > 1 ? "s" : ""} de la estrategia: con la regla de Kairos, no hay operación.`);
    if (out.rr !== undefined && out.rr < 1) out.warns.push(`Ratio ${num(out.rr)}:1 por debajo del mínimo de 1:1.`);
    const b = biasOf(d.sym);
    if (b && (d.side === "L" && /bajista/i.test(b.bias) || d.side === "S" && /alcista/i.test(b.bias))) out.warns.push(`Operas contra el sesgo macro (${b.bias.toLowerCase()}, convicción ${b.conv}).`);
    const soon = eventsFor(d.sym).find(ev => ev.impact === "alto" && Math.abs(new Date(ev.time) - Date.now()) < 30 * 60e3);
    if (soon) out.warns.push(`Dato de alto impacto a las ${hm(soon.time)} (${soon.title}).`);
    if (light().size === 0) out.warns.push("Semáforo en rojo: hoy no deberías operar.");
    if (cfg.rules.some((_, i) => !day.rules[i])) out.warns.push("No has confirmado todas tus reglas operativas.");
    if (day.plans.length >= cfg.maxTrades) out.warns.push(`Ya tienes ${day.plans.length} planes: es tu máximo de operaciones del día.`);
    out.ok = !out.warns.length && out.size > 0;
    return out;
  }
  function calcOut() {
    const c = calc(), a = asset(draft.sym);
    return `<div class="ss-calc-grid">
        <div><span>Riesgo</span><b>${c.risk !== undefined ? num(c.risk, 5) + " pts" : "—"}</b></div>
        <div><span>Beneficio</span><b>${c.reward !== undefined ? num(c.reward, 5) + " pts" : "—"}</b></div>
        <div><span>Ratio</span><b class="${c.rr >= 2 ? "up" : c.rr < 1 ? "down" : ""}">${c.rr !== undefined ? "1:" + num(c.rr, 1) : "—"}</b></div>
        <div><span>Tamaño</span><b>${c.size !== undefined ? qty(c.size, a) : "—"}</b><small>${c.cost !== undefined ? `arriesgas ${money(c.cost)}` : ""}</small></div>
      </div>
      ${c.size === 0 && c.risk ? `<p class="down" style="margin:0">El stop es demasiado amplio para tu riesgo: no cabe ni ${a.lots ? "0,01 lotes" : "1 contrato"}.</p>` : ""}
      ${c.warns.length ? `<ul class="ss-warns">${c.warns.map(w => `<li>${esc(w)}</li>`).join("")}</ul>` : c.size ? `<p class="up" style="margin:0">✓ El plan cumple tus reglas.</p>` : ""}`;
  }
  const STATUS = { pend: "Pendiente", done: "Ejecutada", skip: "Descartada" };
  function planCard(p, i) {
    const c = calc(p), b = biasOf(p.sym);
    return `<div class="ss-plan ${p.status}">
      <div class="card-head"><b>${esc(p.sym)} · <span class="${p.side === "L" ? "up" : "down"}">${p.side === "L" ? "Largo" : "Corto"}</span></b><span class="mono">${hm(p.at)}</span></div>
      <small>${esc(STRATS[p.strat].name)} · filtros ${c.filters}${b ? ` · sesgo ${esc(b.bias.toLowerCase())}` : ""}</small>
      <div class="ss-plan-nums"><span>E <b>${esc(p.entry)}</b></span><span>SL <b class="down">${esc(p.stop)}</b></span><span>TP <b class="up">${esc(p.target)}</b></span><span>${c.rr !== undefined ? "1:" + num(c.rr, 1) : ""}</span><span>${c.size !== undefined ? qty(c.size, asset(p.sym)) : ""}</span></div>
      ${p.note ? `<p>${esc(p.note)}</p>` : ""}
      <div class="ss-plan-actions"><div class="seg">${Object.entries(STATUS).map(([k, v]) => `<button type="button" aria-pressed="${p.status === k}" data-status="${k}" data-plan="${i}">${v}</button>`).join("")}</div><button class="icon-btn" data-delplan="${i}" aria-label="Eliminar plan">✕</button></div>
    </div>`;
  }

  /* ================= Render y eventos ================= */
  let stepNow = 1;
  function render() {
    if (dayId !== dayKey()) { loadDay(); draft = null; }
    $("ssDate").textContent = new Date().toLocaleDateString("es-ES", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" });
    document.querySelectorAll("#ssSteps button").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.step === stepNow)));
    [1, 2, 3].forEach(n => { $("ssStep" + n).hidden = n !== stepNow; });
    $("ssStep" + stepNow).innerHTML = [null, step1, step2, step3][stepNow]();
    if (!macro && !sesion) loadData();
  }
  function go(n) { stepNow = n; render(); window.scrollTo(0, 0); }

  $("ssSteps").addEventListener("click", e => { const b = e.target.closest("[data-step]"); if (b) go(+b.dataset.step); });
  $("view-sesion").addEventListener("click", e => {
    const t = e.target;
    const g = t.closest("[data-go]"); if (g) return go(+g.dataset.go);
    const a = t.closest("[data-asset]");
    if (a) { const s = a.dataset.asset; cfg.assets = cfg.assets.includes(s) ? cfg.assets.filter(x => x !== s) : [...cfg.assets, s]; saveCfg(); return render(); }
    const tp = t.closest("[data-topic]"); if (tp) { topicFilter = tp.dataset.topic; return render(); }
    const dr = t.closest("[data-delrule]");
    if (dr) { const i = +dr.dataset.delrule; cfg.rules.splice(i, 1); const r = {}; Object.keys(day.rules).forEach(k => { if (+k < i) r[k] = day.rules[k]; else if (+k > i) r[k - 1] = day.rules[k]; }); day.rules = r; saveCfg(); saveDay(); return render(); }
    const ps = t.closest("[data-status]"); if (ps) { day.plans[+ps.dataset.plan].status = ps.dataset.status; saveDay(); return render(); }
    const dp = t.closest("[data-delplan]"); if (dp) { day.plans.splice(+dp.dataset.delplan, 1); saveDay(); return render(); }
    if (t.closest("[data-reset]")) { newDraft(); return render(); }
  });
  $("view-sesion").addEventListener("change", e => {
    const t = e.target;
    if (t.dataset.rule !== undefined) { day.rules[t.dataset.rule] = t.checked; saveDay(); $("ssRulesCount").textContent = `${cfg.rules.filter((_, i) => day.rules[i]).length}/${cfg.rules.length} confirmadas`; $("ssLight").innerHTML = lightOut(); }
    if (t.dataset.check !== undefined) { draft.checks[t.dataset.check] = t.checked; $("ssCalc").innerHTML = calcOut(); }
    if (t.dataset.d === "sym") { draft.sym = t.value; draft.strat = defaultStrat(t.value); draft.checks = {}; render(); }
    else if (t.dataset.d === "strat") { draft.strat = t.value; draft.checks = {}; render(); }
    else if (t.dataset.d === "side") { draft.side = t.value; $("ssCalc").innerHTML = calcOut(); }
  });
  $("view-sesion").addEventListener("input", e => {
    const t = e.target;
    if (t.dataset.cfg) { cfg[t.dataset.cfg] = Math.max(0, parseFloat(t.value) || 0); saveCfg(); $("ssGoalsOut").innerHTML = goalsOut(); $("ssLight").innerHTML = lightOut(); }
    if (t.dataset.psych) {
      day.psych[t.dataset.psych] = +t.value; saveDay(); $("ssV-" + t.dataset.psych).textContent = t.value;
      const l = light(); $("ssLight").className = `card span-5 ss-light ${l.k}`; $("ssLight").innerHTML = lightOut();
    }
    if (t.id === "ssNote") { day.note = t.value; saveDay(); }
    if (["entry", "stop", "target", "note"].includes(t.dataset.d)) { draft[t.dataset.d] = t.value; if (t.dataset.d !== "note") $("ssCalc").innerHTML = calcOut(); }
  });
  $("view-sesion").addEventListener("submit", e => {
    e.preventDefault();
    if (e.target.id === "ssAddRule") { const v = $("ssRuleInput").value.trim(); if (v) { cfg.rules.push(v); saveCfg(); render(); } return; }
    if (e.target.id === "ssPlan") {
      if (![draft.entry, draft.stop, draft.target].every(v => isFinite(parseFloat(v)))) { $("ssCalc").insertAdjacentHTML("beforeend", `<p class="down" style="margin:0">Indica entrada, stop y objetivo para guardar el plan.</p>`); return; }
      day.plans.push({ ...draft, checks: { ...draft.checks }, at: new Date().toISOString(), status: "pend" }); saveDay();
      const keep = { sym: draft.sym, side: draft.side, strat: draft.strat }; newDraft(); Object.assign(draft, keep); render();
    }
  });

  loadDay();
  window.KairosViews = window.KairosViews || {};
  window.KairosViews.sesion = () => { render(); loadData(); };
})();
