/* Noticias y agenda para Kairos.
   - Titulares de Yahoo Finance por activo (en inglés), clasificados por tema.
   - Agenda económica de la semana (Forex Factory), filtrada al día de hoy.
   Lo usan /api/discord-alertas (noticias de la última hora) y /api/sesion (briefing del día). */

const FEEDS = [
  { tag: "Nasdaq (MNQ · NQ · USTEC)", sym: "^IXIC", color: 0xd4af37, assets: ["MNQ", "NQ", "USTEC"] },
  { tag: "S&P 500 (ES)", sym: "^GSPC", color: 0xd4af37, assets: ["ES"] },
  { tag: "Dow (MYM)", sym: "^DJI", color: 0xd4af37, assets: ["MYM"] },
  { tag: "Oro (GC)", sym: "GC=F", color: 0xf5c84c, assets: ["GC"] },
  { tag: "Crudo (CL)", sym: "CL=F", color: 0xf3e3b0, assets: ["CL"] },
  { tag: "EUR/USD", sym: "EURUSD=X", color: 0x22f5a5, assets: ["EUR/USD"] },
  { tag: "GBP/USD", sym: "GBPUSD=X", color: 0x22f5a5, assets: ["GBP/USD"] },
  { tag: "USD/JPY", sym: "JPY=X", color: 0x22f5a5, assets: ["USD/JPY"] },
];

// Titulares de relleno que no aportan a un trader de índices, oro, crudo o forex
const NOISE = /\$[\d,.]+\s*(investment|invested)|stocks? to buy|should you buy|buy (now|today)|millionaire|retire(ment)?|dividend stock|passive income|forever stock|motley fool|zacks rank|is it too late|could make you rich|^prediction:|stocks? (to watch|with)|d+ (top |best )?(canadian|asian|european|uk|penny|growth|value|dividend)? ?stocks|roe over|penny stocks?/i;

// Temas del briefing, en orden de prioridad (un titular va al primer tema que encaja)
const TOPICS = [
  { id: "bancos", name: "Bancos centrales", re: /\b(fed|fomc|powell|rate (cut|hike|decision)s?|interest rates?|ecb|lagarde|boj|bank of japan|bank of england|boe|central bank|monetary policy|treasury yields?|bond yields?)\b/i },
  { id: "geopolitica", name: "Geopolítica y conflictos", re: /\b(war|israel|iran|gaza|russia|ukraine|taiwan|missile|attack|strike|conflict|military|middle east|sanctions?|ceasefire|nato|north korea)\b/i },
  { id: "comercio", name: "Comercio y aranceles", re: /\b(tariffs?|trade (war|deal|talks|deficit)|exports?|imports?|customs|duties|protectionism)\b/i },
  { id: "politica", name: "Política de EE. UU.", re: /\b(trump|white house|congress|senate|house speaker|shutdown|election|democrats?|republicans?|administration|debt ceiling|fiscal|budget)\b/i },
  { id: "datos", name: "Datos económicos", re: /\b(cpi|ppi|inflation|jobs report|payrolls?|nfp|unemployment|jobless claims|gdp|pmi|ism|retail sales|consumer (confidence|sentiment|spending)|housing|recession)\b/i },
  { id: "energia", name: "Energía y materias primas", re: /\b(oil|crude|opec|brent|wti|natural gas|gasoline|gold|silver|copper|commodit(y|ies))\b/i },
  { id: "empresas", name: "Empresas y resultados", re: /\b(earnings|revenue|profit|guidance|quarter|q[1-4]|results|outlook|ipo|merger|acquisition|ai|chips?|semiconductor)\b/i },
];
const topicOf = title => (TOPICS.find(t => t.re.test(title)) || { id: "mercados" }).id;

const decode = s => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/<[^>]+>/g, "").trim();
const tag = (xml, t) => { const m = xml.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`)); return m ? decode(m[1]) : ""; };

async function readFeed(f) {
  const url = `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(f.sym)}&region=US&lang=en-US`;
  const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (Kairos)" } });
  if (!r.ok) throw new Error(`Yahoo ${f.sym}: ${r.status}`);
  const xml = await r.text();
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => ({
    title: tag(m[1], "title"), link: tag(m[1], "link"), date: new Date(tag(m[1], "pubDate")),
    summary: tag(m[1], "description"), tags: [f.tag], assets: [...f.assets], color: f.color,
  })).filter(i => i.title && i.link && !isNaN(i.date) && !NOISE.test(i.title));
}

// Noticias de todos los activos entre start y end, sin duplicados (un titular puede afectar a varios activos)
async function collectNews(start, end) {
  const results = await Promise.allSettled(FEEDS.map(readFeed));
  const byLink = new Map();
  results.forEach(r => {
    if (r.status !== "fulfilled") return;
    for (const it of r.value) {
      if (it.date < start || it.date >= end) continue;
      const prev = byLink.get(it.link);
      if (prev) {
        if (!prev.tags.includes(it.tags[0])) prev.tags.push(it.tags[0]);
        it.assets.forEach(a => { if (!prev.assets.includes(a)) prev.assets.push(a); });
      } else byLink.set(it.link, { ...it, topic: topicOf(it.title) });
    }
  });
  return { items: [...byLink.values()].sort((a, b) => a.date - b.date), feedsFailed: results.filter(r => r.status === "rejected").length };
}

// Agenda de hoy (hora de Madrid) con los eventos de impacto medio y alto
const COUNTRY_ASSETS = {
  USD: ["MNQ", "NQ", "USTEC", "ES", "MYM", "GC", "CL", "EUR/USD", "GBP/USD", "USD/JPY"],
  EUR: ["EUR/USD"], GBP: ["GBP/USD"], JPY: ["USD/JPY"], CNY: ["MNQ", "NQ", "USTEC", "ES", "GC", "CL"],
  All: ["MNQ", "NQ", "USTEC", "ES", "MYM", "GC", "CL", "EUR/USD", "GBP/USD", "USD/JPY"],
};
const madridDay = d => d.toLocaleDateString("en-CA", { timeZone: "Europe/Madrid" });

// Devuelve { today: eventos de hoy, next: próximos eventos de alto impacto de la semana }
async function todayAgenda(now = new Date()) {
  const r = await fetch("https://nfs.faireconomy.media/ff_calendar_thisweek.json", { headers: { "User-Agent": "Mozilla/5.0 (Kairos)" } });
  if (!r.ok) throw new Error(`Agenda: ${r.status}`);
  const today = madridDay(now);
  const all = (await r.json())
    .filter(e => (e.impact === "High" || e.impact === "Medium") && COUNTRY_ASSETS[e.country])
    .map(e => ({ ...e, d: new Date(e.date) }))
    .filter(e => !isNaN(e.d))
    .sort((a, b) => a.d - b.d);
  return {
    today: all.filter(e => madridDay(e.d) === today).map(fmtEvent),
    next: all.filter(e => e.d > now && madridDay(e.d) !== today && e.impact === "High").slice(0, 5).map(fmtEvent),
  };
}
const fmtEvent = e => ({
  time: e.d.toISOString(), title: e.title, country: e.country, impact: e.impact === "High" ? "alto" : "medio",
  forecast: e.forecast || "", previous: e.previous || "", assets: COUNTRY_ASSETS[e.country],
});

module.exports = { FEEDS, TOPICS, collectNews, todayAgenda };
