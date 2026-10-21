/* Motor macro de Kairos: descarga series de FRED y calcula los motores, tendencias,
   régimen de riesgo y correlaciones con reglas deterministas.
   La redacción (sesgo por activo, convicción y resúmenes) la hace Claude en api/macro.js. */

const FRED_URL = "https://api.stlouisfed.org/fred/series/observations";

// Series de FRED que usa el motor (d = diaria, w = semanal, m = mensual)
const SERIES = {
  DGS10: "d",        // Bono EE. UU. 10 años (%)
  DGS2: "d",         // Bono EE. UU. 2 años (%)
  DFII10: "d",       // Rendimiento real 10 años, TIPS (%)  -> motor del oro
  T10YIE: "d",       // Inflación implícita 10 años (%)
  DTWEXBGS: "d",     // Índice dólar amplio
  VIXCLS: "d",       // VIX
  BAMLH0A0HYM2: "d", // Diferencial high yield (%)
  NASDAQCOM: "d",    // Nasdaq Composite
  SP500: "d",        // S&P 500
  DJIA: "d",         // Dow Jones
  DCOILWTICO: "d",   // Crudo WTI
  DEXUSEU: "d",      // USD por EUR
  DEXUSUK: "d",      // USD por GBP
  DEXJPUS: "d",      // JPY por USD
  WALCL: "w",        // Balance de la Fed (millones $)
  DFEDTARU: "d",     // Tipo de la Fed, techo (%)
  ECBDFR: "d",       // Tipo de depósito del BCE (%)
  CPIAUCSL: "m",     // IPC EE. UU.
  CPILFESL: "m",     // IPC subyacente EE. UU.
  UNRATE: "m",       // Paro EE. UU. (%)
  PAYEMS: "m",       // Empleo no agrícola (miles)
};

const daysAgo = n => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);

async function fetchSeries(id, apiKey, fetchImpl = fetch) {
  const start = SERIES[id] === "m" ? daysAgo(800) : daysAgo(220);
  const url = `${FRED_URL}?series_id=${id}&api_key=${encodeURIComponent(apiKey)}&file_type=json&observation_start=${start}`;
  const r = await fetchImpl(url);
  if (!r.ok) {
    let msg = "";
    try { msg = (await r.json()).error_message || ""; } catch {}
    throw new Error(`FRED ${id}: HTTP ${r.status}${msg ? " · " + msg : ""}`);
  }
  const j = await r.json();
  return (j.observations || [])
    .filter(o => o.value !== "." && o.value !== "")
    .map(o => ({ date: o.date, v: Number(o.value) }))
    .filter(o => Number.isFinite(o.v));
}

async function fetchAll(apiKey, fetchImpl = fetch) {
  const ids = Object.keys(SERIES);
  const out = {};
  // FRED limita a ~120 peticiones/minuto: 21 series en paralelo está muy por debajo.
  const res = await Promise.allSettled(ids.map(id => fetchSeries(id, apiKey, fetchImpl)));
  res.forEach((r, i) => { out[ids[i]] = r.status === "fulfilled" ? r.value : []; });
  const missing = ids.filter(id => out[id].length === 0);
  const firstError = res.find(r => r.status === "rejected");
  return { data: out, missing, error: firstError ? String(firstError.reason.message || firstError.reason) : null };
}

// ---------- Utilidades numéricas ----------
const last = s => (s.length ? s[s.length - 1].v : null);
const back = (s, n) => (s.length > n ? s[s.length - 1 - n].v : null);
const chg = (s, n) => { const a = last(s), b = back(s, n); return a == null || b == null ? null : a - b; };
const pct = (s, n) => { const a = last(s), b = back(s, n); return a == null || b == null || b === 0 ? null : (a / b - 1) * 100; };
const yoy = s => pct(s, 12);
const round = (x, d = 2) => (x == null ? null : Math.round(x * 10 ** d) / 10 ** d);
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

function returns(s, n) {
  const out = [];
  for (let i = s.length - n; i < s.length; i++) if (i > 0) out.push({ date: s[i].date, r: s[i].v / s[i - 1].v - 1 });
  return out;
}
function diffs(s, n) {
  const out = [];
  for (let i = s.length - n; i < s.length; i++) if (i > 0) out.push({ date: s[i].date, r: s[i].v - s[i - 1].v });
  return out;
}
function corr(a, b) {
  const m = new Map(b.map(x => [x.date, x.r]));
  const pairs = a.filter(x => m.has(x.date)).map(x => [x.r, m.get(x.date)]);
  if (pairs.length < 8) return null;
  const n = pairs.length, mx = pairs.reduce((s, p) => s + p[0], 0) / n, my = pairs.reduce((s, p) => s + p[1], 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (const [x, y] of pairs) { sxy += (x - mx) * (y - my); sxx += (x - mx) ** 2; syy += (y - my) ** 2; }
  return sxx && syy ? round(sxy / Math.sqrt(sxx * syy), 2) : null;
}

// ---------- Cálculo de motores ----------
function computeFeatures(d) {
  const y10 = d.DGS10, real10 = d.DFII10;
  const f = {
    asOf: (y10.at(-1) || d.SP500.at(-1) || {}).date || null,
    yields: { us10y: last(y10), chg5d_bp: round(chg(y10, 5) * 100, 0), chg20d_bp: round(chg(y10, 20) * 100, 0), us2y: last(d.DGS2), curve_2s10s_bp: round((last(y10) - last(d.DGS2)) * 100, 0) },
    realYield10y: { level: last(real10), chg20d_bp: round(chg(real10, 20) * 100, 0) },
    breakeven10y: { level: last(d.T10YIE), chg20d_bp: round(chg(d.T10YIE, 20) * 100, 0) },
    dollar: { level: round(last(d.DTWEXBGS)), chg5d_pct: round(pct(d.DTWEXBGS, 5)), chg20d_pct: round(pct(d.DTWEXBGS, 20)) },
    vix: { level: last(d.VIXCLS), chg5d: round(chg(d.VIXCLS, 5)) },
    hySpread: { level: last(d.BAMLH0A0HYM2), chg20d_bp: round(chg(d.BAMLH0A0HYM2, 20) * 100, 0) },
    fedBalance: { level_tn: round(last(d.WALCL) / 1e6, 2), chg4w_pct: round(pct(d.WALCL, 4)) },
    inflation: { cpi_yoy: round(yoy(d.CPIAUCSL)), cpi_yoy_3m_ago: round(d.CPIAUCSL.length > 15 ? (d.CPIAUCSL.at(-4).v / d.CPIAUCSL.at(-16).v - 1) * 100 : null), core_yoy: round(yoy(d.CPILFESL)) },
    labor: { unemployment: last(d.UNRATE), unemployment_6m_ago: back(d.UNRATE, 6), payrolls_3m_avg_k: d.PAYEMS.length > 3 ? round((last(d.PAYEMS) - back(d.PAYEMS, 3)) / 3, 0) : null },
    policy: { fed_upper: last(d.DFEDTARU), ecb_deposit: last(d.ECBDFR) },
  };

  // Estado de cada motor (reglas fijas; Claude decide el impacto por activo)
  const y20 = f.yields.chg20d_bp ?? 0, usd20 = f.dollar.chg20d_pct ?? 0;
  const liq = f.fedBalance.chg4w_pct ?? 0, hy = f.hySpread.chg20d_bp ?? 0;
  const infNow = f.inflation.cpi_yoy, inf3 = f.inflation.cpi_yoy_3m_ago;
  const unNow = f.labor.unemployment, un6 = f.labor.unemployment_6m_ago;
  f.drivers = {
    yields: y20 > 15 ? "Subiendo" : y20 < -15 ? "Bajando" : "Estables",
    usd: usd20 > 1 ? "Fortaleciéndose" : usd20 < -1 ? "Debilitándose" : "Estable",
    liquidity: liq < -0.3 || hy > 40 ? "Restrictiva" : liq > 0.3 && hy < 0 ? "Ampliándose" : "Neutral",
    growth: unNow != null && un6 != null && unNow - un6 >= 0.3 ? "Desacelerándose" : (f.labor.payrolls_3m_avg_k ?? 0) > 150 ? "Sólido" : "Estable",
    inflation: infNow != null && inf3 != null ? (infNow < inf3 - 0.2 ? "Moderándose" : infNow > inf3 + 0.2 ? "Repuntando" : "Persistente") : "Sin datos",
  };

  // Indicadores globales (-100 a +100) para las barras de la vista Global
  const vix = f.vix.level ?? 18;
  const riskAppetite = clamp(Math.round((18 - vix) * 6 - hy * 0.6), -100, 100);
  f.globalScores = [
    { name: "Apetito de riesgo", v: riskAppetite },
    { name: "Dólar (DXY)", v: clamp(Math.round(usd20 * 25), -100, 100) },
    { name: "Bono 10 años", v: clamp(Math.round(y20 * 1.5), -100, 100) },
    { name: "Volatilidad (VIX)", v: clamp(Math.round((vix - 18) * 6), -100, 100) },
    { name: "Crédito (HY)", v: clamp(Math.round(-hy * 1.5), -100, 100) },
  ];

  // Subíndices de la convicción global (0 = muy desfavorable, 50 = neutro, 100 = muy favorable al riesgo)
  const payK = f.labor.payrolls_3m_avg_k, unDiff = unNow != null && un6 != null ? unNow - un6 : 0;
  f.subindices = {
    riesgo: clamp(Math.round(50 + riskAppetite / 2), 0, 100),
    liquidez: clamp(Math.round(50 + liq * 40 - hy * 0.5), 0, 100),
    crecimiento: clamp(Math.round(50 + (payK == null ? 0 : (payK - 100) / 4) - unDiff * 60), 0, 100),
  };

  // Régimen de riesgo de los últimos 7 días hábiles (VIX y diferencial high yield)
  const regimeFor = (v, h) => (v == null ? "Neutral" : v < 16 && (h ?? 4) < 3.5 ? "Risk-on" : v > 21 || (h ?? 0) > 4.5 ? "Risk-off" : "Neutral");
  const hyMap = new Map(d.BAMLH0A0HYM2.map(o => [o.date, o.v]));
  f.regimeHistory = d.VIXCLS.slice(-7).map(o => ({ date: o.date, regime: regimeFor(o.v, hyMap.get(o.date)) }));
  f.regimeToday = regimeFor(vix, f.hySpread.level);

  // Tendencia de precio por activo (proxy técnico para la alineación)
  const trend = (s, n) => { const p = pct(s, n); return p == null ? null : round(p); };
  const inv = x => (x == null ? null : -x);
  f.assets = {
    NASDAQ: { series: "NASDAQCOM", chg5d_pct: trend(d.NASDAQCOM, 5), chg20d_pct: trend(d.NASDAQCOM, 20) },
    DOW: { series: "DJIA", chg5d_pct: trend(d.DJIA, 5), chg20d_pct: trend(d.DJIA, 20) },
    SP500: { series: "SP500", chg5d_pct: trend(d.SP500, 5), chg20d_pct: trend(d.SP500, 20) },
    // Sin serie de precio del oro en FRED: se usa el rendimiento real invertido (sube el oro cuando bajan los tipos reales)
    GOLD: { series: "DFII10 (invertido)", chg5d_pct: inv(round(chg(real10, 5) * 100, 0)), chg20d_pct: inv(round(chg(real10, 20) * 100, 0)), proxy: true },
    OIL: { series: "DCOILWTICO", chg5d_pct: trend(d.DCOILWTICO, 5), chg20d_pct: trend(d.DCOILWTICO, 20) },
    EURUSD: { series: "DEXUSEU", chg5d_pct: trend(d.DEXUSEU, 5), chg20d_pct: trend(d.DEXUSEU, 20) },
    GBPUSD: { series: "DEXUSUK", chg5d_pct: trend(d.DEXUSUK, 5), chg20d_pct: trend(d.DEXUSUK, 20) },
    USDJPY: { series: "DEXJPUS", chg5d_pct: trend(d.DEXJPUS, 5), chg20d_pct: trend(d.DEXJPUS, 20) },
  };

  // Correlaciones de 20 sesiones
  const R = {
    NQ: returns(d.NASDAQCOM, 21), ES: returns(d.SP500, 21), DXY: returns(d.DTWEXBGS, 21),
    CL: returns(d.DCOILWTICO, 21), "10Y": diffs(y10, 21), VIX: diffs(d.VIXCLS, 21),
  };
  const keys = Object.keys(R);
  f.correlation = { labels: keys, matrix: keys.map(a => keys.map(b => (a === b ? 1 : corr(R[a], R[b])))) };
  return f;
}

// Dirección de la tendencia a partir del cambio porcentual
const dirOf = (x, th) => (x == null ? "Neutral" : x > th ? "Alcista" : x < -th ? "Bajista" : "Neutral");

module.exports = { SERIES, fetchAll, computeFeatures, dirOf };
