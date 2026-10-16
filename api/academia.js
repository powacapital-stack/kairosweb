/* GET /api/academia — Lecciones completas del curso exclusivo. Solo para quien lo ha comprado (sesión con el curso). */
const S = require("./_lib/session");
const CONTENT = require("./_lib/academia-content");

module.exports = (req, res) => {
  const s = S.getSession(req);
  if (!s) return S.sendJson(res, 401, { error: "login_required" });
  if (!s.c) return S.sendJson(res, 403, { error: "course_required" });
  S.sendJson(res, 200, { modules: CONTENT });
};
