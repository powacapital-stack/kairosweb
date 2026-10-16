/* Piezas para dibujar los diagramas de la Academia en SVG con los colores de Kairos. */

const C = { cy: "#00f0ff", vi: "#8b5cff", up: "#22f5a5", dn: "#ff4d7d", mu: "#8b93ad", tx: "#e6e9ee", ln: "#1d2742", fl: "#c9b458", bg: "#0a0d18" };
const W = 640;

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const r1 = n => Math.round(n * 10) / 10;

function svg(body, h = 300, title = "") {
  let grid = "";
  for (let y = 30; y < h; y += 40) grid += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${C.ln}" stroke-opacity=".45"/>`;
  return `<svg viewBox="0 0 ${W} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(title)}" font-family="Space Grotesk, Segoe UI, sans-serif">`
    + `<defs><linearGradient id="kg" x1="0" x2="1"><stop offset="0" stop-color="${C.cy}"/><stop offset="1" stop-color="${C.vi}"/></linearGradient></defs>`
    + `<rect width="${W}" height="${h}" rx="14" fill="${C.bg}"/>${grid}${body}</svg>`;
}

const text = (x, y, s, { size = 13, fill = C.mu, anchor = "start", weight = 400, mono = false } = {}) =>
  `<text x="${r1(x)}" y="${r1(y)}" font-size="${size}" fill="${fill}" text-anchor="${anchor}" font-weight="${weight}"${mono ? ' font-family="JetBrains Mono, Consolas, monospace"' : ""}>${esc(s)}</text>`;
const rect = (x, y, w, h, fill, { stroke = "none", op = 1, rx = 6, dash = "" } = {}) =>
  `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" rx="${rx}" fill="${fill}" fill-opacity="${op}" stroke="${stroke}"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`;
const line = (x1, y1, x2, y2, stroke = C.mu, { w = 1.5, dash = "", op = 1 } = {}) =>
  `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="${stroke}" stroke-width="${w}" stroke-opacity="${op}"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`;
const circle = (x, y, r, fill, { op = 1, stroke = "none" } = {}) => `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}" fill="${fill}" fill-opacity="${op}" stroke="${stroke}" stroke-width="2"/>`;
const arrow = (x1, y1, x2, y2, color = C.cy) => {
  const a = Math.atan2(y2 - y1, x2 - x1), s = 9;
  const p = (ang) => `${r1(x2 - s * Math.cos(a - ang))},${r1(y2 - s * Math.sin(a - ang))}`;
  return line(x1, y1, x2, y2, color, { w: 2 }) + `<polygon points="${r1(x2)},${r1(y2)} ${p(0.45)} ${p(-0.45)}" fill="${color}"/>`;
};
const pill = (x, y, s, color) => rect(x, y - 13, s.length * 7.4 + 16, 20, color, { op: .15, rx: 10, stroke: color }) + text(x + 8, y + 1, s, { size: 11, fill: color, weight: 600, mono: true });

// Velas a partir de una lista de cierres. Devuelve el SVG y las funciones de posición.
function candles(closes, { x0 = 40, x1 = 600, y0 = 30, y1 = 270, open, pad = 0.12, wick = 0.35, colors } = {}) {
  const o = [open ?? closes[0] - (closes[1] - closes[0])];
  closes.forEach((c, i) => { if (i) o.push(closes[i - 1]); });
  const hi = closes.map((c, i) => Math.max(c, o[i]) + Math.abs(c - o[i]) * wick + 0.6);
  const lo = closes.map((c, i) => Math.min(c, o[i]) - Math.abs(c - o[i]) * wick - 0.6);
  const max = Math.max(...hi), min = Math.min(...lo), span = max - min;
  const top = max + span * pad, bot = min - span * pad;
  const y = p => y0 + (top - p) / (top - bot) * (y1 - y0);
  const step = (x1 - x0) / closes.length, cw = Math.max(4, step * 0.58);
  const x = i => x0 + step * (i + 0.5);
  let out = "";
  closes.forEach((c, i) => {
    const col = colors?.[i] || (c >= o[i] ? C.up : C.dn);
    out += line(x(i), y(hi[i]), x(i), y(lo[i]), col, { w: 1.4 });
    out += rect(x(i) - cw / 2, y(Math.max(c, o[i])), cw, Math.max(2, Math.abs(y(c) - y(o[i]))), col, { rx: 1.5 });
  });
  return { svg: out, x, y, step, cw };
}

const zone = (ch, from, to, pLo, pHi, color, label) => {
  const x1 = ch.x(from) - ch.step / 2, x2 = ch.x(to) + ch.step / 2;
  return rect(x1, ch.y(pHi), x2 - x1, ch.y(pLo) - ch.y(pHi), color, { op: .14, rx: 4, stroke: color, dash: "5 4" })
    + (label ? text(x2 - 6, ch.y(pHi) - 6, label, { size: 11, fill: color, anchor: "end", weight: 600, mono: true }) : "");
};
const level = (ch, p, color, label, { dash = "6 5", x1 = 40, x2 = 600, at, below = false } = {}) =>
  line(x1, ch.y(p), x2, ch.y(p), color, { dash }) + text(at ?? x2, ch.y(p) + (below ? 14 : -5), label, { size: 11, fill: color, anchor: at === undefined ? "end" : "start", mono: true });

module.exports = { C, W, svg, text, rect, line, circle, arrow, pill, candles, zone, level, esc };
