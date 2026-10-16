/* GET /api/academia-img?f=archivo.png — Capturas de operaciones del curso. Solo para quien ha comprado el curso. */
const fs = require("fs"), path = require("path");
const S = require("./_lib/session");

const DIR = path.join(__dirname, "_lib", "academia-img");
const TYPES = { ".png": "image/png", ".webp": "image/webp" };

module.exports = (req, res) => {
  const s = S.getSession(req);
  if (!s) return S.sendJson(res, 401, { error: "login_required" });
  if (!s.c) return S.sendJson(res, 403, { error: "course_required" });
  const f = S.query(req).f || "";
  if (!/^[a-z0-9-]+\.(png|webp)$/.test(f) || !fs.existsSync(path.join(DIR, f))) return S.sendJson(res, 404, { error: "not_found" });
  res.statusCode = 200;
  res.setHeader("Content-Type", TYPES[path.extname(f)]);
  res.setHeader("Cache-Control", "private, max-age=86400");
  res.end(fs.readFileSync(path.join(DIR, f)));
};
