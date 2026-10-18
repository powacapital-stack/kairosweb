/* GET /api/sesion — Datos del briefing de la "Sesión del día":
   titulares de las últimas 24 h clasificados por tema y agenda económica de hoy (hora de Madrid).
   El contexto macro (régimen, motores y sesgo por activo) lo da /api/macro. */
const { TOPICS, collectNews, todayAgenda } = require("./_lib/news");

const MAX_NEWS = 40;

module.exports = async (req, res) => {
  const end = new Date(), start = new Date(end.getTime() - 24 * 3600e3);
  const [news, agenda] = await Promise.allSettled([collectNews(start, end), todayAgenda(end)]);

  const items = news.status === "fulfilled" ? news.value.items.slice(-MAX_NEWS).reverse() : [];
  const topics = [...TOPICS, { id: "mercados", name: "Mercados" }].map(t => ({
    id: t.id, name: t.name, count: items.filter(i => i.topic === t.id).length,
  })).filter(t => t.count);

  res.setHeader("Cache-Control", "public, s-maxage=900, stale-while-revalidate=3600");
  res.status(200).json({
    generatedAt: end.toISOString(),
    news: items.map(({ title, link, date, summary, assets, topic }) => ({ title, link, date, summary: (summary || "").slice(0, 280), assets, topic })),
    topics,
    agenda: agenda.status === "fulfilled" ? agenda.value : null,
    errors: [news, agenda].filter(r => r.status === "rejected").map(r => String(r.reason?.message || r.reason)),
  });
};
