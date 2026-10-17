/* POST /api/discord-sesgo — Publica en #sesgo-del-dia el resumen macro de cada activo.
   Lo lanza GitHub Actions cada 4 horas (.github/workflows/discord.yml).
   Variables en Vercel: DISCORD_WEBHOOK_SESGO, CRON_SECRET (y FRED_API_KEY para /api/macro). */

const { authorized, postWebhook, cetTime } = require("./_lib/discord");

// Un activo por grupo (MNQ, NQ y USTEC comparten lectura)
const GROUPS = [
  ["MNQ", "Nasdaq · MNQ · NQ · USTEC"], ["ES", "S&P 500 · ES"], ["MYM", "Dow · MYM"], ["GC", "Oro · GC"],
  ["CL", "Crudo · CL"], ["EUR/USD", "EUR/USD"], ["GBP/USD", "GBP/USD"], ["USD/JPY", "USD/JPY"],
];
const ICON = { Alcista: "🟢", Bajista: "🔴", Neutral: "🟡" };
const COLOR = { "RISK-ON": 0x22f5a5, "RISK-OFF": 0xff4d7d, NEUTRAL: 0xf5c84c };

module.exports = async (req, res) => {
  if (!authorized(req)) return res.status(401).json({ error: "unauthorized" });
  const hook = process.env.DISCORD_WEBHOOK_SESGO;
  if (!hook) return res.status(503).json({ error: "not_configured", message: "Falta DISCORD_WEBHOOK_SESGO en Vercel." });

  try {
    const r = await fetch(`https://${req.headers.host}/api/macro`);
    if (!r.ok) throw new Error(`/api/macro respondió ${r.status}`);
    const m = await r.json();
    const g = m.global;

    const fields = GROUPS.map(([s, label]) => {
      const a = m.assets[s];
      const level = a.conv >= 60 ? "alta" : a.conv >= 40 ? "media" : "baja";
      return {
        name: `${ICON[a.bias] || "⚪"} ${label} — ${a.bias.toUpperCase()} · ${a.conv}/100`,
        value: `${a.brief}\n*Motor principal: ${a.key} · convicción ${level}*`.slice(0, 1024),
        inline: false,
      };
    });

    await postWebhook(hook, {
      embeds: [{
        title: `Sesgo macro Kairos · ${cetTime(new Date())} CET`,
        url: "https://kairos-web-steel.vercel.app/app.html#macro",
        color: COLOR[g.regime] || 0xe0a526,
        description: `**Régimen global: ${g.regime}** · convicción ${g.conviction}/100 · ${g.macroBias}\n${g.brief}`.slice(0, 4096),
        fields,
        footer: { text: `Datos FRED a ${m.asOf} · Información, no asesoramiento financiero` },
      }],
    });
    return res.status(200).json({ ok: true, posted: fields.length });
  } catch (err) {
    console.error("[api/discord-sesgo]", err);
    return res.status(502).json({ error: "post_failed", message: String(err.message || err) });
  }
};
