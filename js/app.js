/* Sala de Mando: navegación, relojes, precios en vivo (TradingView) y módulos de orderflow.
   El sesgo, el orderflow, los niveles y el briefing son DATOS DE EJEMPLO simulados hasta conectar un proveedor de orderflow. */
(() => {
  const K = window.KAIROS;

  // ---------- Datos de ejemplo (orderflow simulado) ----------
  // Precio de referencia aproximado para los módulos de ejemplo; el precio real lo muestran los widgets de TradingView.
  const REF = { MNQ: [30190.25, 0.25], NQ: [30191.5, 0.25], USTEC: [29979.6, 0.1], MES: [7802, 0.25], ES: [7802.5, 0.25], MYM: [48520, 1], YM: [48522, 1],
    GC: [4208.2, 0.1], MGC: [4207.8, 0.1], CL: [95.81, 0.01], "EUR/USD": [1.1264, 0.0001], "GBP/USD": [1.332, 0.0001], "USD/JPY": [151.24, 0.01],
    "BTC/USD": [112400, 1], "ETH/USD": [4120, 0.1], "SOL/USD": [205.3, 0.01] };
  const M = K.instruments.map(({ s, n }) => { const [p, t] = REF[s] || [100, 0.01];
    return { s, n, open: p, p, t, buy: 50 + (Math.random() * 24 - 8), delta: Math.round(Math.random() * 600 - 150) }; });
  const bySym = Object.fromEntries(M.map(m => [m.s, m]));
  let selected = ["MNQ", "MES", "GC"];
  let focus = "MNQ";
  const buckets = Array.from({ length: 12 }, () => Math.round(Math.random() * 160 - 50));

  const dec = t => t >= 1 ? 0 : String(t).split(".")[1].length;
  const fmt = (v, t) => v.toLocaleString("es-ES", { minimumFractionDigits: dec(t), maximumFractionDigits: dec(t) });
  const sign = v => (v > 0 ? "+" : "");
  const state = m => m.buy >= 55 ? "up" : m.buy <= 45 ? "down" : "flat";
  const stateTxt = { up: "ALCISTA", down: "BAJISTA", flat: "NEUTRAL" };

  // Enlaces de Discord (desde config.js)
  if (K.discord) document.querySelectorAll("[data-discord]").forEach(a => { a.href = K.discord; });

  // ---------- Selector de mercados ----------
  function renderChips() {
    document.getElementById("markets").innerHTML = '<span class="label" style="align-self:center;margin-right:6px">Mercados</span>' +
      M.map(m => `<button class="chip" aria-pressed="${selected.includes(m.s)}" data-s="${m.s}">${m.s}</button>`).join("");
  }
  document.getElementById("markets").addEventListener("click", e => {
    const b = e.target.closest(".chip"); if (!b) return;
    const s = b.dataset.s;
    if (selected.includes(s)) { if (selected.length > 1) selected = selected.filter(x => x !== s); }
    else { selected = [...selected.slice(-2), s]; }
    focus = selected.includes(focus) ? focus : selected[0];
    renderChips(); renderQuotes(); renderChart(); renderDesk();
  });
  document.getElementById("quotes").addEventListener("click", e => {
    const q = e.target.closest(".quote"); if (!q || q.dataset.s === focus) return;
    focus = q.dataset.s; markFocus(); renderChart(); renderDesk();
  });

  // ---------- Tarjetas: precio real (TradingView) + flujo de ejemplo ----------
  function renderQuotes() {
    const box = document.getElementById("quotes");
    box.innerHTML = selected.map(s => { const m = bySym[s];
      return `<div class="card quote" data-s="${s}" style="cursor:pointer">
        <div class="card-head"><span><b style="font-family:var(--f-display);font-size:18px">${s}</b> <span class="label" style="margin-left:6px">${m.n}</span></span><span class="pill" data-pill></span></div>
        <div class="tv-quote" id="tvq-${s.replace("/", "")}"></div>
        <div class="flow"><i data-flow></i></div>
        <div class="flow-legend"><span class="up" data-buy></span><span class="down" data-sell></span></div>
      </div>`; }).join("");
    selected.forEach(s => tvWidget(`tvq-${s.replace("/", "")}`, "single-quote", { symbol: K.tv(s), width: "100%" }));
    markFocus(); renderFlows();
  }
  function markFocus() {
    document.querySelectorAll("#quotes .quote").forEach(q => q.style.borderColor = q.dataset.s === focus ? "var(--brass)" : "");
  }
  function renderFlows() {
    document.querySelectorAll("#quotes .quote").forEach(q => {
      const m = bySym[q.dataset.s], st = state(m);
      const pill = q.querySelector("[data-pill]"); pill.className = "pill " + st + " " + st; pill.textContent = stateTxt[st];
      q.querySelector("[data-flow]").style.width = m.buy.toFixed(1) + "%";
      q.querySelector("[data-buy]").textContent = m.buy.toFixed(1) + "% compra";
      q.querySelector("[data-sell]").textContent = (100 - m.buy).toFixed(1) + "% venta";
    });
  }

  // ---------- Gráfico avanzado de TradingView ----------
  // Barras de TradingView ocultas: la temporalidad se elige con el selector propio (#chartTf).
  let chartTf = "5";
  function renderChart() {
    document.getElementById("chartSym").textContent = focus;
    tvWidget("tvChart", "advanced-chart", {
      symbol: K.tv(focus), interval: chartTf, timezone: "Europe/Madrid", style: "1",
      autosize: true, allow_symbol_change: false, hide_top_toolbar: true, hide_side_toolbar: true, hide_legend: false,
      withdateranges: false, save_image: false, calendar: false, details: false, hotlist: false,
      studies: ["STD;VWAP"], backgroundColor: "rgba(12, 16, 32, 1)", gridColor: "rgba(29, 39, 66, 0.35)",
    });
  }
  document.getElementById("chartTf").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b || b.dataset.v === chartTf) return;
    chartTf = b.dataset.v;
    document.querySelectorAll("#chartTf button").forEach(x => x.setAttribute("aria-pressed", x === b));
    renderChart();
  });

  // ---------- Módulos de ejemplo ----------
  function renderBias() {
    const m = bySym[focus], st = state(m);
    const conf = Math.round(Math.min(98, Math.abs(m.buy - 50) * 3.2 + Math.abs(m.delta) / 25));
    document.getElementById("bias").className = "bias " + (st === "down" ? "is-down" : "is-up");
    document.getElementById("biasCard").style.setProperty("--c", st === "down" ? "var(--down)" : st === "up" ? "var(--up)" : "var(--flat)");
    document.getElementById("biasWord").textContent = stateTxt[st];
    document.getElementById("biasWord").style.color = st === "flat" ? "var(--flat)" : "";
    document.getElementById("biasSub").textContent = st === "up" ? "Domina la presión compradora" : st === "down" ? "Domina la presión vendedora" : "Sin dirección clara";
    document.getElementById("biasSym").textContent = focus;
    document.getElementById("cond").textContent = conf > 45 ? "En tendencia" : "Rango";
    document.getElementById("align").textContent = (conf > 60 ? 4 : conf > 35 ? 3 : 2) + "/4 marcos";
    const d = document.getElementById("deltaTot"); d.textContent = sign(m.delta) + m.delta; d.className = m.delta >= 0 ? "up" : "down";
    document.getElementById("updated").textContent = new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const col = conf >= 60 ? "#22f5a5" : conf >= 35 ? "#c9b458" : "#ff4d7d";
    const arc = document.getElementById("gArc"); arc.setAttribute("stroke-dasharray", conf + " 100"); arc.setAttribute("stroke", col);
    document.getElementById("gVal").textContent = conf;
    const gl = document.getElementById("gLabel"); gl.textContent = conf >= 60 ? "FUERTE" : conf >= 35 ? "MODERADA" : "DÉBIL"; gl.style.color = col;
    return { m, st, conf };
  }

  function levels(m) {
    const step = m.t >= 1 ? 50 : m.t >= .1 ? 10 : m.t >= .01 ? 0.5 : 0.005;
    const r = Math.round(m.p / step) * step;
    return [
      { v: r + step * 3, k: "sup", n: "Máximo día anterior" },
      { v: r + step * 2, k: "sup", n: "Zona de oferta 1H" },
      { v: r + step, k: "sup", n: "Número redondo" },
      { v: m.p, k: "now", n: "Precio de referencia" },
      { v: r - step, k: "dem", n: "VWAP / demanda" },
      { v: r - step * 2, k: "dem", n: "Mínimo de sesión" },
      { v: r - step * 3, k: "dem", n: "Mínimo día anterior" },
    ].sort((a, b) => b.v - a.v);
  }

  function renderLadder(m) {
    document.getElementById("vwap").textContent = fmt(m.p * 0.9996, m.t);
    document.getElementById("ladder").innerHTML = levels(m).map(l => {
      const dist = (l.v - m.p) / m.p * 100;
      return `<div class="lvl ${l.k}"><span>${fmt(l.v, m.t)}</span><small>${l.n}</small><span style="text-align:right">${l.k === "now" ? "▶" : sign(dist) + dist.toFixed(2) + "%"}</span></div>`;
    }).join("");
  }

  function renderProfile(m) {
    const rows = 13, step = m.t * (m.t >= 1 ? 5 : 20);
    const base = Math.round(m.p / step) * step;
    const vols = Array.from({ length: rows }, (_, i) => Math.round(80 * Math.exp(-Math.pow((i - 6 + (m.buy - 50) / 12) / 3.2, 2)) + Math.random() * 14 + 4));
    const max = Math.max(...vols), poc = vols.indexOf(max);
    document.getElementById("profile").innerHTML = vols.map((v, i) => {
      const px = base + (6 - i) * step;
      return `<div class="prof-row ${i === poc ? "poc" : ""} ${i === 6 ? "cur" : ""}"><span>${fmt(px, m.t)}</span><i style="width:${(v / max * 100).toFixed(0)}%"></i><span style="text-align:right">${v}</span></div>`;
    }).join("");
  }

  function renderBuckets() {
    const max = Math.max(...buckets.map(Math.abs), 1);
    document.getElementById("buckets").innerHTML = buckets.map(v => {
      const h = Math.abs(v) / max * 50;
      return `<div class="bk" title="${sign(v)}${v}"><span style="height:${v > 0 ? h : 0}%;background:var(--up);margin-top:auto"></span><span style="height:${v < 0 ? h : 0}%;background:var(--down);margin-bottom:auto"></span></div>`;
    }).join("");
    const now = new Date(); now.setMinutes(Math.floor(now.getMinutes() / 5) * 5, 0, 0);
    document.getElementById("bkLabels").innerHTML = buckets.map((_, i) => {
      const t = new Date(now - (11 - i) * 300000);
      return `<span>${i % 3 === 2 ? t.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : ""}</span>`;
    }).join("");
    const last = buckets[11], el = document.getElementById("deltaNow");
    el.textContent = "Δ " + sign(last) + last; el.className = "mono " + (last >= 0 ? "up" : "down");
  }

  function renderBrief({ m, st, conf }) {
    const lv = levels(m), sup = lv[2], dem = lv[4];
    const now = new Date(); now.setMinutes(Math.floor(now.getMinutes() / 5) * 5, 0, 0);
    document.getElementById("briefTime").textContent = now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) + " · ejemplo";
    const dir = st === "up" ? "alcista" : st === "down" ? "bajista" : "neutral";
    document.getElementById("brief").innerHTML = `
      <p><b>${m.s}</b> tiene un sesgo <b class="${st}">${dir}</b> con una confianza de ${conf}/100. El ${m.buy.toFixed(0)}% del volumen reciente es comprador.</p>
      <p>Oferta más cercana en <span class="mono">${fmt(sup.v, m.t)}</span>; demanda en <span class="mono">${fmt(dem.v, m.t)}</span>. ${st === "up" ? "Un retroceso a demanda con el delta aguantando positivo sería la entrada de mayor calidad." : st === "down" ? "Los rebotes hacia la oferta con el delta negativo ofrecen ventas con buen riesgo." : "Mejor esperar a que el precio salga del rango con volumen antes de tomar posición."}</p>
      <p style="color:var(--muted)">Revisa el calendario antes de operar: los datos de alto impacto pueden invalidar cualquier nivel.</p>`;
    const adv = document.getElementById("advice");
    adv.textContent = st === "up" ? "BUSCAR COMPRAS" : st === "down" ? "BUSCAR VENTAS" : "ESPERAR";
    adv.className = st;
    document.getElementById("adviceTxt").textContent = st === "flat"
      ? "El flujo está equilibrado. No hay ventaja clara ahora mismo."
      : `Zona de entrada en ${fmt(st === "up" ? dem.v : sup.v, m.t)}, invalidación ${st === "up" ? "por debajo" : "por encima"} del siguiente nivel.`;
  }

  function renderDesk() {
    renderFlows();
    const b = renderBias();
    renderLadder(b.m); renderProfile(b.m); renderBuckets(); renderBrief(b);
  }

  // ---------- Reloj, sesiones y apertura de NY ----------
  const CITIES = [["Madrid", "Europe/Madrid"], ["Londres", "Europe/London"], ["Nueva York", "America/New_York"], ["Chicago", "America/Chicago"], ["Dubái", "Asia/Dubai"], ["Tokio", "Asia/Tokyo"]];
  function tzSecs(tz) {
    const p = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
    const g = t => +p.find(x => x.type === t).value; return g("hour") * 3600 + g("minute") * 60 + g("second");
  }
  function tick() {
    document.getElementById("clocks").innerHTML = CITIES.map(([n, tz]) =>
      `<div class="clock"><span class="label" style="font-size:10px">${n}</span><b>${new Date().toLocaleTimeString("es-ES", { timeZone: tz, hour: "2-digit", minute: "2-digit" })}</b></div>`).join("");
    const ny = tzSecs("America/New_York"), open = 9 * 3600 + 1800;
    let diff = open - ny; if (diff < 0) diff += 86400;
    const inSession = ny >= open && ny < 16 * 3600;
    document.getElementById("nyCount").textContent = inSession ? "Nueva York abierta" : `Apertura NY en ${Math.floor(diff / 3600)} h ${String(Math.floor(diff % 3600 / 60)).padStart(2, "0")} min`;
    const md = tzSecs("Europe/Madrid");
    document.getElementById("nowLine").style.left = (md / 86400 * 100).toFixed(2) + "%";
    const h = md / 3600;
    document.getElementById("sessName").textContent = h >= 15.5 && h < 22 ? "Sesión de Nueva York" : h >= 9 && h < 15.5 ? "Sesión de Londres" : "Sesión asiática";
  }

  // ---------- Simulación del orderflow de ejemplo ----------
  function step() {
    M.forEach(m => {
      const drift = (m.buy - 50) / 50 * 0.0004;
      m.p = Math.max(m.t, m.p * (1 + drift + (Math.random() - .5) * 0.0012));
      m.p = Math.round(m.p / m.t) * m.t;
      m.buy = Math.min(78, Math.max(22, m.buy + (Math.random() - .5) * 3));
      m.delta += Math.round((m.buy - 50) * 2 + (Math.random() - .5) * 30);
    });
    buckets[11] += Math.round((bySym[focus].buy - 50) / 3 + (Math.random() - .5) * 12);
  }

  // ---------- Navegación entre secciones (#cal, #heat, #macro…) ----------
  function show(v) {
    const b = document.querySelector(`#sideNav [data-view="${v}"]`) || document.querySelector('#sideNav [data-view="desk"]');
    v = b.dataset.view;
    if (window.KairosGuard && !window.KairosGuard(v)) return;
    document.querySelectorAll("#sideNav .side-link").forEach(x => x.classList.toggle("active", x === b));
    const panel = document.getElementById("view-" + v);
    document.querySelectorAll(".main > .content").forEach(c => c.hidden = true);
    if (v === "desk") document.getElementById("desk").hidden = false;
    else if (panel) { panel.hidden = false; window.KairosViews?.[v]?.(); }
    else { document.getElementById("other").hidden = false; document.getElementById("otherTitle").textContent = v; }
    window.scrollTo(0, 0);
  }
  document.getElementById("sideNav").addEventListener("click", e => {
    const b = e.target.closest("[data-view]"); if (!b) return;
    const v = b.dataset.view;
    if (/^[a-z]+$/.test(v)) history.replaceState(null, "", v === "desk" ? location.pathname : "#" + v);
    show(v);
  });

  window.KairosShow = show;
  renderChips(); renderQuotes(); renderChart(); renderDesk(); tick();
  window.addEventListener("load", () => show(location.hash.slice(1) || "desk"));
  window.addEventListener("hashchange", () => show(location.hash.slice(1) || "desk"));
  setInterval(() => { step(); if (!document.getElementById("desk").hidden) renderDesk(); }, 3000);
  setInterval(tick, 15000);
  setInterval(() => { buckets.shift(); buckets.push(0); }, 300000);
})();
