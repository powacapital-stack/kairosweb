/* GET /api/academia — Lecciones completas del curso exclusivo. Solo para quien lo ha comprado (sesión con el curso). */
const S = require("./_lib/session");
const CONTENT = require("./_lib/academia-content");
const EXTRA = require("./_lib/academia-extra");
const FIGS = require("./_lib/academia-figs");
const MNQ = require("./_lib/academia-mnq");
const CASOS = require("./_lib/academia-casos");

// Cada lección: título, explicación, clave, pasos para aplicarla, ejemplo práctico, diagrama y vídeo (si existe)
const MODULES = CONTENT.map((m, mi) => ({
  ...m,
  lessons: m.lessons.map((l, li) => ({ ...l, steps: [], example: "", video: "", shots: [], ...(EXTRA[mi]?.[li] || {}), fig: FIGS[mi]?.[li] || null })),
})).concat({ ...MNQ, lessons: MNQ.lessons.map(l => ({ video: "", ...l })) }, CASOS);

module.exports = (req, res) => {
  const s = S.getSession(req);
  if (!s) return S.sendJson(res, 401, { error: "login_required" });
  if (!s.c) return S.sendJson(res, 403, { error: "course_required" });
  // Enlaces de las capturas firmados para este alumno; caducan a los 30 min (la Academia los renueva sola)
  const exp = Date.now() + 30 * 60 * 1000;
  const signShot = sh => ({ ...sh, src: "/api/academia-img?t=" + S.sign({ k: "img", f: String(sh.src).split("f=")[1], uid: s.uid, exp }) });
  res.setHeader("Cache-Control", "private, no-store");
  S.sendJson(res, 200, { expiresAt: exp, modules: MODULES.map(m => ({ ...m, lessons: m.lessons.map(l => (l.shots?.length ? { ...l, shots: l.shots.map(signShot) } : l)) })) });
};
