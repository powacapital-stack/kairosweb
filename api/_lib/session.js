/* Sesiones de Kairos: cookies firmadas con HMAC, login con Whop (OAuth + PKCE) y comprobación de acceso.
   Variables en Vercel:
     SESSION_SECRET              cadena aleatoria larga para firmar las cookies (obligatoria)
     WHOP_CLIENT_ID              ID de la app de Whop (app_…)
     WHOP_CLIENT_SECRET          secreto de la app de Whop (opcional, se envía si existe)
     WHOP_API_KEY                clave de la empresa en Whop (opcional; si falta se usa el token del usuario)
     WHOP_PRODUCT_MEMBERSHIP     producto de la membresía de 77 €/mes (prod_…)
     WHOP_PRODUCT_COURSE         producto del curso exclusivo de 299 € (prod_…) */

const crypto = require("crypto");

const SESSION_COOKIE = "kx_session";
const OAUTH_COOKIE = "kx_oauth";
const SESSION_HOURS = 12;
const env = k => (process.env[k] || "").trim();

const b64url = buf => Buffer.from(buf).toString("base64url");
const randomString = n => b64url(crypto.randomBytes(n));

function sign(obj) {
  const secret = env("SESSION_SECRET");
  if (!secret) throw new Error("Falta SESSION_SECRET en Vercel.");
  const body = b64url(JSON.stringify(obj));
  const mac = b64url(crypto.createHmac("sha256", secret).update(body).digest());
  return `${body}.${mac}`;
}

function verify(token) {
  const secret = env("SESSION_SECRET");
  if (!secret || !token || !token.includes(".")) return null;
  const [body, mac] = token.split(".");
  const expected = b64url(crypto.createHmac("sha256", secret).update(body).digest());
  if (mac.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  try {
    const obj = JSON.parse(Buffer.from(body, "base64url").toString());
    return obj.exp && obj.exp > Date.now() ? obj : null;
  } catch { return null; }
}

function readCookies(req) {
  return Object.fromEntries((req.headers.cookie || "").split(";").map(c => c.trim()).filter(Boolean).map(c => {
    const i = c.indexOf("="); return [c.slice(0, i), decodeURIComponent(c.slice(i + 1))];
  }));
}

const isLocal = req => /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(req.headers.host || "");
const origin = req => `${isLocal(req) ? "http" : "https"}://${req.headers.host}`;

function cookie(req, name, value, { maxAge, path = "/" } = {}) {
  return [`${name}=${encodeURIComponent(value)}`, `Path=${path}`, "HttpOnly", "SameSite=Lax",
    isLocal(req) ? "" : "Secure", maxAge !== undefined ? `Max-Age=${maxAge}` : ""].filter(Boolean).join("; ");
}

const query = req => Object.fromEntries(new URL(req.url, "http://x").searchParams);

function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "private, no-store");
  res.end(JSON.stringify(data));
}

function redirect(res, location) {
  res.statusCode = 302;
  res.setHeader("Location", location);
  res.setHeader("Cache-Control", "no-store");
  res.end();
}

// Solo se permite volver a páginas de la propia web
const safeNext = n => (typeof n === "string" && /^\/(?!\/)[\w\-./#?=&%]*$/.test(n) ? n : "/app.html");

const getSession = req => verify(readCookies(req)[SESSION_COOKIE]);

// ¿El usuario tiene acceso a este producto de Whop?
async function checkAccess(userId, productId, userToken) {
  if (!productId) return false;
  const token = env("WHOP_API_KEY") || userToken;
  const r = await fetch(`https://api.whop.com/api/v1/users/${encodeURIComponent(userId)}/access/${encodeURIComponent(productId)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) { console.error("[whop access]", productId, r.status, (await r.text()).slice(0, 200)); return false; }
  const d = await r.json();
  return d.has_access === true;
}

module.exports = {
  SESSION_COOKIE, OAUTH_COOKIE, SESSION_HOURS, env, randomString, b64url, sign, verify, readCookies,
  origin, cookie, query, sendJson, redirect, safeNext, getSession, checkAccess,
};
