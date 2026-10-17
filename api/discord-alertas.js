/* POST /api/discord-alertas — Publica en #alertas las noticias de la última hora de los activos de Kairos.
   Lo lanza GitHub Actions cada hora (.github/workflows/discord.yml).
   Cada ejecución publica las noticias de la hora completa anterior (por ejemplo, de 14:00 a 15:00),
   así cada noticia sale una sola vez aunque la ejecución se retrase unos minutos.
   Variables en Vercel: DISCORD_WEBHOOK_ALERTAS, CRON_SECRET.
   Fuente: titulares de Yahoo Finance por activo (en inglés). */

const { authorized, postWebhook, cetTime } = require("./_lib/discord");

const FEEDS = [
  { tag: "Nasdaq (MNQ · NQ · USTEC)", sym: "^IXIC", color: 0xe0a526 },
  { tag: "S&P 500 (ES)", sym: "^GSPC", color: 0xe0a526 },
  { tag: "Dow (MYM)", sym: "^DJI", color: 0xe0a526 },
  { tag: "Oro (GC)", sym: "GC=F", color: 0xf5c84c },
  { tag: "Crudo (CL)", sym: "CL=F", color: 0x9d4edd },
  { tag: "EUR/USD", sym: "EURUSD=X", color: 0x22f5a5 },
  { tag: "GBP/USD", sym: "GBPUSD=X", color: 0x22f5a5 },
  { tag: "USD/JPY", sym: "JPY=X", color: 0x22f5a5 },
];
const MAX_POSTS = 20;
// Titulares de relleno que no aportan a un trader de índices, oro, crudo o forex
const NOISE = /\$[\d,.]+\s*(investment|invested)|stocks? to buy|should you buy|buy (now|today)|millionaire|retire(ment)?|dividend stock|passive income|forever stock|motley fool|zacks rank|is it too late|could make you rich/i;

const decode = s => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/<[^>]+>/g, "").trim();
const tag = (xml, t) => { const m = xml.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`)); return m ? decode(m[1]) : ""; };

async function readFeed(f) {
  const url = `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(f.sym)}&region=US&lang=en-US`;
  const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (Kairos alertas)" } });
  if (!r.ok) throw new Error(`Yahoo ${f.sym}: ${r.status}`);
  const xml = await r.text();
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => ({
    title: tag(m[1], "title"), link: tag(m[1], "link"), date: new Date(tag(m[1], "pubDate")),
    summary: tag(m[1], "description"), tags: [f.tag], color: f.color,
  })).filter(i => i.title && i.link && !isNaN(i.date) && !NOISE.test(i.title));
}

module.exports = async (req, res) => {
  if (!authorized(req)) return res.status(401).json({ error: "unauthorized" });
  const hook = process.env.DISCORD_WEBHOOK_ALERTAS;
  if (!hook) return res.status(503).json({ error: "not_configured", message: "Falta DISCORD_WEBHOOK_ALERTAS en Vercel." });

  // Ventana: la hora completa anterior (o las horas que indique ?hours=, máximo 24)
  const hours = Math.max(1, Math.min(24, Number(req.query?.hours) || 1));
  const end = new Date(); end.setUTCMinutes(0, 0, 0);
  const start = new Date(end.getTime() - hours * 3600e3);

  try {
    const results = await Promise.allSettled(FEEDS.map(readFeed));
    const byLink = new Map();
    results.forEach(r => {
      if (r.status !== "fulfilled") return;
      for (const it of r.value) {
        if (it.date < start || it.date >= end) continue;
        const prev = byLink.get(it.link);
        if (prev) { if (!prev.tags.includes(it.tags[0])) prev.tags.push(it.tags[0]); } else byLink.set(it.link, it);
      }
    });
    const items = [...byLink.values()].sort((a, b) => a.date - b.date).slice(-MAX_POSTS);
    if (!items.length) return res.status(200).json({ ok: true, posted: 0, window: [start, end] });

    // Discord admite 10 embeds por mensaje
    for (let i = 0; i < items.length; i += 10) {
      await postWebhook(hook, {
        content: i === 0 ? `📰 **Noticias de ${cetTime(start)} a ${cetTime(end).slice(-5)} CET**` : undefined,
        embeds: items.slice(i, i + 10).map(it => ({
          title: it.title.slice(0, 256), url: it.link, color: it.color,
          description: (it.summary || "").slice(0, 300) || undefined,
          footer: { text: `${it.tags.join(" · ")} · ${cetTime(it.date)} CET · Yahoo Finance` },
        })),
      });
    }
    const failed = results.filter(r => r.status === "rejected").length;
    return res.status(200).json({ ok: true, posted: items.length, feedsFailed: failed });
  } catch (err) {
    console.error("[api/discord-alertas]", err);
    return res.status(502).json({ error: "post_failed", message: String(err.message || err) });
  }
};
