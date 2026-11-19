/* GET /api/academia-img?t=TOKEN — Capturas de operaciones del curso, solo para quien ha comprado el curso.
   - El enlace lo firma /api/academia para cada alumno y caduca a los 30 min: copiado o compartido no sirve a nadie.
   - Cada imagen sale con una marca de agua con el nombre y el id de Whop de quien la ve, y la fecha.
   - No se guarda en caché. */
const fs = require("fs"), path = require("path");
const S = require("./_lib/session");
const { watermark } = require("./_lib/watermark");

const DIR = path.join(__dirname, "_lib", "academia-img");

module.exports = async (req, res) => {
  const s = S.getSession(req);
  if (!s) return S.sendJson(res, 401, { error: "login_required" });
  if (!s.c) return S.sendJson(res, 403, { error: "course_required" });
  const t = S.verify(S.query(req).t || "");
  if (!t || t.k !== "img" || t.uid !== s.uid) return S.sendJson(res, 403, { error: "link_expired" });
  const f = t.f || "";
  if (!/^[a-z0-9-]+\.(png|webp)$/.test(f) || !fs.existsSync(path.join(DIR, f))) return S.sendJson(res, 404, { error: "not_found" });
  try {
    const out = await watermark(path.join(DIR, f), s);
    res.statusCode = 200;
    res.setHeader("Content-Type", "image/webp");
    res.setHeader("Cache-Control", "private, no-store, max-age=0");
    res.setHeader("Content-Disposition", "inline");
    res.setHeader("X-Robots-Tag", "noindex, noimageindex");
    res.end(out);
  } catch (e) {
    console.error("[academia-img]", e);
    S.sendJson(res, 500, { error: "image_failed" });
  }
};
