/* Utilidades comunes de las publicaciones automáticas en Discord. */

// Solo GitHub Actions (con el secreto) puede lanzar las publicaciones.
function authorized(req) {
  const secret = (process.env.CRON_SECRET || "").trim();
  if (!secret) return false;
  const h = req.headers.authorization || "";
  return h === `Bearer ${secret}`;
}

async function postWebhook(url, payload) {
  const r = await fetch(url.trim() + "?wait=true", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "Kairos", ...payload }),
  });
  if (!r.ok) throw new Error(`Discord respondió ${r.status}: ${(await r.text()).slice(0, 200)}`);
}

const cetTime = d => d.toLocaleString("es-ES", { timeZone: "Europe/Madrid", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

module.exports = { authorized, postWebhook, cetTime };
