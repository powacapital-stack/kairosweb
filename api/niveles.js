/* GET /api/niveles?s=MNQ,MES,GC — Precio y niveles clave reales de cada instrumento.
   Niveles: VWAP de la sesión, máximo y mínimo de sesión, del día anterior y de la semana, y números redondos.
   Fuente: gráficos de Yahoo Finance (futuros continuos, divisas y cripto). Caché de 60 s en Vercel. */

const YAHOO = {
  MNQ: "NQ=F", NQ: "NQ=F", USTEC: "NQ=F", MES: "ES=F", ES: "ES=F", MYM: "YM=F", YM: "YM=F",
  GC: "GC=F", MGC: "GC=F", CL: "CL=F", "EUR/USD": "EURUSD=X", "GBP/USD": "GBPUSD=X", "USD/JPY": "JPY=X",
  "BTC/USD": "BTC-USD", "ETH/USD": "ETH-USD", "SOL/USD": "SOL-USD",
};
// Separación de los números redondos por instrumento
const ROUND = { "NQ=F": 100, "ES=F": 25, "YM=F": 100, "GC=F": 10, "CL=F": 1, "EURUSD=X": 0.005, "GBPUSD=X": 0.005, "JPY=X": 0.5,
  "BTC-USD": 1000, "ETH-USD": 50, "SOL-USD": 5 };

const chart = (sym, interval, range) =>
  fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=${interval}&range=${range}`, { headers: { "User-Agent": "Mozilla/5.0 (Kairos)" } })
    .then(r => { if (!r.ok) throw new Error(`Yahoo ${sym}: ${r.status}`); return r.json(); })
    .then(j => { const r = j.chart?.result?.[0]; if (!r) throw new Error(`Yahoo ${sym}: sin datos`); return r; });

const bars = r => {
  const q = r.indicators.quote[0];
  return (r.timestamp || []).map((t, i) => ({ t: t * 1000, o: q.open[i], h: q.high[i], l: q.low[i], c: q.close[i], v: q.volume?.[i] || 0 }))
    .filter(b => [b.h, b.l, b.c].every(Number.isFinite));
};

async function levelsFor(sym) {
  const [daily, intra] = await Promise.all([chart(sym, "1d", "1mo"), chart(sym, "5m", "2d")]);
  const d = bars(daily), m = bars(intra);
  const price = daily.meta.regularMarketPrice ?? m.at(-1)?.c;
  const sessionStart = (intra.meta.currentTradingPeriod?.regular?.start ?? 0) * 1000;
  const sess = m.filter(b => b.t >= sessionStart);
  const today = sess.length ? sess : m.slice(-48);
  const prev = d.at(-2), week = d.slice(-6, -1);
  const vol = today.reduce((a, b) => a + b.v, 0);
  const vwap = vol > 0 ? today.reduce((a, b) => a + (b.h + b.l + b.c) / 3 * b.v, 0) / vol : today.reduce((a, b) => a + b.c, 0) / today.length;

  const raw = [
    { v: vwap, n: "VWAP" },
    { v: Math.max(...today.map(b => b.h)), n: "Máximo de sesión" },
    { v: Math.min(...today.map(b => b.l)), n: "Mínimo de sesión" },
    prev && { v: prev.h, n: "Máximo día anterior" },
    prev && { v: prev.l, n: "Mínimo día anterior" },
    week.length && { v: Math.max(...week.map(b => b.h)), n: "Máximo semanal" },
    week.length && { v: Math.min(...week.map(b => b.l)), n: "Mínimo semanal" },
  ].filter(x => x && Number.isFinite(x.v));
  const step = ROUND[sym] || price / 100;
  const r0 = Math.round(price / step) * step;
  [r0 - step, r0, r0 + step].forEach(v => raw.push({ v, n: "Número redondo" }));

  // Agrupa niveles muy próximos (a menos del 0,08 % entre sí) y suma sus orígenes
  const tol = price * 0.0008, merged = [];
  raw.sort((a, b) => b.v - a.v).forEach(x => {
    const g = merged.find(y => Math.abs(y.v - x.v) <= tol);
    if (g) { if (!g.n.includes(x.n)) g.n.push(x.n); if (x.n !== "Número redondo") g.v = x.v; } else merged.push({ v: x.v, n: [x.n] });
  });
  return {
    yahoo: sym, price, prevClose: daily.meta.chartPreviousClose ?? prev?.c ?? null,
    time: new Date((daily.meta.regularMarketTime ?? m.at(-1).t / 1000) * 1000).toISOString(), vwap,
    levels: merged.map(g => ({ v: g.v, k: g.v >= price ? "sup" : "dem", n: g.n.join(", "), dist: (g.v - price) / price * 100, strength: g.n.length })),
  };
}

module.exports = async (req, res) => {
  const list = String((req.query && req.query.s) || new URL(req.url, "http://x").searchParams.get("s") || "MNQ")
    .split(",").map(s => s.trim()).filter(s => YAHOO[s]).slice(0, 16);
  const syms = [...new Set(list.map(s => YAHOO[s]))];
  const got = await Promise.allSettled(syms.map(levelsFor));
  const bySym = Object.fromEntries(syms.map((y, i) => [y, got[i].status === "fulfilled" ? got[i].value : { error: String(got[i].reason?.message || got[i].reason) }]));
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.statusCode = 200;
  res.end(JSON.stringify({ generatedAt: new Date().toISOString(), source: "Yahoo Finance", data: Object.fromEntries(list.map(s => [s, bySym[YAHOO[s]]])) }));
};
