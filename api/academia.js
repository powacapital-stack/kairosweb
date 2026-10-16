/* GET /api/academia — Lecciones completas del curso exclusivo. Solo para quien lo ha comprado (sesión con el curso). */
const S = require("./_lib/session");
const CONTENT = require("./_lib/academia-content");
const EXTRA = require("./_lib/academia-extra");
const FIGS = require("./_lib/academia-figs");

// Cada lección: título, explicación, clave, pasos para aplicarla, ejemplo práctico, diagrama y vídeo (si existe)
const MODULES = CONTENT.map((m, mi) => ({
  ...m,
  lessons: m.lessons.map((l, li) => ({ ...l, steps: [], example: "", video: "", ...(EXTRA[mi]?.[li] || {}), fig: FIGS[mi]?.[li] || null })),
}));

module.exports = (req, res) => {
  const s = S.getSession(req);
  if (!s) return S.sendJson(res, 401, { error: "login_required" });
  if (!s.c) return S.sendJson(res, 403, { error: "course_required" });
  S.sendJson(res, 200, { modules: MODULES });
};
