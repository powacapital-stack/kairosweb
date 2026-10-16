/* Diagramas de las lecciones del curso: ejemplos de operaciones anotados (entrada, stop y objetivos).
   Se entregan solo a quien ha comprado el curso, junto con el texto de cada lección. */
const { C, svg, text, rect, line, circle, arrow, pill, candles, zone, level } = require("./svg");

// Marcas de operación
const buy = (ch, i, p, label = "COMPRA") => arrow(ch.x(i), ch.y(p) + 34, ch.x(i), ch.y(p) + 8, C.up) + text(ch.x(i) + 8, ch.y(p) + 32, label, { size: 11, fill: C.up, weight: 700, mono: true });
const sell = (ch, i, p, label = "VENTA") => arrow(ch.x(i), ch.y(p) - 34, ch.x(i), ch.y(p) - 8, C.dn) + text(ch.x(i) + 8, ch.y(p) - 26, label, { size: 11, fill: C.dn, weight: 700, mono: true });
const num = (x, y, n, color = C.cy) => circle(x, y, 11, C.bg, { stroke: color }) + text(x, y + 4, n, { size: 12, fill: color, anchor: "middle", weight: 700 });
const title = s => text(24, 26, s, { size: 12, fill: C.cy, weight: 700, mono: true });

const sq = v => v * v;
const F = [];

/* ---------- MÓDULO 1 · LA SALA DE MANDO ---------- */
F.push([
  { caption: "El orden de lectura del panel: cinco pasos y una decisión.", svg: (() => {
    const steps = ["Sesgo", "Confianza", "Flujo", "Niveles", "Briefing"]; let b = title("RUTINA DE LECTURA · MENOS DE 1 MINUTO");
    steps.forEach((s, i) => { const x = 24 + i * 120; b += rect(x, 70, 104, 64, C.cy, { op: .08, stroke: C.cy, rx: 10 }) + num(x + 18, 88, i + 1) + text(x + 52, 118, s, { size: 15, fill: C.tx, anchor: "middle", weight: 600 }); if (i < 4) b += arrow(x + 106, 102, x + 118, 102); });
    b += arrow(320, 140, 320, 176) + rect(150, 182, 340, 78, C.vi, { op: .12, stroke: C.vi, rx: 12 });
    b += text(320, 214, "¿Hay operación de calidad?", { size: 16, fill: C.tx, anchor: "middle", weight: 700 });
    b += text(320, 240, "SÍ → plan de entrada     ·     NO → esperar", { size: 13, fill: C.mu, anchor: "middle", mono: true });
    return svg(b, 280, "Rutina de lectura del panel"); })() },
  { caption: "Cómo ajustar el tamaño según la confianza del sesgo.", svg: (() => {
    let b = title("CONFIANZA DEL SESGO → TAMAÑO DE LA OPERACIÓN");
    const cx = 320, cy = 220, R = 140, arc = (a0, a1, col) => { const p = a => [cx + R * Math.cos(Math.PI * (1 - a / 100)), cy - R * Math.sin(Math.PI * (1 - a / 100))]; const [x0, y0] = p(a0), [x1, y1] = p(a1); return `<path d="M${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1}" fill="none" stroke="${col}" stroke-width="22"/>`; };
    b += arc(0, 35, C.dn) + arc(35, 60, C.fl) + arc(60, 100, C.up);
    const a = Math.PI * (1 - 68 / 100); b += line(cx, cy, cx + (R - 30) * Math.cos(a), cy - (R - 30) * Math.sin(a), C.tx, { w: 3 }) + circle(cx, cy, 7, C.tx);
    b += text(cx, cy - 34, "68", { size: 34, fill: C.tx, anchor: "middle", weight: 800 });
    b += text(40, 262, "0–35 · no operar", { size: 12, fill: C.dn, mono: true }) + text(320, 262, "35–60 · ½ tamaño", { size: 12, fill: C.fl, anchor: "middle", mono: true }) + text(600, 262, "60+ · tamaño normal", { size: 12, fill: C.up, anchor: "end", mono: true });
    return svg(b, 290, "Medidor de confianza"); })() },
  { caption: "Izquierda: subida con compradores (sigue). Derecha: subida sin compradores (desconfía).", svg: (() => {
    let b = title("PRECIO + FLUJO: CONFIRMACIÓN Y TRAMPA");
    const a = candles([10, 12, 11, 14, 16, 15, 18, 20], { x0: 30, x1: 300, y0: 50, y1: 200 });
    const c = candles([10, 11, 13, 12, 14, 15, 16, 17], { x0: 340, x1: 610, y0: 50, y1: 200 });
    b += a.svg + c.svg;
    b += rect(30, 220, 270 * .61, 14, C.up, { rx: 3 }) + rect(30 + 270 * .61, 220, 270 * .39, 14, C.dn, { rx: 3 }) + text(30, 254, "61 % compra · SUBIDA SANA", { size: 12, fill: C.up, weight: 700, mono: true });
    b += rect(340, 220, 270 * .44, 14, C.up, { rx: 3 }) + rect(340 + 270 * .44, 220, 270 * .56, 14, C.dn, { rx: 3 }) + text(340, 254, "44 % compra · SUBIDA DÉBIL", { size: 12, fill: C.dn, weight: 700, mono: true });
    return svg(b, 280, "Precio y flujo"); })() },
  { caption: "Del briefing a la orden: localizar la demanda, poner la alerta y esperar al precio.", svg: (() => {
    let b = title("DEL BRIEFING A LA ORDEN");
    const ch = candles([60, 58, 55, 52, 50, 47, 45, 46, 49, 48, 51, 54, 57], { x0: 300, x1: 620, y0: 40, y1: 236 });
    b += rect(20, 46, 260, 220, C.cy, { op: .06, stroke: C.cy, rx: 12 }) + text(36, 72, "BRIEFING 16:05", { size: 12, fill: C.cy, weight: 700, mono: true });
    [["Sesgo", "ALCISTA", C.up], ["Demanda", "30.120", C.tx], ["Riesgo", "dato ya publicado", C.mu], ["Acción", "BUSCAR COMPRAS", C.up]].forEach(([k, v, col], i) => { b += text(36, 104 + i * 36, k, { size: 12 }) + text(264, 104 + i * 36, v, { size: 13, fill: col, anchor: "end", weight: 700, mono: true }); });
    b += zone(ch, 4, 12, 44, 47.5, C.up, "DEMANDA 30.120") + ch.svg + buy(ch, 7, 45.2) + level(ch, 47.8, C.cy, "alerta 30.125", { x1: 300, x2: 620, at: 304 });
    return svg(b, 290, "Del briefing a la orden"); })() },
  { caption: "Antes de un dato fuerte: asegurar la mitad y subir el stop a break even.", svg: (() => {
    let b = title("OPERAR ALREDEDOR DE UN DATO (IPC 14:30)");
    const ch = candles([20, 22, 21, 24, 26, 27, 26, 28, 18, 30, 35, 33, 37], { x0: 30, x1: 610, y0: 50, y1: 236 });
    const xs = ch.x(7) + ch.step / 2;
    b += rect(xs - ch.step * 0.9, 40, ch.step * 1.8, 230, C.fl, { op: .1, rx: 0 }) + line(xs, 40, xs, 270, C.fl, { dash: "4 4" }) + text(xs, 36, "IPC 14:30", { size: 12, fill: C.fl, anchor: "middle", weight: 700, mono: true });
    b += ch.svg + buy(ch, 1, 21) + num(ch.x(6), ch.y(31), 1) + text(ch.x(6) - 18, ch.y(31) - 16, "cierra 50 % · stop a BE", { size: 11, fill: C.tx, anchor: "end" });
    b += level(ch, 21.5, C.cy, "BE (entrada)", {}) + text(ch.x(8) - 18, ch.y(16.5), "latigazo de 80 pts", { size: 11, fill: C.dn, anchor: "end" });
    return svg(b, 290, "Operar alrededor de un dato"); })() },
  { caption: "El volumen de cada sesión: la mejor ventana para índices es la apertura de Nueva York.", svg: (() => {
    let b = title("SESIONES (HORA DE MADRID) Y VOLUMEN");
    const x = h => 30 + h / 24 * 580; let path = "M30 250";
    for (let h = 0; h <= 24; h += 0.5) { const v = 10 + 30 * Math.exp(-sq((h - 10) / 2.2)) + 120 * Math.exp(-sq((h - 16.3) / 1.4)) + 40 * Math.exp(-sq((h - 20) / 2)) + (h < 7 ? 8 : 0); path += ` L${x(h).toFixed(1)} ${(250 - v).toFixed(1)}`; }
    b += rect(x(0), 60, x(9) - x(0), 190, C.mu, { op: .06, rx: 0 }) + rect(x(9), 60, x(15.5) - x(9), 190, C.vi, { op: .08, rx: 0 }) + rect(x(15.5), 60, x(22) - x(15.5), 190, C.cy, { op: .1, rx: 0 });
    b += text(x(4.5), 80, "ASIA", { size: 12, anchor: "middle", weight: 700, mono: true }) + text(x(12.2), 80, "LONDRES", { size: 12, fill: C.vi, anchor: "middle", weight: 700, mono: true }) + text(x(18.7), 80, "NUEVA YORK", { size: 12, fill: C.cy, anchor: "middle", weight: 700, mono: true });
    b += `<path d="${path} L${x(24)} 250 Z" fill="url(#kg)" fill-opacity=".35" stroke="${C.cy}" stroke-width="2"/>`;
    b += line(x(15.5), 60, x(15.5), 250, C.up, { dash: "4 4" }) + text(x(15.5) + 6, 104, "15:30 apertura NY", { size: 12, fill: C.up, weight: 700 });
    [0, 6, 9, 12, 15.5, 18, 22, 24].forEach(h => { b += text(x(h), 272, h === 15.5 ? "15:30" : `${h}:00`, { size: 11, anchor: "middle", mono: true }); });
    return svg(b, 290, "Sesiones y volumen"); })() },
]);

/* ---------- MÓDULO 2 · OFERTA Y DEMANDA ---------- */
F.push([
  { caption: "Base pequeña + salida fuerte = zona. Se marca como rectángulo, no como línea.", svg: (() => {
    let b = title("CÓMO NACE UNA ZONA DE DEMANDA Y UNA DE OFERTA");
    const ch = candles([40, 41, 40.5, 41.2, 48, 55, 60, 61, 60.5, 61.3, 53, 47, 44, 46, 41.8, 46, 52], { y0: 40, y1: 236 });
    b += zone(ch, 0, 16, 39.4, 41.8, C.up, "DEMANDA") + zone(ch, 6, 16, 59.6, 62, C.dn, "OFERTA") + ch.svg;
    b += text(ch.x(1.5), ch.y(37), "base", { size: 11, fill: C.up, anchor: "middle" }) + arrow(ch.x(4), ch.y(44), ch.x(5.5), ch.y(56), C.up) + text(ch.x(4.4), ch.y(58), "salida fuerte", { size: 11, fill: C.up, anchor: "end" });
    b += buy(ch, 14, 41.8, "VUELVE A LA ZONA");
    return svg(b, 290, "Zonas de oferta y demanda"); })() },
  { caption: "Zona válida: la salida es varias veces el tamaño de la base. Zona débil: salida lenta.", svg: (() => {
    let b = title("ZONA VÁLIDA vs. ZONA DÉBIL");
    const a = candles([20, 20.6, 20.2, 31, 38, 41], { x0: 30, x1: 300, y0: 50, y1: 240 });
    const c = candles([20, 20.6, 20.2, 21.8, 23, 23.8, 25, 25.5], { x0: 340, x1: 610, y0: 50, y1: 240 });
    b += zone(a, 0, 5, 19.3, 21, C.up) + a.svg + zone(c, 0, 7, 19.3, 21, C.mu) + c.svg;
    b += text(165, 268, "✓ salida ×5 la base · VÁLIDA", { size: 13, fill: C.up, anchor: "middle", weight: 700, mono: true });
    b += text(475, 268, "✗ salida lenta · DÉBIL", { size: 13, fill: C.dn, anchor: "middle", weight: 700, mono: true });
    return svg(b, 290, "Zona válida y zona débil"); })() },
  { caption: "Objetivos realistas: usa el recorrido habitual de cada instrumento desde una zona de 1H.", svg: (() => {
    let b = title("REACCIÓN TÍPICA DESDE UNA ZONA DE 1H");
    [["MNQ", 30, 60, "30–60 pts"], ["MES", 8, 20, "8–20 pts"], ["Oro (GC)", 5, 15, "5–15 $"], ["EUR/USD", 15, 35, "15–35 pips"]].forEach(([n, lo, hi, lbl], i) => {
      const y = 70 + i * 50, sc = 380 / [60, 20, 15, 35][i];
      b += text(30, y + 16, n, { size: 14, fill: C.tx, weight: 600 }) + rect(150, y, 380, 22, C.ln, { rx: 6 }) + rect(150 + lo * sc, y, (hi - lo) * sc, 22, "url(#kg)", { rx: 6 }) + text(600, y + 16, lbl, { size: 12, fill: C.cy, anchor: "end", mono: true });
    });
    b += text(150, 280, "Pon el primer objetivo dentro de la parte baja del rango.", { size: 12 });
    return svg(b, 295, "Reacción típica por instrumento"); })() },
  { caption: "Cuantas más confluencias tiene una zona, más fuerza tiene. Con dos o más, es operable.", svg: (() => {
    let b = title("ZONA CON CONFLUENCIAS");
    const ch = candles([62, 60, 57, 55, 52, 49, 47.5, 50, 48.5, 47.8, 52, 56, 59], { y0: 40, y1: 236 });
    b += zone(ch, 3, 12, 46.5, 49, C.up, "") + ch.svg;
    b += level(ch, 48.6, C.cy, "VWAP", { dash: "2 4", at: 44 }) + level(ch, 47.6, C.fl, "mínimo día anterior", { at: 44, below: true }) + level(ch, 46.9, C.vi, "número redondo 7.780", { dash: "8 4", at: 210, below: true });
    b += pill(40, 60, "3 CONFLUENCIAS · ZONA FUERTE", C.up) + buy(ch, 9, 47.3);
    return svg(b, 290, "Zona con confluencias"); })() },
  { caption: "Dos formas de entrar en la misma zona. El stop siempre al otro lado, nunca dentro.", svg: (() => {
    let b = title("ENTRADA LÍMITE vs. ENTRADA CON CONFIRMACIÓN");
    const a = candles([60, 55, 50, 46, 44.5, 49, 54], { x0: 30, x1: 300, y0: 50, y1: 240, wick: .2 });
    const c = candles([60, 55, 50, 46, 45.2, 48.5, 53, 56], { x0: 340, x1: 610, y0: 50, y1: 240, wick: .2 });
    b += zone(a, 0, 6, 43, 46.5, C.up) + a.svg + level(a, 46.5, C.up, "límite", { x1: 30, x2: 300 }) + level(a, 42.2, C.dn, "STOP", { x1: 30, x2: 300 });
    b += zone(c, 0, 7, 43, 46.5, C.up) + c.svg + level(c, 48.5, C.up, "entrada al cierre", { x1: 340, x2: 610 }) + level(c, 42.2, C.dn, "STOP", { x1: 340, x2: 610 });
    b += text(165, 270, "Mejor precio, menos confirmación", { size: 12, anchor: "middle" }) + text(475, 270, "Vela de rechazo cerrada = confirmación", { size: 12, anchor: "middle" });
    return svg(b, 290, "Métodos de entrada"); })() },
  { caption: "La misma zona de demanda: con sesgo alcista rebota; con sesgo bajista se rompe.", svg: (() => {
    let b = title("LA ZONA SOLO SE OPERA A FAVOR DEL SESGO");
    const a = candles([60, 55, 50, 46, 45, 49, 54, 58], { x0: 30, x1: 300, y0: 60, y1: 240 });
    const c = candles([60, 55, 50, 46, 45.5, 41, 36, 33], { x0: 340, x1: 610, y0: 60, y1: 240 });
    b += zone(a, 0, 7, 43.5, 46.5, C.up) + a.svg + zone(c, 0, 7, 43.5, 46.5, C.mu) + c.svg;
    b += pill(30, 46, "SESGO ALCISTA · 70", C.up) + pill(340, 46, "SESGO BAJISTA · 70", C.dn);
    b += text(165, 272, "✓ rebote: operación válida", { size: 13, fill: C.up, anchor: "middle", weight: 700 }) + text(475, 272, "✗ ruptura: no comprar", { size: 13, fill: C.dn, anchor: "middle", weight: 700 });
    return svg(b, 290, "Zona y sesgo"); })() },
]);

/* ---------- MÓDULO 3 · ORDERFLOW ---------- */
F.push([
  { caption: "El orderflow confirma en tu zona: aparecen compradores agresivos justo donde esperabas.", svg: (() => {
    let b = title("QUIÉN AGREDE EN TU ZONA");
    const ch = candles([60, 57, 54, 51, 49, 47.5, 48, 51, 54, 57], { y0: 40, y1: 236 });
    b += zone(ch, 3, 9, 46.5, 49.5, C.up, "DEMANDA") + ch.svg;
    [[4, 49, 6, C.dn], [5, 47.8, 9, C.up], [6, 47.6, 14, C.up], [7, 49.5, 11, C.up], [3, 52, 10, C.dn]].forEach(([i, p, r, col]) => { b += circle(ch.x(i) + 18, ch.y(p), r, col, { op: .35, stroke: col }); });
    b += text(ch.x(6) + 40, ch.y(44.5), "compras agresivas a mercado", { size: 12, fill: C.up }) + buy(ch, 6, 47.2);
    return svg(b, 280, "Agresores en la zona"); })() },
  { caption: "El delta se agota mientras el precio sigue subiendo: no compres más arriba.", svg: (() => {
    let b = title("PRECIO Y DELTA POR VELA");
    const ch = candles([20, 23, 26, 28, 30, 31, 31.8, 32.3], { x0: 40, x1: 600, y0: 40, y1: 170 });
    b += ch.svg;
    const d = [140, 160, 120, 90, 60, 30, 15, -10], base = 225;
    d.forEach((v, i) => { b += rect(ch.x(i) - ch.cw / 2, v >= 0 ? base - v / 3 : base, ch.cw, Math.abs(v) / 3, v >= 0 ? C.up : C.dn, { rx: 2 }) + text(ch.x(i), 280, (v > 0 ? "+" : "") + v, { size: 11, anchor: "middle", mono: true }); });
    b += line(40, base, 600, base, C.mu, { op: .6 }) + text(40, 196, "DELTA", { size: 11, fill: C.cy, weight: 700, mono: true });
    b += arrow(ch.x(1), 185, ch.x(6), 214, C.fl) + text(ch.x(4), 186, "fuerza agotándose", { size: 12, fill: C.fl });
    return svg(b, 295, "Delta agotándose"); })() },
  { caption: "Lee la barra de flujo con dos umbrales: 45 % y 55 %.", svg: (() => {
    let b = title("BARRA DE COMPRA / VENTA");
    b += rect(40, 100, 560 * .45, 40, C.dn, { op: .55, rx: 8 }) + rect(40 + 560 * .45, 100, 560 * .1, 40, C.fl, { op: .55, rx: 0 }) + rect(40 + 560 * .55, 100, 560 * .45, 40, C.up, { op: .55, rx: 8 });
    b += text(40 + 560 * .225, 126, "PRESIÓN VENDEDORA", { size: 13, fill: C.tx, anchor: "middle", weight: 700 }) + text(40 + 560 * .5, 126, "DUDA", { size: 12, fill: C.tx, anchor: "middle", weight: 700 }) + text(40 + 560 * .775, 126, "PRESIÓN COMPRADORA", { size: 13, fill: C.tx, anchor: "middle", weight: 700 });
    [0, 45, 55, 100].forEach(v => { b += line(40 + v * 5.6, 92, 40 + v * 5.6, 148, C.tx, { op: .6 }) + text(40 + v * 5.6, 170, v + " %", { size: 12, anchor: "middle", mono: true }); });
    b += text(40 + 560 * .225, 220, "busca ventas", { size: 14, fill: C.dn, anchor: "middle", weight: 600 }) + text(320, 220, "reduce o espera", { size: 14, fill: C.fl, anchor: "middle", weight: 600 }) + text(40 + 560 * .775, 220, "busca compras", { size: 14, fill: C.up, anchor: "middle", weight: 600 });
    return svg(b, 250, "Barra de flujo"); })() },
  { caption: "Absorción: mucha venta agresiva en la demanda y el precio no baja. Después gira y sube.", svg: (() => {
    let b = title("PERFIL DE VOLUMEN Y ABSORCIÓN");
    const ch = candles([60, 56, 52, 49, 48.2, 48.5, 48.1, 48.6, 52, 56, 59], { x0: 200, x1: 620, y0: 40, y1: 236 });
    b += zone(ch, 3, 10, 47, 49.5, C.up, "DEMANDA") + ch.svg;
    const rows = 14; for (let i = 0; i < rows; i++) { const p = 46 + i * 1.1, v = 30 + 120 * Math.exp(-sq((p - 48.4) / 1.6)) + (i * 7) % 20; b += rect(30, ch.y(p) - 6, v, 11, v > 140 ? C.cy : C.vi, { op: v > 140 ? .9 : .45, rx: 2 }); }
    b += text(30, 36 + 20, "POC", { size: 11, fill: C.cy, weight: 700, mono: true }) + arrow(70, 60, 120, ch.y(48.4) - 8, C.cy);
    b += text(ch.x(4) - 10, ch.y(53), "900 contratos vendidos · el precio no baja", { size: 11, fill: C.fl }) + buy(ch, 7, 48);
    return svg(b, 290, "Absorción en el perfil de volumen"); })() },
  { caption: "Divergencia: el precio hace máximo más alto, el delta no. En oferta, prepara la venta.", svg: (() => {
    let b = title("DIVERGENCIA DE DELTA EN OFERTA");
    const ch = candles([30, 35, 40, 44, 41, 38, 42, 46, 47.5, 43, 39], { x0: 40, x1: 600, y0: 40, y1: 180 });
    b += zone(ch, 2, 10, 44.5, 48.5, C.dn) + text(ch.x(2) - ch.step / 2 + 6, ch.y(48.5) - 6, "OFERTA", { size: 11, fill: C.dn, weight: 600, mono: true }) + ch.svg + sell(ch, 9, 46);
    b += line(ch.x(3), ch.y(44.8) - 6, ch.x(8), ch.y(48.3) - 6, C.fl, { w: 2 });
    const d = [80, 120, 150, 170, -40, -60, 60, 90, 70, -120, -90], base = 240;
    d.forEach((v, i) => { b += rect(ch.x(i) - ch.cw / 2, v >= 0 ? base - v / 4 : base, ch.cw, Math.abs(v) / 4, v >= 0 ? C.up : C.dn, { rx: 2 }); });
    b += line(ch.x(3), base - 170 / 4 - 6, ch.x(8), base - 70 / 4 - 6, C.fl, { w: 2 }) + line(40, base, 600, base, C.mu, { op: .6 });
    b += text(40, 206, "DELTA", { size: 11, fill: C.cy, weight: 700, mono: true }) + text(600, 284, "precio ↑ · delta ↓ = compradores sin fuerza", { size: 12, fill: C.fl, anchor: "end" });
    return svg(b, 295, "Divergencia de delta"); })() },
  { caption: "Gestión con buckets: tres buckets seguidos en contra justifican cerrar antes del stop.", svg: (() => {
    let b = title("BUCKETS DE 5 MIN DURANTE UN LARGO");
    const v = [60, 90, 40, 120, 80, 50, 70, 30, -90, -110, -140], base = 160;
    v.forEach((x, i) => { const X = 50 + i * 50; b += rect(X, x >= 0 ? base - x / 1.4 : base, 34, Math.abs(x) / 1.4, x >= 0 ? C.up : C.dn, { rx: 3 }); });
    b += line(40, base, 600, base, C.mu, { op: .6 }) + rect(446, 50, 160, 230, C.dn, { op: .08, stroke: C.dn, rx: 10, dash: "5 4" });
    b += text(526, 270, "3 EN CONTRA → CIERRA", { size: 12, fill: C.dn, anchor: "middle", weight: 700, mono: true });
    b += text(50, 270, "entrada", { size: 12, fill: C.up }) + arrow(70, 254, 70, 200, C.up);
    return svg(b, 290, "Buckets en contra"); })() },
]);

/* ---------- MÓDULO 4 · EJECUCIÓN ---------- */
F.push([
  { caption: "Plantilla del plan diario. Si no cabe en dos frases, no está listo.", svg: (() => {
    let b = title("PLAN DEL DÍA · PLANTILLA");
    [["Instrumento y sesgo", "MNQ · ALCISTA · confianza 65", C.up], ["Zona", "demanda 30.120 – 30.140 (2 confluencias)", C.tx], ["Entrada", "confirmación en 5 min", C.tx], ["Riesgo", "0,5 % por operación · 1,5 % máx. al día", C.fl], ["Eventos", "IPC 14:30 → no operar antes de 14:40", C.dn]].forEach(([k, v, col], i) => {
      const y = 52 + i * 44; b += rect(24, y, 592, 36, C.cy, { op: .05, stroke: C.ln, rx: 8 }) + text(40, y + 23, "☐", { size: 15, fill: C.cy }) + text(66, y + 23, k, { size: 13, fill: C.mu }) + text(600, y + 23, v, { size: 13, fill: col, anchor: "end", weight: 600 });
    });
    return svg(b, 280, "Plan del día"); })() },
  { caption: "Rango de apertura: marca los primeros 15 minutos y opera la ruptura con flujo a favor.", svg: (() => {
    let b = title("RANGO DE APERTURA DE NUEVA YORK");
    const ch = candles([40, 46, 42, 47, 43, 45, 44, 48, 53, 57, 55, 60], { y0: 40, y1: 236, wick: .5 });
    b += rect(ch.x(1) - ch.step / 2, ch.y(48.6), ch.step * 6, ch.y(40.5) - ch.y(48.6), C.vi, { op: .12, stroke: C.vi, rx: 4, dash: "5 4" }) + text(ch.x(1) - ch.step / 2 + 6, ch.y(48.6) - 6, "15:30 – 15:45 · primer rango", { size: 11, fill: C.vi, weight: 600, mono: true });
    b += ch.svg + buy(ch, 8, 47.5, "RUPTURA + 64 % COMPRA") + level(ch, 45.5, C.dn, "STOP dentro del rango") + level(ch, 59, C.up, "objetivo", { at: 44 });
    return svg(b, 290, "Rango de apertura"); })() },
  { caption: "El modelo de entrada: solo hay operación cuando se cumplen las tres condiciones.", svg: (() => {
    let b = title("MODELO DE ENTRADA KAIROS");
    b += circle(240, 140, 86, C.cy, { op: .14, stroke: C.cy }) + circle(400, 140, 86, C.vi, { op: .14, stroke: C.vi }) + circle(320, 222, 86, C.up, { op: .14, stroke: C.up });
    b += text(200, 120, "SESGO", { size: 14, fill: C.cy, anchor: "middle", weight: 700, mono: true }) + text(440, 120, "ZONA", { size: 14, fill: C.vi, anchor: "middle", weight: 700, mono: true }) + text(320, 278, "ORDERFLOW", { size: 14, fill: C.up, anchor: "middle", weight: 700, mono: true });
    b += text(320, 176, "ENTRADA", { size: 15, fill: C.tx, anchor: "middle", weight: 800 });
    b += text(28, 290, "Falta una → no hay operación", { size: 12, fill: C.dn });
    return svg(b, 310, "Modelo de entrada"); })() },
  { caption: "El tamaño se calcula desde el stop: riesgo en euros dividido entre el valor del stop.", svg: (() => {
    let b = title("CÁLCULO DEL TAMAÑO DE POSICIÓN");
    const box = (x, w, top, val, col) => rect(x, 90, w, 100, col, { op: .1, stroke: col, rx: 12 }) + text(x + w / 2, 124, top, { size: 12, anchor: "middle" }) + text(x + w / 2, 164, val, { size: 22, fill: col, anchor: "middle", weight: 800 });
    b += box(24, 170, "Riesgo (0,5 % de 10.000 €)", "50 €", C.fl) + text(212, 150, "÷", { size: 30, fill: C.tx, anchor: "middle" });
    b += box(232, 190, "Stop 20 pts × 2 $ (MNQ)", "40 $", C.dn) + text(440, 150, "=", { size: 30, fill: C.tx, anchor: "middle" });
    b += box(460, 156, "Tamaño", "1 contrato", C.up);
    b += text(320, 236, "Stop de 10 pts → 20 $ por contrato → 2 contratos", { size: 13, fill: C.mu, anchor: "middle" });
    return svg(b, 270, "Tamaño de posición"); })() },
  { caption: "Gestión: parcial en el primer objetivo, stop a break even y el resto hasta el siguiente nivel.", svg: (() => {
    let b = title("GESTIÓN DE LA OPERACIÓN (2 CONTRATOS)");
    const ch = candles([50, 48, 46, 47, 50, 53, 54, 52.5, 55, 58, 61, 60], { y0: 40, y1: 236 });
    b += ch.svg + buy(ch, 2, 46.2) + level(ch, 46.5, C.cy, "entrada → luego BE", { at: 44, below: true }) + level(ch, 43.5, C.dn, "STOP inicial", { at: 44, below: true }) + level(ch, 54, C.up, "TP1 +8 · cierra 1", { at: 44 }) + level(ch, 61, C.up, "TP2 +19 · oferta", { at: 44 });
    b += num(ch.x(6), ch.y(56), 1, C.up) + num(ch.x(10), ch.y(63), 2, C.up);
    return svg(b, 290, "Gestión de la operación"); })() },
  { caption: "La rutina completa: antes, durante, después y revisión semanal.", svg: (() => {
    let b = title("RUTINA DIARIA Y SEMANAL");
    const pts = [["ANTES", "calendario · zonas · plan", 320, 70, C.cy], ["DURANTE", "solo el modelo", 520, 160, C.up], ["DESPUÉS", "diario de cada operación", 320, 250, C.vi], ["VIERNES", "estadísticas por sesión", 120, 160, C.fl]];
    pts.forEach(([t, s, x, y, col]) => { b += rect(x - 92, y - 28, 184, 56, col, { op: .1, stroke: col, rx: 12 }) + text(x, y - 4, t, { size: 13, fill: col, anchor: "middle", weight: 700, mono: true }) + text(x, y + 16, s, { size: 11, anchor: "middle" }); });
    b += arrow(412, 86, 470, 128, C.mu) + arrow(470, 192, 412, 236, C.mu) + arrow(228, 236, 170, 192, C.mu) + arrow(170, 128, 228, 86, C.mu);
    return svg(b, 290, "Rutina"); })() },
]);

module.exports = F;
