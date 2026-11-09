/* GET /api/flujo?s=MNQ,MES,GC — ESTIMACIÓN de orderflow a partir de velas de 1 minuto (Yahoo Finance, gratis).
   No es orderflow real (no se ve quién agrede en cada operación). Método:
     - En cada vela, el volumen se reparte según dónde cierra dentro de su rango:
       compra = volumen × (cierre − mínimo) / (máximo − mínimo); venta = el resto. Vela sin rango: mitad y mitad.
     - Sin volumen (forex en Yahoo) cada vela pesa 1, así que el delta es «en velas», no en contratos.
   Devuelve por instrumento: % compra/venta y delta de los últimos 60 min, delta acumulado de la sesión,
   12 buckets de 5 min (delta y cambio de precio, con convergencia/divergencia) y perfil de volumen de la sesión. */

const YAHOO = {
  MNQ: "NQ=F", NQ: "NQ=F", USTEC: "NQ=F", MES: "ES=F", ES: "ES=F", MYM: "YM=F", YM: "YM=F",
  GC: "GC=F", MGC: "GC=F", CL: "CL=F", "EUR/USD": "EURUSD=X", "GBP/USD": "GBPUSD=X", "USD/JPY": "JPY=X",
  "BTC/USD": "BTC-USD", "ETH/USD": "ETH-USD", "SOL/USD": "SOL-USD",
};
// Los micro (MNQ, MES, MYM, MGC) usan el volumen del contrato grande: el reparto compra/venta es el mismo.

async function bars(sym) {
  const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1m&range=1d`, { headers: { "User-Agent": "Mozilla/5.0 (Kairos)" } });
  if (!r.ok) throw new Error(`Yahoo ${sym}: ${r.status}`);
  const res = (await r.json()).chart?.result?.[0];
  if (!res) throw new Error(`Yahoo ${sym}: sin datos`);
  const q = res.indicators.quote[0];
  return (res.timestamp || []).map((t, i) => ({ t: t * 1000, h: q.high[i], l: q.low[i], c: q.close[i], v: q.volume?.[i] || 0 }))
    .filter(b => [b.h, b.l, b.c].every(Number.isFinite));
}

function estimate(list) {
  if (list.every(b => b.h === b.l)) throw new Error("velas sin rango: no se puede estimar");
  const hasVol = list.filter(b => b.v > 0).length > list.length * 0.5;
  const split = b => {
    const v = hasVol ? b.v : 1, rg = b.h - b.l;
    const buy = rg > 0 ? v * (b.c - b.l) / rg : v / 2;
    return { buy, sell: v - buy };
  };
  const now = list.at(-1).t, last60 = list.filter(b => b.t > now - 3600e3);
  const sum = arr => arr.reduce((a, b) => { const s = split(b); a.buy += s.buy; a.sell += s.sell; return a; }, { buy: 0, sell: 0 });
  const h = sum(last60), tot = h.buy + h.sell;
  const sess = sum(list);

  // Buckets de 5 min alineados al reloj (los 12 últimos)
  const end = Math.floor((now + 60e3) / 300e3) * 300e3 - 300e3; // último bucket completo
  const buckets = Array.from({ length: 12 }, (_, i) => {
    const from = end - (11 - i) * 300e3, inB = list.filter(b => b.t >= from && b.t < from + 300e3);
    if (!inB.length) return { t: from, delta: 0, move: 0, type: "vacío" };
    const s = sum(inB), delta = Math.round(s.buy - s.sell), prev = list.filter(b => b.t < from).at(-1);
    const move = inB.at(-1).c - (prev ? prev.c : inB[0].c);
    const type = !delta || !move ? "neutral" : Math.sign(delta) === Math.sign(move) ? "convergencia" : "divergencia";
    return { t: from, delta, move, type };
  });

  // Perfil de volumen de la sesión (13 franjas de precio) y POC
  const lo = Math.min(...list.map(b => b.l)), hi = Math.max(...list.map(b => b.h)), n = 13, step = (hi - lo) / n || 1;
  const prof = Array.from({ length: n }, (_, i) => ({ p: lo + step * (i + 0.5), v: 0 }));
  list.forEach(b => { const i = Math.min(n - 1, Math.max(0, Math.floor(((b.h + b.l + b.c) / 3 - lo) / step))); prof[i].v += hasVol ? b.v : 1; });

  return {
    estimated: true, units: hasVol ? "contratos" : "velas", minutes: last60.length,
    buy: tot > 0 ? Math.round(h.buy / tot * 1000) / 10 : 50,
    delta60: Math.round(h.buy - h.sell), deltaSession: Math.round(sess.buy - sess.sell),
    buckets, profile: prof.reverse().map(x => ({ p: x.p, v: Math.round(x.v) })),
    time: new Date(now).toISOString(), price: list.at(-1).c,
  };
}

module.exports = async (req, res) => {
  const list = String((req.query && req.query.s) || new URL(req.url, "http://x").searchParams.get("s") || "MNQ")
    .split(",").map(s => s.trim()).filter(s => YAHOO[s]).slice(0, 16);
  const syms = [...new Set(list.map(s => YAHOO[s]))];
  const got = await Promise.allSettled(syms.map(async y => { const b = await bars(y); if (b.length < 5) throw new Error("pocas velas"); return estimate(b.slice(-480)); }));
  const by = Object.fromEntries(syms.map((y, i) => [y, got[i].status === "fulfilled" ? got[i].value : { error: String(got[i].reason?.message || got[i].reason) }]));
  res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.statusCode = 200;
  res.end(JSON.stringify({ generatedAt: new Date().toISOString(), source: "Yahoo Finance · velas de 1 min", method: "estimación por posición del cierre en la vela", data: Object.fromEntries(list.map(s => [s, by[YAHOO[s]]])) }));
};
