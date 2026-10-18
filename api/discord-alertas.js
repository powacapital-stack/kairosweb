/* POST /api/discord-alertas — Publica en #alertas las noticias de la última hora de los activos de Kairos.
   Lo lanza GitHub Actions cada hora (.github/workflows/discord.yml).
   Cada ejecución publica las noticias de la hora completa anterior (por ejemplo, de 14:00 a 15:00),
   así cada noticia sale una sola vez aunque la ejecución se retrase unos minutos.
   Variables en Vercel: DISCORD_WEBHOOK_ALERTAS, CRON_SECRET.
   Fuente: titulares de Yahoo Finance por activo (en inglés). */

const { authorized, postWebhook, cetTime } = require("./_lib/discord");
const { collectNews } = require("./_lib/news");

const MAX_POSTS = 20;

module.exports = async (req, res) => {
  if (!authorized(req)) return res.status(401).json({ error: "unauthorized" });
  const hook = process.env.DISCORD_WEBHOOK_ALERTAS;
  if (!hook) return res.status(503).json({ error: "not_configured", message: "Falta DISCORD_WEBHOOK_ALERTAS en Vercel." });

  // Ventana: la hora completa anterior (o las horas que indique ?hours=, máximo 24)
  const hours = Math.max(1, Math.min(24, Number(req.query?.hours) || 1));
  const end = new Date(); end.setUTCMinutes(0, 0, 0);
  const start = new Date(end.getTime() - hours * 3600e3);

  try {
    const { items: all, feedsFailed: failed } = await collectNews(start, end);
    const items = all.slice(-MAX_POSTS);
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
    return res.status(200).json({ ok: true, posted: items.length, feedsFailed: failed });
  } catch (err) {
    console.error("[api/discord-alertas]", err);
    return res.status(502).json({ error: "post_failed", message: String(err.message || err) });
  }
};
