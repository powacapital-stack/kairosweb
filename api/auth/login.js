/* GET /api/auth/login?next=/app.html — Envía al usuario a iniciar sesión con Whop (OAuth 2.1 + PKCE). */
const crypto = require("crypto");
const S = require("../_lib/session");

module.exports = (req, res) => {
  const clientId = S.env("WHOP_CLIENT_ID");
  if (!S.env("SESSION_SECRET") || !S.env("WHOP_API_KEY")) return S.sendJson(res, 503, { error: "not_configured", message: "Faltan SESSION_SECRET o WHOP_API_KEY en Vercel." });

  const pkce = { v: S.randomString(32), s: S.randomString(16), n: S.randomString(16), next: S.safeNext(S.query(req).next), exp: Date.now() + 10 * 60e3 };
  res.setHeader("Set-Cookie", S.cookie(req, S.OAUTH_COOKIE, S.sign(pkce), { maxAge: 600, path: "/api/auth" }));

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: `${S.origin(req)}/api/auth/callback`,
    scope: "openid profile email",
    state: pkce.s,
    nonce: pkce.n,
    code_challenge: S.b64url(crypto.createHash("sha256").update(pkce.v).digest()),
    code_challenge_method: "S256",
  });
  S.redirect(res, `https://api.whop.com/oauth/authorize?${params}`);
};
