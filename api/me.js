/* GET /api/me — Quién ha iniciado sesión y a qué tiene acceso (membresía y curso). */
const S = require("./_lib/session");

module.exports = (req, res) => {
  const s = S.getSession(req);
  if (!s) return S.sendJson(res, 200, { logged: false });
  S.sendJson(res, 200, { logged: true, name: s.name, picture: s.pic, member: !!s.m, course: !!s.c });
};
