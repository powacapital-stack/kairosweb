/* Análisis macro por reglas (sin IA). Usa los motores calculados en macro-core.js
   y devuelve el mismo formato que el análisis de Claude en api/macro.js. */

const DRIVER_NAMES = ["Rendimientos EE. UU.", "Dólar (USD)", "Liquidez", "Crecimiento", "Inflación"];
const DRIVER_KEYS = ["yields", "usd", "liquidity", "growth", "inflation"];

const NAMES = { NASDAQ: "el Nasdaq", DOW: "el Dow Jones", SP500: "el S&P 500", GOLD: "el oro", OIL: "el crudo", EURUSD: "el EUR/USD", GBPUSD: "el GBP/USD", USDJPY: "el USD/JPY" };

// Impacto de cada estado de motor en cada activo (+ favorece la subida, - la presiona)
const EQUITY = (w) => ({
  yields: { Subiendo: -1 * w, Bajando: 1 * w },
  usd: { "Fortaleciéndose": -0.5, "Debilitándose": 0.5 },
  liquidity: { "Ampliándose": 1, Restrictiva: -1 },
  growth: { "Sólido": 1, "Desacelerándose": -1 },
  inflation: { "Moderándose": 1, Repuntando: -1 },
});
const FX_VS_USD = {
  yields: { Subiendo: -1, Bajando: 1 },
  usd: { "Fortaleciéndose": -1.5, "Debilitándose": 1.5 },
  liquidity: { "Ampliándose": 0.5, Restrictiva: -0.5 },
  growth: { "Sólido": -0.5, "Desacelerándose": 0.5 },
  inflation: { "Moderándose": 0.5, Repuntando: -0.5 },
};
const IMPACT = {
  NASDAQ: EQUITY(1.5), SP500: EQUITY(1), DOW: EQUITY(0.8),
  GOLD: {
    yields: { Subiendo: -1.5, Bajando: 1.5 },
    usd: { "Fortaleciéndose": -1, "Debilitándose": 1 },
    liquidity: { "Ampliándose": 1, Restrictiva: -0.5 },
    growth: { "Desacelerándose": 1, "Sólido": -0.5 },
    inflation: { Repuntando: 1, "Moderándose": -0.5 },
  },
  OIL: {
    yields: {},
    usd: { "Fortaleciéndose": -1, "Debilitándose": 1 },
    liquidity: { "Ampliándose": 0.5, Restrictiva: -0.5 },
    growth: { "Sólido": 1.5, "Desacelerándose": -1.5 },
    inflation: { Repuntando: 0.5, "Moderándose": -0.5 },
  },
  EURUSD: FX_VS_USD, GBPUSD: FX_VS_USD,
  USDJPY: {
    yields: { Subiendo: 1.5, Bajando: -1.5 },
    usd: { "Fortaleciéndose": 1, "Debilitándose": -1 },
    liquidity: { "Ampliándose": 0.5, Restrictiva: -0.5 },
    growth: { "Sólido": 0.5, "Desacelerándose": -0.5 },
    inflation: { Repuntando: 0.5, "Moderándose": -0.5 },
  },
};

// Frase corta de cada motor
const STATE_TEXT = {
  yields: { Subiendo: "Los rendimientos de EE. UU. suben", Bajando: "Los rendimientos de EE. UU. bajan", Estables: "Los rendimientos de EE. UU. están estables" },
  usd: { "Fortaleciéndose": "El dólar se fortalece", "Debilitándose": "El dólar se debilita", Estable: "El dólar está estable" },
  liquidity: { "Ampliándose": "La liquidez se amplía", Restrictiva: "Las condiciones de liquidez son restrictivas", Neutral: "La liquidez está neutral" },
  growth: { "Sólido": "El empleo muestra un crecimiento sólido", "Desacelerándose": "El crecimiento se desacelera", Estable: "El crecimiento está estable" },
  inflation: { "Moderándose": "La inflación se modera", Repuntando: "La inflación repunta", Persistente: "La inflación se mantiene", "Sin datos": "Sin datos recientes de inflación" },
};

const fmt = (x, d = 2) => (x == null ? "s/d" : x.toFixed(d).replace(".", ","));
const signed = (x, d = 1) => (x == null ? "s/d" : (x > 0 ? "+" : "") + fmt(x, d));

function analyzeAsset(key, f) {
  const table = IMPACT[key];
  const drivers = DRIVER_KEYS.map((k, i) => {
    const state = f.drivers[k];
    const w = table[k][state] || 0;
    const impact = w > 0 ? "Positivo" : w < 0 ? "Negativo" : "Neutral";
    const note = `${STATE_TEXT[k][state] || state}: ${impact === "Positivo" ? "favorece a" : impact === "Negativo" ? "presiona a" : "efecto neutro sobre"} ${NAMES[key]}.`;
    return { name: DRIVER_NAMES[i], state, impact, note: note.replace(/ a el /g, " al "), w };
  });

  // Puntuación: motores + tendencia de 20 días + régimen de riesgo
  let score = drivers.reduce((s, d) => s + d.w, 0);
  const t20 = f.assets[key]?.chg20d_pct;
  const th = key === "GOLD" ? 10 : /USD/.test(key) ? 0.5 : 1;
  if (t20 != null) score += t20 > th ? 0.5 : t20 < -th ? -0.5 : 0;
  const reg = f.regimeToday;
  if (reg !== "Neutral") {
    const on = reg === "Risk-on";
    if (["NASDAQ", "SP500", "DOW", "OIL"].includes(key)) score += on ? 0.5 : -0.5;
    if (key === "GOLD" && !on) score += 0.5;
    if (key === "USDJPY") score += on ? 0.5 : -0.5;
  }

  const bias = score >= 1 ? "Alcista" : score <= -1 ? "Bajista" : "Neutral";
  const active = drivers.filter(d => d.w !== 0);
  const dir = Math.sign(score);
  const agree = active.length ? active.filter(d => Math.sign(d.w) === dir).length / active.length : 0;
  const conviction = bias === "Neutral" ? Math.round(20 + Math.abs(score) * 10) : Math.round(Math.min(90, 30 + Math.abs(score) * 8 + agree * 20));

  const sorted = [...drivers].sort((a, b) => Math.abs(b.w) - Math.abs(a.w));
  const top = sorted.find(d => Math.sign(d.w) === dir && d.w !== 0) || sorted[0];
  const favor = drivers.filter(d => d.w > 0).map(d => d.name);
  const contra = drivers.filter(d => d.w < 0).map(d => d.name);
  const level = conviction >= 60 ? "alta" : conviction >= 40 ? "media" : "baja";
  const trendTxt = t20 == null ? "" : key === "GOLD"
    ? ` El rendimiento real a 10 años ha variado ${signed(-t20, 0)} pb en 20 sesiones.`
    : ` En las últimas 20 sesiones se mueve ${signed(t20)} %.`;
  const brief = `Sesgo macro ${bias.toLowerCase()} para ${NAMES[key]}, con convicción ${level}.` +
    (favor.length ? ` A favor: ${favor.join(", ")}.` : "") +
    (contra.length ? ` En contra: ${contra.join(", ")}.` : "") + trendTxt;

  return {
    bias, conviction, key_driver: `${top.name}: ${top.state.toLowerCase()}`,
    drivers: drivers.map(({ w, ...d }) => d), brief,
  };
}

function analyzeByRules(f) {
  const assets = Object.fromEntries(Object.keys(IMPACT).map(k => [k, analyzeAsset(k, f)]));
  const regime = f.regimeToday === "Risk-on" ? "RISK-ON" : f.regimeToday === "Risk-off" ? "RISK-OFF" : "NEUTRAL";
  const appetite = f.globalScores[0].v;
  const conviction = Math.round(Math.min(90, 30 + Math.abs(appetite) * 0.6));
  const primary = [...f.globalScores].sort((a, b) => Math.abs(b.v) - Math.abs(a.v))[0];
  const macro_bias = regime === "RISK-ON" ? "Constructivo" : regime === "RISK-OFF" ? "Defensivo" : "Mixto";
  const y = f.yields, dx = f.dollar, inf = f.inflation;
  const brief = `El bono de EE. UU. a 10 años está en ${fmt(y.us10y)} % (${signed(y.chg20d_bp, 0)} pb en 20 sesiones) y el índice dólar se mueve ${signed(dx.chg20d_pct)} % en el mismo periodo. ` +
    `El VIX cotiza en ${fmt(f.vix.level, 1)} y el diferencial high yield en ${fmt(f.hySpread.level)} %, lo que sitúa el régimen en ${regime}. ` +
    `La inflación interanual de EE. UU. es del ${fmt(inf.cpi_yoy, 1)} % (subyacente ${fmt(inf.core_yoy, 1)} %) y el paro del ${fmt(f.labor.unemployment, 1)} %.`;
  return {
    regime, conviction, primary_driver: primary.name, macro_bias,
    risk_window: "Apertura de Nueva York y datos macro de EE. UU.", brief, assets,
  };
}

module.exports = { analyzeByRules };
