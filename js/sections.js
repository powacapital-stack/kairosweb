
/* ================= Secciones: Calendario, Mapa de calor, Macro, Diario, Academia ================= */
(() => {
  const $ = id => document.getElementById(id);
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const pad = n => String(n).padStart(2, "0");
  function countdown(ms) {
    if (ms <= 0) return "en curso";
    const s = Math.floor(ms / 1000), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60);
    return d > 0 ? `${d} d ${h} h ${pad(m)} min` : `${pad(h)}:${pad(m)}:${pad(s % 60)}`;
  }
  function rng(seed) { let a = 0; for (const ch of seed) a = (a * 31 + ch.charCodeAt(0)) | 0;
    return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const today = new Date();
  const daySeed = today.toISOString().slice(0, 10);
  function segBind(id, fn) {
    $(id).addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return;
      $(id).querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b)); fn(b.dataset.v); });
  }

  /* ---------- CALENDARIO ---------- */
  // d: día de la semana (0 = lunes), t: hora UTC, x: instrumentos afectados.
  const CAL = [
    { d:0, t:"06:00", c:"DE", i:"baja",  n:"Balanza comercial de Alemania", f:"17,2 MM", p:"16,9 MM", a:"17,8 MM", x:["FX","GC"] },
    { d:0, t:"14:00", c:"US", i:"media", n:"Discurso de un miembro del FOMC", f:"", p:"", a:"", x:["IDX","GC","FX"] },
    { d:0, t:"23:50", c:"JP", i:"baja",  n:"Pedidos de maquinaria m/m", f:"1,2 %", p:"-3,7 %", a:"0,8 %", x:["FX"] },
    { d:1, t:"06:00", c:"GB", i:"media", n:"Tasa de desempleo", f:"4,7 %", p:"4,7 %", a:"4,8 %", x:["FX","GC"] },
    { d:1, t:"09:00", c:"DE", i:"media", n:"Sentimiento económico ZEW", f:"38,5", p:"41,2", a:"36,0", x:["FX","GC"] },
    { d:1, t:"10:00", c:"US", i:"baja",  n:"Índice de pequeñas empresas NFIB", f:"98,1", p:"98,7", a:"98,4", x:["IDX"] },
    { d:2, t:"12:30", c:"US", i:"alta",  n:"IPC m/m", f:"0,3 %", p:"0,4 %", a:"0,4 %", x:["IDX","GC","FX"] },
    { d:2, t:"12:30", c:"US", i:"alta",  n:"IPC subyacente a/a", f:"3,1 %", p:"3,1 %", a:"3,2 %", x:["IDX","GC","FX"] },
    { d:2, t:"14:30", c:"US", i:"media", n:"Inventarios de crudo (EIA)", f:"-1,4 M", p:"2,1 M", a:"-3,0 M", x:["CL"] },
    { d:2, t:"18:00", c:"US", i:"baja",  n:"Libro Beige de la Fed", f:"", p:"", a:"", x:["IDX","GC"] },
    { d:3, t:"06:00", c:"GB", i:"alta",  n:"PIB m/m", f:"0,1 %", p:"0,4 %", a:"-0,1 %", x:["FX","GC"] },
    { d:3, t:"12:15", c:"EU", i:"alta",  n:"Decisión de tipos del BCE", f:"2,00 %", p:"2,00 %", a:"2,00 %", x:["FX","GC","IDX"] },
    { d:3, t:"12:30", c:"US", i:"alta",  n:"Ventas minoristas m/m", f:"0,3 %", p:"1,2 %", a:"0,6 %", x:["IDX","GC","FX"] },
    { d:3, t:"12:30", c:"US", i:"alta",  n:"IPP m/m", f:"0,2 %", p:"0,4 %", a:"0,1 %", x:["IDX","GC","FX"] },
    { d:3, t:"12:30", c:"US", i:"media", n:"Solicitudes de subsidio por desempleo", f:"221 K", p:"218 K", a:"216 K", x:["IDX","GC","FX"] },
    { d:4, t:"09:00", c:"EU", i:"baja",  n:"IPC final a/a", f:"2,1 %", p:"2,1 %", a:"2,1 %", x:["FX","GC"] },
    { d:4, t:"12:30", c:"US", i:"media", n:"Inicios de viviendas", f:"1,32 M", p:"1,29 M", a:"1,35 M", x:["IDX"] },
    { d:4, t:"14:00", c:"US", i:"alta",  n:"Confianza del consumidor (U. Michigan)", f:"54,0", p:"55,1", a:"53,2", x:["IDX","GC","FX"] },
    { d:4, t:"17:00", c:"US", i:"baja",  n:"Recuento de plataformas Baker Hughes", f:"", p:"411", a:"409", x:["CL"] },
  ];
  const INST = { IDX: "Índices", GC: "Oro", CL: "Petróleo", FX: "Forex" };
  const monday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - (today.getUTCDay() + 6) % 7));
  CAL.forEach(e => { const [h, m] = e.t.split(":").map(Number); e.at = new Date(monday.getTime() + e.d * 864e5 + (h * 60 + m) * 6e4); });
  CAL.push(...CAL.map(e => ({ ...e, at: new Date(e.at.getTime() + 7 * 864e5) })));
  CAL.sort((a, b) => a.at - b.at);
  const cal = { imp: "all", inst: "all", tz: "Europe/Madrid" };
  const calMatch = e => (cal.imp === "all" || e.i === cal.imp) && (cal.inst === "all" || e.x.includes(cal.inst));
  const num = s => parseFloat(String(s).replace(/[^\d,.-]/g, "").replace(",", "."));

  /* ---------- CALENDARIO (widget de TradingView, datos reales) ---------- */
  // CAL de arriba se mantiene solo como datos de ejemplo para la pestaña Macro.
  const calTv = { importance: "-1,0,1", countries: "us,eu,gb,de,jp,cn" };
  function renderCal() {
    tvWidget("tvCalendar", "events", { width: "100%", height: "100%", importanceFilter: calTv.importance, countryFilter: calTv.countries });
  }
  segBind("calImpact", v => { calTv.importance = v; renderCal(); });
  segBind("calCountry", v => { calTv.countries = v; renderCal(); });

  /* ---------- MAPA DE CALOR (widgets de TradingView, datos reales) ---------- */
  let heatKey = "SPX500";
  function renderHeat() {
    const common = { width: "100%", height: "100%", blockColor: "change", grouping: "sector", hasTopBar: false, isDataSetEnabled: false, isZoomEnabled: true, hasSymbolTooltip: true, isMonoSize: false };
    if (heatKey === "crypto") tvWidget("tvHeatmap", "crypto-coins-heatmap", { ...common, dataSource: "Crypto", blockSize: "market_cap_calc", grouping: "no_group" });
    else tvWidget("tvHeatmap", "stock-heatmap", { ...common, dataSource: heatKey, blockSize: "market_cap_basic", exchanges: [] });
  }
  segBind("heatTabs", v => { heatKey = v; renderHeat(); });


  /* ---------- MACRO ---------- */
  function tickMacro() {
    const n = CAL.find(e => e.i === "alta" && e.at > Date.now());
    $("mNextName").textContent = n ? n.n : "Sin eventos de alto impacto esta semana";
    $("mNextCount").textContent = n ? countdown(n.at - Date.now()) : "—";
    const el = $("mANext");
    if (macroTab !== "global") {
      const e = assetEvents(macroTab)[0], txt = e ? countdown(e.at - Date.now()) : "—";
      if (el) el.textContent = txt;
      document.querySelectorAll("[data-anext]").forEach(x => { x.textContent = txt; });
    }
  }

  // Cuadrícula "Inteligencia por activo" de la vista Global
  function renderAssetGrid() {
    $("mAssetsGrid").innerHTML = `<div class="card"><div class="card-head"><span class="label">Inteligencia por activo</span><span class="label">Pulsa un activo para ver su panel</span></div>
      <div class="asset-grid">${["MNQ", "NQ", "USTEC", "MYM", "ES", "GC", "CL", "EUR/USD", "GBP/USD", "USD/JPY"].map(s => { const a = ASSETS[s], r = alignOf(a);
        return `<button class="asset-tile" data-asset="${s}"><span class="asset-sym">${s}</span><span class="label" style="font-size:10px">${a.n}</span>
          <b class="${bcls(a.bias)}">${a.bias.toUpperCase()}</b><div class="progress"><i style="width:${a.conv}%"></i></div>
          <span class="pill ${r.c}">${r.short}</span></button>`; }).join("")}</div></div>`;
  }

  /* ---------- MACRO POR ACTIVO ---------- */
  // dr: [motor, estado, impacto, comentario]. al: [macro, sesgo, orderflow, mapa de calor]. flow: [% compra, delta neto].
  const D = (yields, usd, liq, growth, infl) => [
    ["Rendimientos EE. UU.", ...yields], ["Dólar (USD)", ...usd], ["Liquidez", ...liq], ["Crecimiento", ...growth], ["Inflación", ...infl]];
  const NASDAQ = {
    bias: "Alcista", conv: 38, key: "Inflación moderándose", al: ["Alcista", "Alcista", "Alcista", "Acumulación"], flow: [58, 345],
    dr: D(["Estables", "Neutral", "El bono a 10 años se mueve en un rango estrecho."], ["Estable", "Positivo", "Un dólar plano no frena a las tecnológicas."],
          ["Neutral", "Negativo", "La Fed sigue reduciendo su balance."], ["Estable", "Positivo", "Los beneficios tecnológicos superan las previsiones."], ["Moderándose", "Positivo", "El IPC subyacente se estabiliza."]),
    brief: "El Nasdaq mantiene un sesgo macro alcista con convicción baja. La moderación de la inflación y unos resultados sólidos sostienen a las tecnológicas, pero la liquidez sigue restando. El discurso de la Fed de esta semana es el principal riesgo: un tono duro podría devolver el índice a la zona de demanda."
  };
  const ASSETS = {
    MNQ: { n: "Micro Nasdaq", ...NASDAQ }, NQ: { n: "Nasdaq 100", ...NASDAQ }, USTEC: { n: "US Tech 100 Index", ...NASDAQ },
    MYM: { n: "Micro Dow", bias: "Neutral", conv: 29, key: "Crecimiento estable", al: ["Neutral", "Alcista", "Neutral", "Neutral"], flow: [52, 88],
      dr: D(["Subiendo", "Negativo", "Encarecen la financiación de las industriales."], ["Estable", "Neutral", "Sin efecto relevante."], ["Neutral", "Neutral", "Sin cambios."], ["Estable", "Positivo", "El consumo aguanta."], ["Persistente", "Negativo", "Los servicios siguen presionando."]),
      brief: "El Dow no tiene una dirección macro clara. La rotación hacia valores defensivos compensa la presión de los tipos. Mejor operar los niveles técnicos y esperar a que el sesgo se defina." },
    ES: { n: "S&P 500", bias: "Bajista", conv: 44, key: "Tipos al alza", al: ["Bajista", "Alcista", "Alcista", "Acumulación"], flow: [57, 260],
      dr: D(["Subiendo", "Negativo", "El 10 años marca máximos de un mes."], ["Fortaleciéndose", "Negativo", "Un dólar fuerte resta beneficios a las multinacionales."], ["Neutral", "Negativo", "Menos liquidez en el sistema."], ["Estable", "Positivo", "El empleo resiste."], ["Persistente", "Negativo", "El IPC sorprendió al alza."]),
      brief: "La macro apunta a la baja en el S&P 500 por la subida de tipos y el dólar fuerte, pero el orderflow y el sesgo técnico siguen siendo compradores. Esta divergencia dura ya tres sesiones y suele anticipar un giro. Conviene reducir el tamaño de las posiciones largas." },
    GC: { n: "Oro", bias: "Alcista", conv: 71, key: "Demanda refugio", al: ["Alcista", "Alcista", "Alcista", "Acumulación"], flow: [64, 1240],
      dr: D(["Estables", "Neutral", "Los tipos reales no suben."], ["Estable", "Positivo", "El dólar deja de presionar."], ["Ampliándose", "Positivo", "Los bancos centrales siguen comprando oro."], ["Desacelerándose", "Positivo", "Más demanda de activos refugio."], ["Persistente", "Positivo", "El oro protege frente a la inflación."]),
      brief: "El oro es el activo con mayor alineación de la semana. Macro, sesgo y orderflow apuntan al alza desde hace cinco sesiones, apoyados por la demanda refugio y las compras de los bancos centrales. Los retrocesos a demanda son oportunidades de compra mientras el delta siga positivo." },
    CL: { n: "Crudo WTI", bias: "Alcista", conv: 47, key: "Prima geopolítica", al: ["Alcista", "Neutral", "Bajista", "Distribución"], flow: [41, -520],
      dr: D(["Estables", "Neutral", "Sin efecto directo."], ["Fortaleciéndose", "Negativo", "Un dólar fuerte encarece el crudo fuera de EE. UU."], ["Neutral", "Neutral", "Sin cambios."], ["Desacelerándose", "Negativo", "Menos demanda industrial en China."], ["Persistente", "Positivo", "La tensión en Oriente Medio añade prima de riesgo."]),
      brief: "La macro sostiene al crudo por la prima geopolítica, pero el orderflow es vendedor y los inventarios suben. Mientras no se alineen, es preferible no tomar posiciones grandes y esperar a la publicación de los inventarios de la EIA." },
    "EUR/USD": { n: "Euro / Dólar", bias: "Bajista", conv: 52, key: "BCE expansivo", al: ["Bajista", "Bajista", "Neutral", "Distribución"], flow: [47, -140],
      dr: D(["Subiendo", "Negativo", "Se amplía el diferencial con Europa."], ["Fortaleciéndose", "Negativo", "El dólar gana atractivo."], ["Neutral", "Neutral", "Sin cambios."], ["Desacelerándose", "Negativo", "La industria alemana sigue débil."], ["Moderándose", "Negativo", "El BCE tiene margen para recortar."]),
      brief: "El euro sigue presionado por la diferencia de política monetaria: el BCE puede seguir recortando mientras la Fed mantiene los tipos. El orderflow aún no confirma, así que las ventas solo tienen sentido desde zonas de oferta." },
    "GBP/USD": { n: "Libra / Dólar", bias: "Neutral", conv: 33, key: "BoE en pausa", al: ["Neutral", "Alcista", "Neutral", "Neutral"], flow: [51, 40],
      dr: D(["Subiendo", "Negativo", "Favorece al dólar."], ["Fortaleciéndose", "Negativo", "Presión sobre el cable."], ["Neutral", "Neutral", "Sin cambios."], ["Estable", "Neutral", "El PIB británico se estanca."], ["Persistente", "Positivo", "Impide que el BoE recorte."]),
      brief: "La libra se mantiene en rango. La inflación persistente en el Reino Unido frena los recortes del BoE y compensa la fortaleza del dólar. Sin catalizador claro hasta el próximo dato de IPC británico." },
    "USD/JPY": { n: "Dólar / Yen", bias: "Bajista", conv: 41, key: "BoJ restrictivo", al: ["Bajista", "Neutral", "Neutral", "Neutral"], flow: [50, -20],
      dr: D(["Subiendo", "Positivo", "Sostienen al dólar frente al yen."], ["Fortaleciéndose", "Positivo", "Apoyo al par."], ["Neutral", "Neutral", "Sin cambios."], ["Estable", "Neutral", "Sin sorpresas."], ["Persistente", "Negativo", "Empuja al BoJ a subir tipos."]),
      brief: "La macro apunta a un yen más fuerte por la postura restrictiva del Banco de Japón, aunque los tipos americanos frenan la caída del par. Riesgo de intervención verbal si el par se acerca a 152." }
  };
  const bcls = v => /Alcista|Acumulación|Positivo/.test(v) ? "up" : /Bajista|Distribución|Negativo/.test(v) ? "down" : "flat";
  function alignOf(a) {
    const dir = v => bcls(v);
    const m = dir(a.al[0]), agree = a.al.filter(v => dir(v) === m).length;
    if (m !== "flat" && agree === 4) return { t: "ALINEACIÓN TOTAL", short: "TOTAL", c: "up" };
    if (a.al.slice(1).some(v => dir(v) !== "flat" && m !== "flat" && dir(v) !== m)) return { t: "DIVERGENCIA", short: "DIVERGENCIA", c: "down" };
    return { t: "ALINEACIÓN PARCIAL", short: "PARCIAL", c: "flat" };
  }
  const assetGroup = s => ["MNQ", "NQ", "USTEC", "MYM", "ES"].includes(s) ? "IDX" : ["GC", "CL"].includes(s) ? s : "FX";
  const assetEvents = s => CAL.filter(e => e.i === "alta" && e.at > Date.now() && e.x.includes(assetGroup(s)));
  const evTime = d => d.toLocaleTimeString("es-ES", { timeZone: "Europe/Madrid", hour: "2-digit", minute: "2-digit" }) + " CET · " + d.toLocaleDateString("es-ES", { timeZone: "Europe/Madrid", weekday: "short", day: "numeric", month: "short" });

  const DIVS = [
    ["ES", "Divergencia macro", "Macro: bajista · Sesgo y orderflow: alcistas · 3 sesiones", "VIGILAR", "Posible giro", "flat"],
    ["GC", "Alineación total", "Macro, sesgo y orderflow alcistas · 5 sesiones", "FUERTE", "Convicción alta", "up"],
    ["CL", "Divergencia macro", "Macro: alcista · Orderflow: bajista · 4 sesiones", "VIGILAR", "Posible giro", "down"],
    ["USD/JPY", "Divergencia parcial", "Macro: bajista · Orderflow: mixto · 2 sesiones", "SEGUIR", "En formación", "flat"],
  ];
  function renderDivs(el, only) {
    const list = DIVS.filter(d => !only || d[0] === only);
    el.innerHTML = list.length ? list.map(d => `<div class="div-item"><b>${d[0]} · ${d[1]}</b><span class="pill ${d[5]}">${d[3]}</span><small>${d[2]}</small><small style="text-align:right">${d[4]}</small></div>`).join("")
      : `<p style="margin:0;color:var(--muted);font-size:14px">No hay divergencias activas para este activo.</p>`;
  }

  // Alertas (se guardan en este navegador)
  const ALERT_TYPES = ["El régimen pasa a RISK-OFF", "El régimen pasa a RISK-ON", "Cambia el sesgo macro del oro", "Cambia el sesgo macro del Nasdaq", "Evento de alto impacto en 30 minutos", "Nueva divergencia macro"];
  let alerts = store.get("kairos-alerts", null) || [
    { id: "a1", t: "El régimen pasa a RISK-OFF", w: "A cualquier hora", on: true },
    { id: "a2", t: "Cambia el sesgo macro del oro", w: "Horario de mercado", on: true }];
  let alertFormOpen = false;
  function renderAlerts() {
    document.querySelectorAll("#view-macro .alert-list").forEach(el => el.innerHTML = alerts.length ? alerts.map(a => `
      <div class="alert-item"><b>${esc(a.t)}</b><button class="pill ${a.on ? "up" : "flat"}" style="border:0;cursor:pointer" data-alert-toggle="${a.id}">${a.on ? "ACTIVA" : "EN PAUSA"}</button>
      <small>${a.on ? "Activa" : "En pausa"} · ${esc(a.w)}</small><button class="icon-btn" data-alert-del="${a.id}">Eliminar</button></div>`).join("")
      : `<p style="margin:0;color:var(--muted);font-size:14px">No tienes alertas. Crea una con «+ Nueva alerta».</p>`);
    document.querySelectorAll("#view-macro .alert-form").forEach(f => {
      f.hidden = !alertFormOpen;
      f.innerHTML = alertFormOpen ? `<label class="field"><span class="label">Avisarme cuando</span><select data-af="t">${ALERT_TYPES.map(t => `<option>${t}</option>`).join("")}</select></label>
        <label class="field"><span class="label">Horario</span><select data-af="w"><option>A cualquier hora</option><option>Horario de mercado</option><option>Solo sesión de Nueva York</option></select></label>
        <div style="display:flex;gap:8px"><button class="btn primary" data-alert-save>Crear alerta</button><button class="btn" data-alert-cancel>Cancelar</button></div>` : "";
    });
  }
  $("view-macro").addEventListener("click", e => {
    const t = e.target;
    if (t.closest("[data-alert-new]")) { alertFormOpen = !alertFormOpen; renderAlerts(); return; }
    if (t.closest("[data-alert-cancel]")) { alertFormOpen = false; renderAlerts(); return; }
    if (t.closest("[data-alert-save]")) { const f = t.closest(".alert-form");
      alerts.push({ id: "a" + Date.now(), t: f.querySelector('[data-af="t"]').value, w: f.querySelector('[data-af="w"]').value, on: true });
      alertFormOpen = false; store.set("kairos-alerts", alerts); renderAlerts(); return; }
    const tg = t.closest("[data-alert-toggle]"); if (tg) { const a = alerts.find(x => x.id === tg.dataset.alertToggle); a.on = !a.on; store.set("kairos-alerts", alerts); renderAlerts(); return; }
    const dl = t.closest("[data-alert-del]"); if (dl) { alerts = alerts.filter(x => x.id !== dl.dataset.alertDel); store.set("kairos-alerts", alerts); renderAlerts(); return; }
    if (t.closest("[data-macro-back]")) { selectMacro("global"); return; }
    const row = t.closest("[data-asset]"); if (row) selectMacro(row.dataset.asset);
  });

  function deltaSpark(s, a) {
    const r = rng(daySeed + s), W = 320, H = 70, n = 40; let v = 0; const pts2 = [];
    for (let i = 0; i < n; i++) { v += (a.flow[1] / n) + (r() - .5) * Math.abs(a.flow[1] || 200) / 6; pts2.push(v); }
    pts2[n - 1] = a.flow[1];
    const mn = Math.min(0, ...pts2), mx = Math.max(0, ...pts2), sp = mx - mn || 1;
    const X = i => i / (n - 1) * W, Y = y => 4 + (mx - y) / sp * (H - 8);
    const line = pts2.map((y, i) => `${X(i).toFixed(1)},${Y(y).toFixed(1)}`).join(" "), col = a.flow[1] >= 0 ? "#22f5a5" : "#ff4d7d";
    return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block" role="img" aria-label="Delta acumulado">
      <line x1="0" x2="${W}" y1="${Y(0)}" y2="${Y(0)}" stroke="#8b93ad" stroke-dasharray="3 3"/>
      <polygon points="0,${Y(0)} ${line} ${W},${Y(0)}" fill="${col}" fill-opacity=".15"/><polyline points="${line}" fill="none" stroke="${col}" stroke-width="2"/>
      <circle cx="${X(n - 1)}" cy="${Y(pts2[n - 1])}" r="3.5" fill="${col}"/></svg>`;
  }

  function renderAsset(s) {
    const a = ASSETS[s], r = alignOf(a), evs = assetEvents(s), nx = evs[0];
    const conf = Math.min(99, Math.round((a.conv + a.al.filter(v => bcls(v) === bcls(a.al[0])).length * 12) * .85));
    const convTxt = a.conv >= 60 ? "CONVICCIÓN ALTA" : a.conv >= 40 ? "CONVICCIÓN MEDIA" : "CONVICCIÓN BAJA";
    const [buy, delta] = a.flow, sig = buy >= 55 ? "COMPRADORA" : buy <= 45 ? "VENDEDORA" : "NEUTRAL", sigC = buy >= 55 ? "up" : buy <= 45 ? "down" : "flat";
    const fconv = Math.abs(buy - 50) >= 12 ? "ALTA" : Math.abs(buy - 50) >= 6 ? "MEDIA" : "BAJA";
    $("mTitle").textContent = `${s} — ${a.n} · inteligencia macro`;
    $("mAsset").innerHTML = `
      <div class="card span-12 intel-hero">
        <div class="intel-head"><span class="label"><span class="dot"></span>&nbsp; ${s} — ${a.n.toUpperCase()} · INTELIGENCIA MACRO</span><button class="icon-btn" data-macro-back>← Global</button></div>
        <div class="intel-grid">
          <div class="intel-cell"><span class="label">Sesgo macro</span><b class="intel-big ${bcls(a.bias)}">${a.bias.toUpperCase()}</b><small>Motor principal: ${a.key}</small></div>
          <div class="intel-cell"><span class="label">Convicción</span><b class="intel-mid">${a.conv}<small>/100</small></b><div class="progress"><i style="width:${a.conv}%"></i></div><small>${convTxt}</small></div>
          <div class="intel-cell"><span class="label">Alineación Kairos</span><span class="pill ${r.c} intel-pill">${r.t}</span><small>Confianza ${conf}% · ${(a.alLabels || ["macro", "sesgo", "orderflow", "mapa de calor"]).join(", ").toLowerCase()}</small></div>
          <div class="intel-cell"><span class="label">Próximo riesgo · ejemplo</span><b class="intel-event">${nx ? esc(nx.n) : "Sin eventos esta semana"}</b><span class="intel-count mono" data-anext>${nx ? countdown(nx.at - Date.now()) : "—"}</span><small>${nx ? evTime(nx.at) + " · alto impacto" : ""}</small></div>
        </div>
      </div>
      <div class="card span-4"><span class="label">Motores principales</span>
        <div class="drv">${a.dr.map(d => `<div><span>${d[0]}</span><small>${d[1]}</small><span class="pill ${bcls(d[2])}">${d[2].toUpperCase()}</span></div>`).join("")}</div></div>
      <div class="card span-4"><span class="label">Alineación Kairos</span>
        <div class="al4">${(a.alLabels || ["Macro", "Sesgo", "Orderflow", "Mapa de calor"]).map((l, i) => `<div><span class="label" style="font-size:10px">${l}</span><b class="${bcls(a.al[i])}">${a.al[i]}</b></div>`).join("")}</div>
        <span class="pill ${r.c}" style="justify-self:start;font-size:13px;padding:8px 12px">${r.t}</span>
        <div style="display:grid;gap:6px"><span class="label">Confianza · <b style="color:var(--text)">${conf}%</b></span><div class="progress"><i style="width:${conf}%"></i></div></div>
        <span class="label" style="margin-top:4px">Divergencias</span><div class="div-list" id="mDivA"></div></div>
      <div class="card span-4"><span class="label">Próximo riesgo</span>
        ${nx ? `<b style="font:600 18px var(--f-display)">${esc(nx.n)}</b><small class="mono" style="color:var(--muted)">${evTime(nx.at)}</small><div class="regime mono" style="font-size:30px" id="mANext">${countdown(nx.at - Date.now())}</div><span class="imp alta">ALTO IMPACTO</span>`
              : `<p style="margin:0;color:var(--muted)">No quedan eventos de alto impacto esta semana para ${s}.</p><span id="mANext" hidden></span>`}
        <span class="label" style="margin-top:6px">Agenda</span>
        <div class="ev-list">${evs.slice(0, 5).map(e => `<div><span><b>${esc(e.n)}</b><br><small class="mono" style="color:var(--muted)">${evTime(e.at)}</small></span><span class="imp alta">ALTO</span></div>`).join("") || '<small style="color:var(--muted)">Sin eventos pendientes.</small>'}</div></div>
      <div class="card span-7"><span class="label">Matriz de motores</span>
        <div class="tbl-wrap"><table class="tbl" style="min-width:520px"><thead><tr><th>Motor</th><th>Estado</th><th>Impacto en ${s}</th><th>Lectura</th></tr></thead><tbody>
        ${a.dr.map(d => `<tr><td><b>${d[0]}</b></td><td>${d[1]}</td><td><span class="pill ${bcls(d[2])}">${d[2].toUpperCase()}</span></td><td style="color:var(--muted)">${d[3]}</td></tr>`).join("")}</tbody></table></div></div>
      <div class="card span-5"><div class="card-head"><span class="label">Resumen IA del activo</span><span class="label">${new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</span></div>
        <p style="margin:0">${a.brief}</p></div>
      <div class="card span-7"><div class="card-head"><span class="label">Señal de orderflow macro</span><span class="demo-tag">EJEMPLO</span></div>
        <div style="display:grid;gap:8px">
          <div class="bar-row"><span>Presión compradora</span><div class="track"><i style="left:0;width:${buy}%;background:var(--up)"></i></div><span class="mono up" style="text-align:right">${buy}%</span></div>
          <div class="bar-row"><span>Presión vendedora</span><div class="track"><i style="left:0;width:${100 - buy}%;background:var(--down)"></i></div><span class="mono down" style="text-align:right">${100 - buy}%</span></div>
        </div>
        <span class="label">Delta acumulado · sesión</span>${deltaSpark(s, a)}
        <div class="meta-row"><div><span class="label">Delta neto</span><b class="${delta >= 0 ? "up" : "down"}">${delta > 0 ? "+" : ""}${delta.toLocaleString("es-ES")}</b></div>
          <div><span class="label">Compra / venta</span><b>${buy} / ${100 - buy}</b></div>
          <div><span class="label">Señal</span><b class="${sigC}">${sig}</b></div>
          <div><span class="label">Convicción</span><b>${fconv}</b></div></div></div>
      <div class="card span-5"><div class="card-head"><span class="label">Alertas macro</span><button class="icon-btn" data-alert-new style="color:var(--brass);border-color:var(--brass)">+ Nueva alerta</button></div>
        <div class="alert-form" hidden></div><div class="alert-list"></div></div>`;
    renderDivs($("mDivA"), s); renderAlerts();
  }

  let macroTab = "global";
  function showMacro() {
    const g = macroTab === "global";
    $("mGlobal").hidden = !g; $("mAsset").hidden = g;
    if (g) { $("mTitle").textContent = "Panorama macro global"; renderMacro(); } else renderAsset(macroTab);
  }
  function selectMacro(v) {
    macroTab = v;
    $("mTabs").querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", b.dataset.v === v));
    showMacro(); window.scrollTo(0, 0);
  }
  segBind("mTabs", v => { macroTab = v; showMacro(); });
  let macroQuotesDone = false;
  function renderMacro() {
    if (!macroQuotesDone) { macroQuotesDone = true;
      window.KAIROS.macroQuotes.forEach((q, i) => { const c = document.createElement("div"); c.className = "card tv-quote"; c.id = "tvmq" + i; $("tvMacroQuotes").appendChild(c); tvWidget(c, "single-quote", { symbol: q.tv, width: "100%" }); }); }
    const days = []; const d = new Date(today);
    while (days.length < 7) { if (d.getDay() % 6 !== 0) days.unshift(new Date(d)); d.setDate(d.getDate() - 1); }
    const reg = LIVE ? LIVE.global.regimeHistory.map(r => r.regime) : ["Risk-on", "Neutral", "Neutral", "Risk-off", "Risk-off", "Neutral", "Risk-off"];
    if (LIVE) { days.length = 0; LIVE.global.regimeHistory.forEach(r => days.push(new Date(r.date + "T12:00:00"))); }
    const rc = { "Risk-on": "var(--up-dim)", "Neutral": "#c9b45824", "Risk-off": "var(--down-dim)" };
    $("mHist").innerHTML = days.map((x, i) => `<div><span style="background:${rc[reg[i]]}">${reg[i].replace("Risk-", "").toUpperCase()}</span>${i === 6 ? "Hoy" : cap(x.toLocaleDateString("es-ES", { weekday: "short" }).replace(".", ""))}</div>`).join("");
    const drv = LIVE ? LIVE.global.scores.map(x => [x.name, x.v]) : [["Apetito de riesgo", -38], ["Dólar (DXY)", 55], ["Bono 10 años", 62], ["Volatilidad (VIX)", 30], ["Crédito", -15]];
    $("mDrivers").innerHTML = drv.map(([n, v]) => `<div class="bar-row"><span>${n}</span><div class="track"><i style="left:${v >= 0 ? 50 : 50 + v / 2}%;width:${Math.abs(v) / 2}%;background:${v >= 0 ? "var(--up)" : "var(--down)"}"></i><i style="left:50%;width:1px;background:var(--muted)"></i></div><span class="mono ${v >= 0 ? "up" : "down"}" style="text-align:right">${v > 0 ? "+" : ""}${v}</span></div>`).join("");
    $("mAlign").innerHTML = `<thead><tr><th>Activo</th><th>Sesgo macro</th><th>Orderflow</th><th>Motor principal</th><th>Alineación</th></tr></thead><tbody>` +
      ["NQ", "ES", "GC", "CL", "EUR/USD", "USD/JPY"].map(s => { const a = ASSETS[s], r = alignOf(a);
        return `<tr data-asset="${s}" style="cursor:pointer"><td><b>${s}</b></td><td class="${bcls(a.bias)}">${a.bias}</td><td class="${bcls(a.al[2])}">${a.al[2]}</td><td style="color:var(--muted)">${a.key}</td><td><span class="pill ${r.c}">${r.short}</span></td></tr>`; }).join("") + "</tbody>";
    renderDivs($("mDivG"), null); renderAlerts(); renderAssetGrid();
    const banks = [["Fed", "EE. UU.", "Restrictiva", "4,25 %"], ["BCE", "Eurozona", "Expansiva", "2,00 %"], ["BoE", "Reino Unido", "Neutral", "4,00 %"], ["BoJ", "Japón", "Restrictiva", "0,50 %"], ["PBoC", "China", "Estímulos", "3,00 %"]];
    if (LIVE && LIVE.global.policy) { const p = LIVE.global.policy, f = x => x == null ? null : x.toFixed(2).replace(".", ",") + " %"; if (f(p.fed_upper)) banks[0][3] = f(p.fed_upper); if (f(p.ecb_deposit)) banks[1][3] = f(p.ecb_deposit); }
    const bc = { Restrictiva: "down", Expansiva: "up", "Estímulos": "up", Neutral: "flat" };
    $("mBanks").innerHTML = banks.map(b => `<div class="cb"><span class="label">${b[1]}</span><b>${b[0]} · <span class="mono">${b[3]}</span></b><span class="pill ${bc[b[2]]}" style="justify-self:start">${b[2].toUpperCase()}</span></div>`).join("");
    const A = LIVE ? LIVE.global.correlation.labels : ["NQ", "ES", "GC", "DXY", "CL", "10Y"];
    const C = LIVE ? LIVE.global.correlation.matrix.map(r => r.map(v => v == null ? 0 : v)) : [[1, .94, -.12, -.48, .15, -.56], [.94, 1, -.05, -.41, .22, -.49], [-.12, -.05, 1, -.62, .18, -.35], [-.48, -.41, -.62, 1, -.08, .58], [.15, .22, .18, -.08, 1, .12], [-.56, -.49, -.35, .58, .12, 1]];
    $("mCorr").style.gridTemplateColumns = `48px repeat(${A.length}, minmax(44px, 1fr))`;
    $("mCorr").innerHTML = "<div></div>" + A.map(a => `<div class="label">${a}</div>`).join("") +
      A.map((a, i) => `<div class="label">${a}</div>` + C[i].map(v => `<div style="background:color-mix(in srgb, ${v >= 0 ? "#22f5a5" : "#ff4d7d"} ${(Math.abs(v) * 70).toFixed(0)}%, #121830)">${v.toFixed(2).replace(".", ",")}</div>`).join("")).join("");
    $("mBriefTime").textContent = LIVE ? "Datos FRED a " + LIVE.asOf.split("-").reverse().join("/") : "Actualizado " + new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    if (LIVE) {
      const g = LIVE.global, rc = g.regime === "RISK-ON" ? "up" : g.regime === "RISK-OFF" ? "down" : "flat";
      $("mRegime").textContent = g.regime; $("mRegime").className = "regime " + rc;
      $("mRegimeNote").textContent = g.macroBias;
      $("mConv").innerHTML = g.conviction + '<small style="font-size:16px;color:var(--muted)"> / 100</small>'; $("mConvBar").style.width = g.conviction + "%";
      $("mBrief").textContent = g.brief; $("mPrimary").textContent = g.primaryDriver; $("mWindow").textContent = g.riskWindow;
      $("mBias").textContent = g.macroBias; $("mBias").className = rc;
    }
    tickMacro();
  }

  /* ---------- Datos macro reales (/api/macro: FRED + Claude) ---------- */
  let LIVE = null, liveTried = false;
  async function loadLiveMacro() {
    if (liveTried) return; liveTried = true;
    try {
      const r = await fetch("/api/macro");
      if (!r.ok) throw new Error("HTTP " + r.status);
      const j = await r.json();
      if (!j.assets || !j.global) throw new Error("respuesta incompleta");
      LIVE = j;
      Object.entries(j.assets).forEach(([s, a]) => { if (ASSETS[s]) ASSETS[s] = { ...ASSETS[s], ...a }; });
      const t = new Date(j.generatedAt).toLocaleString("es-ES", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
      $("mSource").textContent = "DATOS REALES · FRED" + (j.engine === "ia" ? " + IA" : "") + " · " + t;
      $("mSource").classList.add("live-src");
      if (!$("view-macro").hidden) showMacro();
    } catch (e) {
      console.info("Macro en modo ejemplo:", e.message);
    }
  }

  /* ---------- DIARIO ---------- */
  const SYMS = ["MNQ", "NQ", "USTEC", "MES", "ES", "MYM", "YM", "GC", "MGC", "CL"];
  $("jSym").innerHTML = SYMS.map(s => `<option>${s}</option>`).join("");
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const dmy = s => s.split("-").reverse().join("/");
  function bdaysAgo(n) { const d = new Date(today); while (n > 0) { d.setDate(d.getDate() - 1); if (d.getDay() % 6 !== 0) n--; } return iso(d); }
  const SEED = [
    [15, "MNQ", "L", "Nueva York", 21310, 21352, 20, "Rebote en demanda tras la apertura"],
    [14, "GC", "S", "Londres", 2671.4, 2665.2, 4, "Rechazo en oferta de 1H"],
    [13, "MNQ", "S", "Nueva York", 21420, 21436, 18, "Entrada contra el sesgo"],
    [12, "MES", "L", "Nueva York", 5841.25, 5852.5, 6, ""],
    [11, "GC", "L", "Londres", 2668.0, 2679.5, 5, "Barrido de mínimos y absorción"],
    [10, "MNQ", "L", "Nueva York", 21388, 21375, 15, "Stop por el dato de IPC"],
    [9, "CL", "S", "Nueva York", 72.10, 71.62, 0.3, "Inventarios EIA"],
    [8, "MNQ", "L", "Londres", 21402, 21402, 12, "Break even"],
    [7, "MES", "S", "Nueva York", 5866, 5858.75, 5, ""],
    [6, "GC", "L", "Nueva York", 2676.2, 2671.0, 4, "Entré con el delta negativo"],
    [5, "MNQ", "L", "Nueva York", 21440, 21498, 20, "Continuación con delta positivo"],
    [4, "MES", "L", "Londres", 5869.5, 5876, 5, ""],
    [3, "GC", "S", "Nueva York", 2690.1, 2683.4, 4, ""],
    [2, "MNQ", "S", "Asia", 21480, 21492, 15, "Asia sin volumen, no repetir"],
    [1, "MNQ", "L", "Nueva York", 21430, 21466, 18, "Plan seguido al pie de la letra"],
  ].map(([n, sym, side, sess, entry, exit, risk, note], i) => ({ id: "demo" + i, date: bdaysAgo(n), sym, side, sess, entry, exit, risk, note, demo: true }));
  let trades = store.get("kairos-journal", null) || SEED;
  const pts = t => +(((t.exit - t.entry) * (t.side === "L" ? 1 : -1)).toFixed(2));
  const fmtP = v => (v > 0 ? "+" : "") + v.toLocaleString("es-ES", { maximumFractionDigits: 2 });

  function renderJournal() {
    const ts = [...trades].sort((a, b) => a.date.localeCompare(b.date));
    const res = ts.map(pts), wins = res.filter(r => r > 0), losses = res.filter(r => r < 0);
    const total = res.reduce((a, b) => a + b, 0);
    let peak = 0, cum = 0, dd = 0; const curve = [0];
    res.forEach(r => { cum += r; curve.push(cum); peak = Math.max(peak, cum); dd = Math.max(dd, peak - cum); });
    const avgW = wins.length ? wins.reduce((a, b) => a + b, 0) / wins.length : 0, avgL = losses.length ? -losses.reduce((a, b) => a + b, 0) / losses.length : 0;
    const wr = ts.length ? wins.length / ts.length * 100 : 0;
    $("jKpis").innerHTML = `
      <div class="kpi"><span class="label">Operaciones</span><b>${ts.length}</b><small>${wins.length} ganadas · ${losses.length} perdidas · ${ts.length - wins.length - losses.length} en break even</small></div>
      <div class="kpi"><span class="label">Tasa de acierto</span><b class="${wr >= 50 ? "up" : "down"}">${wr.toFixed(0)}%</b><small>${wr >= 50 ? "Por encima del 50%" : "Por debajo del 50%"}</small></div>
      <div class="kpi"><span class="label">Resultado</span><b class="${total >= 0 ? "up" : "down"}">${fmtP(+total.toFixed(2))} pts</b><small>acumulado</small></div>
      <div class="kpi"><span class="label">Drawdown máximo</span><b class="down">${dd ? "−" + dd.toLocaleString("es-ES", { maximumFractionDigits: 2 }) : "0"} pts</b><small>de máximo a mínimo</small></div>
      <div class="kpi"><span class="label">Ganancia / pérdida media</span><b>${avgL ? (avgW / avgL).toFixed(2).replace(".", ",") : "—"}</b><small>${fmtP(+avgW.toFixed(2))} / −${avgL.toFixed(2).replace(".", ",")} pts</small></div>`;
    const W = 640, H = 220, L = 44, R = 12, T = 12, B = 24;
    if (ts.length) {
      const mn = Math.min(0, ...curve), mx = Math.max(0, ...curve), span = mx - mn || 1;
      const X = i => L + i / (curve.length - 1 || 1) * (W - L - R), Y = v => T + (mx - v) / span * (H - T - B);
      const ticks = [mn, mn + span / 3, mn + span * 2 / 3, mx];
      const line = curve.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(" ");
      const end = curve.at(-1), col = end >= 0 ? "#22f5a5" : "#ff4d7d";
      $("jCurve").innerHTML = `<svg viewBox="0 0 ${W} ${H}" style="height:auto" role="img" aria-label="Curva de capital">
        ${ticks.map(t => `<line x1="${L}" x2="${W - R}" y1="${Y(t)}" y2="${Y(t)}" stroke="#1d2742" stroke-width="1"/><text x="${L - 6}" y="${Y(t) + 3}" text-anchor="end">${Math.round(t)}</text>`).join("")}
        <line x1="${L}" x2="${W - R}" y1="${Y(0)}" y2="${Y(0)}" stroke="#8b93ad" stroke-dasharray="3 3" stroke-width="1"/>
        <polygon points="${X(0)},${Y(0)} ${line} ${X(curve.length - 1)},${Y(0)}" fill="${col}" fill-opacity=".14"/>
        <polyline points="${line}" fill="none" stroke="${col}" stroke-width="2" stroke-linejoin="round"/>
        <circle cx="${X(curve.length - 1)}" cy="${Y(end)}" r="4" fill="${col}"/>
        <text x="${L}" y="${H - 6}">${dmy(ts[0].date)}</text><text x="${W - R}" y="${H - 6}" text-anchor="end">${dmy(ts.at(-1).date)}</text>
      </svg>`;
    } else $("jCurve").innerHTML = `<p style="color:var(--muted);margin:40px 0;text-align:center">Añade tu primera operación para ver la curva de capital.</p>`;
    $("jSessions").innerHTML = ["Londres", "Nueva York", "Asia"].map(s => {
      const r = ts.filter(t => t.sess === s).map(pts), w = r.filter(x => x > 0).length, p = r.reduce((a, b) => a + b, 0), rate = r.length ? w / r.length * 100 : 0;
      return `<div style="display:grid;gap:6px"><div style="display:flex;justify-content:space-between;gap:8px"><b>${s}</b><span class="mono ${p >= 0 ? "up" : "down"}">${r.length ? fmtP(+p.toFixed(2)) + " pts" : "—"}</span></div>
        <div class="progress"><i style="width:${rate}%;background:${rate >= 50 ? "var(--up)" : "var(--down)"}"></i></div>
        <small style="color:var(--muted)">${r.length} operaciones · ${rate.toFixed(0)}% de acierto</small></div>`;
    }).join("");
    $("jClearDemo").hidden = !trades.some(t => t.demo);
    $("jTable").innerHTML = `<thead><tr><th>Fecha</th><th>Instrumento</th><th>Dir.</th><th>Sesión</th><th class="num">Entrada</th><th class="num">Salida</th><th class="num">Resultado</th><th class="num">R</th><th>Notas</th><th></th></tr></thead><tbody>` +
      ([...ts].reverse().map(t => { const p = pts(t);
        return `<tr><td class="mono">${dmy(t.date)}</td><td><b>${esc(t.sym)}</b>${t.demo ? ' <span class="tag">ejemplo</span>' : ""}</td>
          <td class="${t.side === "L" ? "up" : "down"}">${t.side === "L" ? "Largo" : "Corto"}</td><td>${esc(t.sess)}</td>
          <td class="num">${t.entry}</td><td class="num">${t.exit}</td><td class="num ${p > 0 ? "up" : p < 0 ? "down" : ""}">${fmtP(p)}</td>
          <td class="num">${t.risk ? (p / t.risk).toFixed(1).replace(".", ",") + "R" : "—"}</td><td style="color:var(--muted);max-width:280px">${esc(t.note || "")}</td>
          <td><button class="icon-btn" data-del="${t.id}" aria-label="Eliminar operación">Eliminar</button></td></tr>`; }).join("") ||
        `<tr><td colspan="10" style="text-align:center;color:var(--muted);padding:28px">Aún no hay operaciones. Usa el formulario de arriba para añadir la primera.</td></tr>`) + "</tbody>";
  }
  const saveTrades = () => store.set("kairos-journal", trades);
  $("jDate").value = iso(today);
  $("jForm").addEventListener("submit", e => {
    e.preventDefault();
    const entry = parseFloat($("jEntry").value), exit = parseFloat($("jExit").value);
    if (!isFinite(entry) || !isFinite(exit)) { $("jMsg").style.color = "var(--down)"; $("jMsg").textContent = "Introduce un precio de entrada y uno de salida válidos."; return; }
    trades.push({ id: "t" + Date.now(), date: $("jDate").value || iso(today), sym: $("jSym").value, side: $("jSide").value, sess: $("jSess").value,
      entry, exit, risk: parseFloat($("jRisk").value) || 0, note: $("jNote").value.trim() });
    saveTrades(); renderJournal();
    ["jEntry", "jExit", "jRisk", "jNote"].forEach(id => $(id).value = "");
    $("jMsg").style.color = "var(--up)"; $("jMsg").textContent = "Operación guardada.";
  });
  $("jTable").addEventListener("click", e => { const b = e.target.closest("[data-del]"); if (!b) return;
    trades = trades.filter(t => t.id !== b.dataset.del); saveTrades(); renderJournal(); });
  $("jClearDemo").addEventListener("click", () => { trades = trades.filter(t => !t.demo); saveTrades(); renderJournal(); });

  /* ---------- ACADEMIA ---------- */
  // Temario público del curso (títulos). El texto de cada lección lo entrega /api/academia solo a quien ha comprado el curso.
  const MODS = [["La Sala de Mando","Cómo leer cada módulo del panel y en qué orden mirarlo.",[["Qué es la Sala de Mando"],["El sesgo y la confianza"],["Precios y flujo"],["Cómo leer el briefing"],["El calendario económico"],["Sesiones y apertura de NY"]]],["Oferta y demanda","Zonas donde el precio reaccionó con fuerza y por qué tienden a repetirse.",[["Qué es una zona"],["Cómo identificar una zona válida"],["Zonas en MNQ, MES y oro"],["Fuerza y confluencias"],["Entradas desde zonas"],["Zonas y sesgo"]]],["Orderflow","Ver quién está agrediendo el mercado en cada momento.",[["Qué es el orderflow"],["El delta"],["Barras de compra y venta"],["Volumen por precio y absorción"],["Divergencias de delta"],["Orderflow en el briefing"]]],["Ejecución","Del análisis a la orden: rutina, entradas y gestión del riesgo.",[["Preparación antes del mercado"],["La apertura de Nueva York"],["El modelo de entrada"],["Gestión del riesgo"],["Gestión de la operación"],["La rutina diaria completa"]]]];
  const done = new Set(store.get("kairos-academy", []));
  let open = null;
  let lessons = null; // texto completo de las lecciones, solo si el usuario ha comprado el curso
  const access = () => window.KairosUser || {};
  if (window.KAIROS.checkoutCourse) $("aBuy").href = window.KAIROS.checkoutCourse;
  async function loadLessons() {
    try {
      const r = await fetch("/api/academia", { cache: "no-store" });
      if (r.ok) { lessons = (await r.json()).modules; renderAcademy(); }
    } catch {}
  }
  const expanded = new Set([0]); // módulos desplegados
  const lessonId = (mi, li) => mi + "-" + li;
  function step(dir) { // lección anterior (-1) o siguiente (+1)
    let [mi, li] = open.split("-").map(Number); li += dir;
    if (li < 0) { mi--; if (mi < 0) return null; li = MODS[mi][2].length - 1; }
    if (li >= MODS[mi][2].length) { mi++; li = 0; if (mi >= MODS.length) return null; }
    return lessonId(mi, li);
  }
  function renderAcademy() {
    const exclusive = !!access().course && !!lessons;
    if (access().course && !lessons) loadLessons();
    $("aLock").hidden = !!access().course;
    $("aModules").classList.toggle("locked", !access().course);
    $("aModules").setAttribute("aria-hidden", String(!access().course));
    if (!exclusive) open = null;
    const total = MODS.reduce((a, m) => a + m[2].length, 0), pct = Math.round(done.size / total * 100);
    $("aTotal").textContent = pct + "%"; $("aTotalBar").style.width = pct + "%";
    $("aModules").innerHTML = MODS.map(([t, d, ls], mi) => {
      const n = ls.filter((_, li) => done.has(lessonId(mi, li))).length, p = Math.round(n / ls.length * 100), isOpen = expanded.has(mi);
      return `<div class="card mod ${isOpen ? "open" : ""}">
        <button class="mod-toggle" data-mod="${mi}" aria-expanded="${isOpen}">
          <img class="mod-cover" src="img/academia/modulo-${mi + 1}.svg" alt="" width="640" height="220" loading="lazy">
          <span class="card-head"><span class="mod-num">MÓDULO ${pad(mi + 1)}</span><span class="label">${n}/${ls.length} lecciones <span class="chev">${isOpen ? "▴" : "▾"}</span></span></span>
          <h3>${t}</h3><span class="mod-desc">${d}</span>
          <span class="progress"><i style="width:${p}%"></i></span>
        </button>
        ${isOpen ? `<ul class="lessons">${ls.map((l, li) => `<li class="${done.has(lessonId(mi, li)) ? "done" : ""}"><button data-lesson="${lessonId(mi, li)}" ${exclusive ? "" : "disabled"}><span class="ck">${done.has(lessonId(mi, li)) ? "✓" : ""}</span>${l[0]}<span class="go">${exclusive ? "Abrir →" : "Cargando…"}</span></button></li>`).join("")}</ul>` : ""}
      </div>`;
    }).join("");
    const r = $("aReader");
    r.classList.add("viewer");
    document.body.classList.toggle("viewer-open", !!open);
    if (!open) { r.hidden = true; return; }
    const [mi, li] = open.split("-").map(Number), l = lessons[mi].lessons[li], isDone = done.has(open), prev = step(-1), next = step(1);
    r.hidden = false;
    r.innerHTML = `<div class="card-head"><span class="mod-num">MÓDULO ${pad(mi + 1)} · ${esc(MODS[mi][0])} · LECCIÓN ${li + 1} DE ${MODS[mi][2].length}</span><button class="icon-btn" data-act="close" aria-label="Cerrar la lección">Cerrar ✕</button></div>
      <h3>${esc(l.title)}</h3>
      ${l.fig ? `<figure class="fig">${l.fig.svg}<figcaption>${esc(l.fig.caption)}</figcaption></figure>` : ""}
      ${l.video ? `<div class="video"><iframe src="${esc(l.video)}" title="${esc(l.title)}" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe></div>` : ""}
      <p class="lead">${esc(l.body)}</p>
      ${l.steps?.length ? `<div class="steps-box"><span class="label">Cómo aplicarlo</span><ol>${l.steps.map(s => `<li>${esc(s)}</li>`).join("")}</ol></div>` : ""}
      ${l.example ? `<div class="example"><span class="label">Ejemplo práctico</span><p>${esc(l.example)}</p></div>` : ""}
      <div class="tip"><span class="label" style="color:var(--brass)">Clave</span><br>${esc(l.key)}</div>
      <div class="viewer-nav">
        <button class="btn" data-act="prev" ${prev ? "" : "disabled"}>← Anterior</button>
        <button class="btn ${isDone ? "" : "primary"}" data-act="toggle">${isDone ? "Completada ✓" : "Marcar como completada"}</button>
        <button class="btn" data-act="next" ${next ? "" : "disabled"}>Siguiente →</button>
      </div>`;
    r.scrollTop = 0;
  }
  $("aModules").addEventListener("click", e => {
    const m = e.target.closest("[data-mod]");
    if (m) { const i = +m.dataset.mod; expanded.has(i) ? expanded.delete(i) : expanded.add(i); return renderAcademy(); }
    const b = e.target.closest("[data-lesson]"); if (!b || !lessons) return;
    open = b.dataset.lesson; renderAcademy();
  });
  $("aReader").addEventListener("click", e => {
    const a = e.target.closest("[data-act]")?.dataset.act; if (!a) return;
    if (a === "close") open = null;
    if (a === "toggle") { done.has(open) ? done.delete(open) : done.add(open); store.set("kairos-academy", [...done]); }
    if (a === "prev") open = step(-1) || open;
    if (a === "next") { done.add(open); store.set("kairos-academy", [...done]); const n = step(1); if (n) { open = n; expanded.add(+n.split("-")[0]); } }
    renderAcademy();
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && open) { open = null; renderAcademy(); } });

  /* ---------- Registro de vistas y temporizador ---------- */
  window.KairosViews = { cal: renderCal, heat: renderHeat, macro: () => { showMacro(); loadLiveMacro(); }, journal: renderJournal, academy: renderAcademy };
  setInterval(() => {
    if (!$("view-macro").hidden) tickMacro();
  }, 1000);
})();
