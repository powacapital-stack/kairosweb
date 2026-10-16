/* GET /api/auth/logout — Cierra la sesión y vuelve a la portada. */
const S = require("../_lib/session");

module.exports = (req, res) => {
  res.setHeader("Set-Cookie", S.cookie(req, S.SESSION_COOKIE, "", { maxAge: 0 }));
  S.redirect(res, "/");
};
