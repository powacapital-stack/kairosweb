/* GET /api/auth/callback — Vuelta desde Whop: canjea el código, lee el usuario, comprueba sus compras y abre la sesión. */
const S = require("../_lib/session");

const fail = (res, code) => S.redirect(res, `/app.html?login=${code}`);

module.exports = async (req, res) => {
  const q = S.query(req);
  const pkce = S.verify(S.readCookies(req)[S.OAUTH_COOKIE]);
  const clearOauth = S.cookie(req, S.OAUTH_COOKIE, "", { maxAge: 0, path: "/api/auth" });
  res.setHeader("Set-Cookie", clearOauth);

  if (q.error) return fail(res, "cancelado");
  if (!pkce || !q.code || q.state !== pkce.s) return fail(res, "caducado");

  try {
    const body = {
      grant_type: "authorization_code", code: q.code, redirect_uri: `${S.origin(req)}/api/auth/callback`,
      client_id: S.env("WHOP_CLIENT_ID"), code_verifier: pkce.v,
    };
    const secret = S.env("WHOP_CLIENT_SECRET") || S.env("WHOP_API_KEY");
    if (secret) body.client_secret = secret;
    const t = await fetch("https://api.whop.com/oauth/token", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!t.ok) throw new Error(`token ${t.status}: ${(await t.text()).slice(0, 200)}`);
    const { access_token } = await t.json();

    const u = await fetch("https://api.whop.com/oauth/userinfo", { headers: { Authorization: `Bearer ${access_token}` } });
    if (!u.ok) throw new Error(`userinfo ${u.status}`);
    const user = await u.json();

    const [member, course] = await Promise.all([
      S.checkAccess(user.sub, S.env("WHOP_PRODUCT_MEMBERSHIP"), access_token),
      S.checkAccess(user.sub, S.env("WHOP_PRODUCT_COURSE"), access_token),
    ]);

    const session = {
      uid: user.sub, name: user.name || user.preferred_username || "Trader", pic: user.picture || "",
      m: member, c: course, exp: Date.now() + S.SESSION_HOURS * 3600e3,
    };
    res.setHeader("Set-Cookie", [clearOauth, S.cookie(req, S.SESSION_COOKIE, S.sign(session), { maxAge: S.SESSION_HOURS * 3600 })]);
    S.redirect(res, pkce.next);
  } catch (err) {
    console.error("[api/auth/callback]", err);
    fail(res, "error");
  }
};
