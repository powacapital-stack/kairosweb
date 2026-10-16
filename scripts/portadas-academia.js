/* Genera las portadas de los módulos de la Academia: node scripts/portadas-academia.js → img/academia/modulo-N.svg */
const fs = require("fs"), path = require("path");
const { C, text, rect, line, circle, candles, zone, level } = require("../api/_lib/svg");

const W = 640, H = 220;
const frame = (n, name, art) => `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="Space Grotesk, Segoe UI, sans-serif">
<defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#0c1430"/><stop offset="1" stop-color="#150a2e"/></linearGradient>
<linearGradient id="kg" x1="0" x2="1"><stop offset="0" stop-color="${C.cy}"/><stop offset="1" stop-color="${C.vi}"/></linearGradient>
<radialGradient id="glow" cx=".75" cy=".4" r=".6"><stop offset="0" stop-color="${C.cy}" stop-opacity=".22"/><stop offset="1" stop-color="${C.cy}" stop-opacity="0"/></radialGradient></defs>
<rect width="${W}" height="${H}" fill="url(#g)"/><rect width="${W}" height="${H}" fill="url(#glow)"/>
${art}
<text x="28" y="92" font-size="64" font-weight="800" fill="url(#kg)" font-family="Orbitron, Segoe UI, sans-serif">${n}</text>
<text x="30" y="124" font-size="12" letter-spacing="3" fill="${C.mu}" font-family="JetBrains Mono, Consolas, monospace">MÓDULO</text>
<text x="30" y="152" font-size="22" font-weight="700" fill="${C.tx}">${name}</text></svg>`;

const area = { x0: 300, x1: 620, y0: 26, y1: 196 };
const arts = [
  (() => { // Sala de Mando: medidor y barras de flujo
    const cx = 470, cy = 150, R = 90; const p = a => [cx + R * Math.cos(Math.PI * (1 - a)), cy - R * Math.sin(Math.PI * (1 - a))];
    const arc = (a0, a1, col) => { const [x0, y0] = p(a0), [x1, y1] = p(a1); return `<path d="M${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1}" fill="none" stroke="${col}" stroke-width="14"/>`; };
    let s = arc(0, .35, C.dn) + arc(.35, .6, C.fl) + arc(.6, 1, C.up); const [nx, ny] = p(.72);
    s += line(cx, cy, cx + (nx - cx) * .75, cy + (ny - cy) * .75, C.tx, { w: 3 }) + circle(cx, cy, 6, C.tx);
    s += rect(330, 186, 280 * .63, 8, C.up, { rx: 3 }) + rect(330 + 280 * .63, 186, 280 * .37, 8, C.dn, { rx: 3 });
    return s; })(),
  (() => { const ch = candles([40, 41, 40.5, 47, 54, 59, 60, 59.5, 53, 48, 44, 42, 46, 52], area); return zone(ch, 0, 13, 39.3, 41.6, C.up) + zone(ch, 5, 13, 58.6, 61, C.dn) + ch.svg; })(),
  (() => { let s = ""; const d = [60, 90, 120, 70, -40, -80, -60, 50, 110, 140, 90, -30, 80];
    d.forEach((v, i) => { const x = 310 + i * 24; s += rect(x, v >= 0 ? 110 - v / 2 : 110, 16, Math.abs(v) / 2, v >= 0 ? C.up : C.dn, { rx: 2, op: .9 }); });
    for (let i = 0; i < 9; i++) { const v = 20 + 110 * Math.exp(-((i - 5) * (i - 5)) / 5); s += rect(620 - v, 130 + i * 8, v, 6, i === 5 ? C.cy : C.vi, { rx: 2, op: i === 5 ? 1 : .5 }); }
    return s + line(300, 110, 620, 110, C.mu, { op: .5 }); })(),
  (() => { const ch = candles([50, 48, 46, 47, 50, 53, 54, 52.5, 55, 58, 61], area);
    return ch.svg + level(ch, 46.5, C.cy, "ENTRADA", { x1: 300, x2: 620 }) + level(ch, 43.8, C.dn, "STOP", { x1: 300, x2: 620 }) + level(ch, 60.5, C.up, "OBJETIVO", { x1: 300, x2: 620 }); })(),
  (() => { // Estrategia MNQ: zona, columnas de huella y delta
    let s = rect(300, 30, 320, 60, C.vi, { op: .22, stroke: C.vi, rx: 4 });
    [[330, 40, 150, C.up], [380, 20, 120, C.dn], [430, 50, 170, C.up], [480, 30, 160, C.dn], [530, 70, 190, C.dn]].forEach(([x, y0, y1, col], i) => {
      s += line(x, y0, x, y1, col, { w: 3 });
      for (let y = y0 + 6; y < y1; y += 9) s += rect(x + 6, y, 10 + ((y * 7 + i * 13) % 22), 6, C.fl, { op: .5, rx: 1 });
    });
    s += rect(330, 186, 70, 14, C.dn, { op: .9, rx: 3 }) + rect(404, 186, 60, 14, C.up, { op: .6, rx: 3 }) + rect(468, 186, 76, 14, C.dn, { op: .9, rx: 3 });
    s += text(612, 198, "−3.150", { size: 12, fill: C.dn, anchor: "end", weight: 700, mono: true });
    return s; })(),
  (() => { // Operaciones reales: tres capturas apiladas con marcas de entrada y objetivo
    let s = "";
    [[330, 40, -6], [380, 56, 0], [430, 72, 6]].forEach(([x, y, r], i) => {
      s += `<g transform="rotate(${r} ${x + 90} ${y + 60})">` + rect(x, y, 180, 120, "#10172e", { stroke: i === 2 ? C.cy : C.ln, rx: 8 });
      const ch = candles([20, 22, 21, 25, 24, 28, 27, 31, 30, 34], { x0: x + 8, x1: x + 172, y0: y + 12, y1: y + 108 });
      s += ch.svg + (i === 2 ? line(x + 8, ch.y(24), x + 172, ch.y(24), C.cy, { dash: "4 3" }) + line(x + 8, ch.y(33), x + 172, ch.y(33), C.up, { dash: "4 3" }) : "") + "</g>";
    });
    return s; })(),
];
const names = ["La Sala de Mando", "Oferta y demanda", "Orderflow", "Ejecución", "Estrategia Secreta MNQ", "Operaciones reales"];
const out = path.join(__dirname, "..", "img", "academia");
names.forEach((n, i) => fs.writeFileSync(path.join(out, `modulo-${i + 1}.svg`), frame(String(i + 1).padStart(2, "0"), n, arts[i])));
console.log("Portadas creadas en", out);
