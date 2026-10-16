/* Módulo 05 · El Método Kairos MNQ.
   Estrategia de apertura de Nueva York en MNQ con orderflow: zona de desequilibrio, liquidez, imbalances, delta y área de valor.
   Las capturas son operaciones reales del autor (carpeta academia-img) y solo se entregan a compradores del curso. */
const { C, svg, text, rect, line, circle, arrow, pill, candles, zone, level } = require("./svg");

const shot = (file, caption) => ({ caption, src: "/api/academia-img?f=" + file });
const title = s => text(24, 26, s, { size: 12, fill: C.cy, weight: 700, mono: true });
const num = (x, y, n, color = C.cy) => circle(x, y, 11, C.bg, { stroke: color }) + text(x, y + 4, n, { size: 12, fill: color, anchor: "middle", weight: 700 });

/* ---------- Diagramas ---------- */
const FIG_HORARIOS = svg((() => {
  let b = title("APERTURA DE NUEVA YORK · MOMENTOS CLAVE");
  const x = m => 40 + (m - 15 * 60 - 15) / 105 * 560; // de 15:15 a 17:00 (hora de Madrid)
  let path = "M40 230";
  for (let m = 15 * 60 + 15; m <= 17 * 60; m += 3) { const v = 20 + 150 * Math.exp(-((m - 933) * (m - 933)) / 900) + 40 * Math.exp(-((m - 990) * (m - 990)) / 300); path += ` L${x(m).toFixed(1)} ${(230 - v).toFixed(1)}`; }
  b += `<path d="${path} L${x(1020)} 230 Z" fill="url(#kg)" fill-opacity=".28" stroke="${C.cy}" stroke-width="2"/>`;
  b += line(x(930), 50, x(930), 230, C.mu, { dash: "3 4" }) + text(x(930), 46, "15:30 apertura", { size: 11, anchor: "middle" });
  [[933, "15:33"], [945, "15:45"], [960, "16:00"], [975, "16:15"], [1005, "16:45"]].forEach(([m, t], i) => {
    b += line(x(m), 70, x(m), 230, C.up, { w: 2 }) + num(x(m), 84 + (i % 2) * 26, i + 1, C.up) + text(x(m), 254, t, { size: 12, fill: C.up, anchor: "middle", weight: 700, mono: true });
  });
  b += text(320, 284, "Hora de Madrid · en Nueva York son 9:33, 9:45, 10:00, 10:15 y 10:45", { size: 12, anchor: "middle" });
  return b; })(), 300, "Momentos clave de la apertura");

const FIG_FILTROS = svg((() => {
  let b = title("LOS 8 FILTROS · SI FALTA UNO, NO HAY OPERACIÓN");
  const f = ["Horario", "Zona de desequilibrio", "Pico de liquidez", "Imbalances fuertes", "Delta ±3.000 (M5)", "Objetivo 150–200 ticks", "VAL · VAH · nivel máx.", "Mercado en tendencia"];
  f.forEach((s, i) => { const col = i < 4 ? 0 : 1, row = i % 4, x = 24 + col * 300, y = 48 + row * 52;
    b += rect(x, y, 280, 40, C.cy, { op: .07, stroke: C.ln, rx: 10 }) + num(x + 22, y + 20, i + 1) + text(x + 44, y + 25, s, { size: 14, fill: C.tx, weight: 600 }) + text(x + 262, y + 26, "✓", { size: 16, fill: C.up, anchor: "end", weight: 800 }); });
  b += rect(200, 262, 240, 34, C.up, { op: .15, stroke: C.up, rx: 17 }) + text(320, 284, "8/8 → ENTRADA AL CIERRE DE LA VELA", { size: 12, fill: C.up, anchor: "middle", weight: 700, mono: true });
  return b; })(), 310, "Los 8 filtros");

const FIG_HUELLA = svg((() => {
  let b = title("ZONA DE DESEQUILIBRIO EN LA HUELLA (VENTA)");
  b += rect(40, 46, 560, 92, C.vi, { op: .16, stroke: C.vi, rx: 6 }) + text(590, 64, "ZONA DE DESEQUILIBRIO", { size: 11, fill: C.vi, anchor: "end", weight: 700, mono: true });
  const col = (x, rows, hl) => rows.map(([bid, ask], i) => { const y = 60 + i * 15, imb = hl.includes(i);
    return (imb ? rect(x - 4, y - 11, 88, 14, C.dn, { op: .25, rx: 3 }) : "") + text(x + 36, y, `${bid} × ${ask}`, { size: 11, fill: imb ? C.dn : C.tx, anchor: "end", mono: true }) + rect(x + 46, y - 9, Math.min(34, (bid + ask) / 12), 10, C.fl, { op: .45, rx: 1 }); }).join("");
  b += col(120, [[0, 6], [4, 23], [12, 19], [96, 4], [88, 3], [71, 2], [40, 18], [22, 31], [18, 27], [15, 22], [9, 14], [6, 8]], [3, 4, 5]);
  b += col(330, [[2, 9], [80, 0], [65, 0], [47, 3], [30, 25], [24, 18], [19, 23], [15, 11], [12, 9], [8, 6], [5, 2], [3, 1]], [1, 2, 3]);
  b += text(214, 112, "← 3 imbalances", { size: 11, fill: C.dn, weight: 700 }) + text(214, 126, "   apilados (triple)", { size: 11, fill: C.dn });
  b += text(424, 82, "← 80×0 · 65×0", { size: 11, fill: C.dn, weight: 700 });
  b += line(40, 250, 600, 250, C.ln) + text(40, 244, "DELTA M5", { size: 11, fill: C.cy, weight: 700, mono: true });
  [[-410, 120], [-3150, 330]].forEach(([d, x]) => { b += rect(x - 4, 256, 96, 22, d < -3000 ? C.dn : C.ln, { op: d < -3000 ? .9 : .7, rx: 4 }) + text(x + 44, 271, d.toLocaleString("es-ES"), { size: 12, fill: C.tx, anchor: "middle", weight: 700, mono: true }); });
  b += text(470, 271, "≤ −3.000 al cierre → VENTA", { size: 12, fill: C.dn, weight: 700 });
  return b; })(), 290, "Zona de desequilibrio en la huella");

const FIG_VALOR = svg((() => {
  let b = title("ÁREA DE VALOR Y NIVEL MÁXIMO");
  const ch = candles([62, 60, 61, 58, 59, 57, 58, 56, 57, 55, 49, 44, 42, 40], { x0: 160, x1: 600, y0: 40, y1: 250 });
  for (let i = 0; i < 16; i++) { const p = 40 + i * 1.6, v = 20 + 110 * Math.exp(-((p - 58) * (p - 58)) / 14); b += rect(40, ch.y(p) - 5, v, 9, Math.abs(p - 58) < 0.9 ? C.cy : C.mu, { op: Math.abs(p - 58) < 0.9 ? .9 : .35, rx: 2 }); }
  b += ch.svg + level(ch, 62.5, C.vi, "VAH", { x1: 40, x2: 600, at: 44 }) + level(ch, 58, C.cy, "NIVEL MÁXIMO (POC)", { x1: 40, x2: 600, at: 44 }) + level(ch, 54.6, C.fl, "VAL", { x1: 40, x2: 600, at: 44, below: true });
  b += arrow(ch.x(10) + 30, ch.y(52) - 4, ch.x(10) + 6, ch.y(51), C.dn) + text(ch.x(10) + 34, ch.y(52), "rompe VAL con delta −3.000", { size: 11, fill: C.dn, weight: 700 });
  return b; })(), 290, "Área de valor y nivel máximo");

const FIG_EJECUCION = svg((() => {
  let b = title("EJECUCIÓN DE UNA VENTA EN MNQ");
  const ch = candles([60, 61.5, 62.5, 61, 55, 54.5, 52, 50, 47, 46, 44, 41, 40.5], { y0: 40, y1: 240 });
  b += zone(ch, 0, 4, 60.5, 63.5, C.vi) + ch.svg;
  b += level(ch, 64.8, C.dn, "STOP · por encima de la zona y del nivel máximo", { at: 44 }) + level(ch, 55, C.cy, "ENTRADA · cierre de la vela con delta −3.000", { at: 44, below: true }) + level(ch, 42.5, C.up, "OBJETIVO · 200 ticks (50 puntos)", { at: 44, below: true });
  b += num(ch.x(4), ch.y(57) - 30, 1, C.cy) + num(ch.x(11), ch.y(40) + 26, 2, C.up);
  b += text(600, 280, "Riesgo 40 ticks · beneficio 200 ticks · ratio 1:5", { size: 12, fill: C.fl, anchor: "end", weight: 700, mono: true });
  return b; })(), 295, "Ejecución de la operación");

const FIG_CHECKLIST = svg((() => {
  let b = title("CHECKLIST DIARIO · IMPRÍMELO");
  [["15:00", "PASO 1 · Análisis previo", "zonas de desequilibrio, VAL, VAH y nivel máximo en M5", C.cy], ["15:30", "PASO 2 · Esperar la apertura", "ninguna operación antes de Nueva York", C.vi], ["15:33–16:45", "PASO 3 · Condiciones", "los 8 filtros, uno por uno", C.fl], ["Cierre M5", "PASO 4 · Ejecutar", "entrada, stop y objetivo en el mismo momento", C.up], ["Después", "PASO 5 · Registrar", "captura y notas en el diario de Kairos", C.mu]].forEach(([t, h, s, col], i) => {
    const y = 46 + i * 48; b += rect(24, y, 592, 40, col, { op: .07, stroke: C.ln, rx: 10 }) + text(40, y + 25, t, { size: 12, fill: col, weight: 700, mono: true }) + text(160, y + 18, h, { size: 13, fill: C.tx, weight: 700 }) + text(160, y + 33, s, { size: 11 }) + text(598, y + 26, "☐", { size: 17, fill: col, anchor: "end" }); });
  return b; })(), 300, "Checklist diario");

/* ---------- Lecciones ---------- */
module.exports = {
  title: "El Método Kairos MNQ",
  desc: "Apertura de Nueva York con orderflow: desequilibrio, liquidez, imbalances y delta.",
  cover: "img/academia/modulo-5.svg",
  lessons: [
    {
      title: "La estrategia",
      body: "Esta estrategia opera solo MNQ, el micro futuro del Nasdaq 100, y solo durante la apertura de Nueva York, cuando entra el mayor volumen del día y los movimientos son más limpios.\n\nNo buscamos operar todo el día. Nos centramos en cinco momentos concretos tras la apertura: 15:33, 15:45, 16:00, 16:15 y 16:45 (hora de Madrid; en Nueva York son 9:33, 9:45, 10:00, 10:15 y 10:45). Alrededor de esos minutos suelen aparecer los impulsos que marcan la dirección de la sesión.\n\nTrabajamos con el gráfico de 5 minutos para decidir y con la huella (footprint) para confirmar: queremos ver qué lado agrede, con qué fuerza y en qué zona. En MNQ cada tick son 0,25 puntos y vale 0,50 $ por contrato, así que 200 ticks equivalen a 50 puntos o 100 $ por contrato.",
      key: "Menos horas y mejor elegidas: si no estás frente a la pantalla en esos minutos, no hay operación.",
      steps: ["Configura el gráfico de MNQ en 5 minutos y la huella con agrupación de 1 a 2 ticks.", "Anota en tu calendario las cinco horas clave de la apertura.", "Fuera de esa ventana, solo observas y preparas niveles."],
      example: "El día 16/10/2026 el precio de MNQ estaba en torno a 29.800–30.200. Un objetivo de 200 ticks supone 50 puntos: por ejemplo, vender en 29.850 y salir en 29.800.",
      fig: { svg: FIG_HORARIOS, caption: "Los cinco momentos clave tras la apertura de Nueva York, en hora de Madrid." },
      shots: [],
    },
    {
      title: "Visión general: los 8 filtros",
      body: "Antes de cada operación pasamos ocho filtros, siempre en el mismo orden. Si uno falla, no entramos.\n\n1. Horario: ¿estamos en uno de los cinco momentos clave?\n2. Zona de desequilibrio: ¿el precio ha llegado a una zona donde antes hubo un movimiento fuerte que dejó un hueco entre compradores y vendedores?\n3. Pico de liquidez: ¿ha habido un movimiento brusco hacia la zona que pone a prueba ese nivel?\n4. Imbalances fuertes: ¿hay desequilibrios claros dentro de la zona, idealmente tres o más apilados?\n5. Delta: ¿la vela de 5 minutos ha cerrado con un delta de +3.000 o más (compras) o de −3.000 o menos (ventas)?\n6. Objetivo: ¿hay recorrido libre de 150 a 200 ticks hasta la siguiente zona importante?\n7. Área de valor: ¿el precio rompe VAL, VAH o el nivel máximo con ese delta fuerte?\n8. Tendencia: ¿el mercado tiene dirección o está en rango?",
      key: "La lista no se negocia: 8 de 8 o no se opera.",
      steps: ["Imprime los 8 filtros y tenlos al lado de la pantalla.", "Márcalos en orden; no saltes al delta sin haber validado la zona.", "Apunta en el diario qué filtro falló en cada operación que no hiciste."],
      example: "Son las 16:00 y el precio llega a una zona de desequilibrio con un triple imbalance, pero la vela cierra con un delta de −1.200. Fallan los filtros 5 y 7: no hay venta, aunque el resto se cumpla.",
      fig: { svg: FIG_FILTROS, caption: "Los ocho filtros de la estrategia." },
      shots: [],
    },
    {
      title: "Condiciones de entrada",
      body: "Zona de desequilibrio. Es la zona desde la que el precio salió con fuerza y en la que quedaron muchas órdenes sin casar. Cuando el precio vuelve a ella, suele reaccionar o romperla con fuerza.\n\nPico de liquidez. Antes del movimiento bueno, MNQ suele dar un latigazo dentro de la zona que barre stops. No es obligatorio, pero cuando aparece, la operación gana calidad.\n\nImbalances. En la huella, un imbalance es un nivel donde un lado domina claramente al otro (por ejemplo 80 × 0 o 65 × 0). Buscamos al menos uno fuerte dentro de la zona; tres o más apilados son una señal muy clara.\n\nDelta. Es la confirmación principal. Esperamos al cierre de la vela de 5 minutos y medimos su delta: +3.000 o más para comprar, −3.000 o menos para vender. Sin ese delta no hay entrada.",
      key: "La zona te dice dónde; los imbalances y el delta te dicen si de verdad hay alguien detrás.",
      steps: ["Marca la zona de desequilibrio antes de la apertura.", "Cuando el precio entre, busca imbalances de un solo lado en la huella.", "Espera al cierre de la vela de 5 minutos y comprueba que el delta supera ±3.000."],
      example: "En tu captura de las 09:12–09:27 se ven columnas con niveles muy descompensados dentro de la zona, y la fila de delta superior alterna valores de +373 y −334. Con ese delta todavía no hay entrada: falta el impulso de ±3.000 que confirma.",
      fig: { svg: FIG_HUELLA, caption: "Imbalances apilados dentro de la zona y delta de −3.150 al cierre: señal de venta." },
      shots: [shot("mnq-huella-zona.png", "Operación real · MNQ 16/10/2026 · huella con zona marcada, imbalances y perfil de volumen a la derecha (nivel de máximo volumen resaltado en 30.190).")],
    },
    {
      title: "VAL, VAH y el nivel máximo",
      body: "El área de valor es la franja de precios donde se negoció la mayor parte del volumen. Su borde superior es el VAH, el inferior es el VAL y el precio con más volumen es el nivel máximo (POC).\n\nRegla principal: el precio tiene que haber superado el nivel máximo antes de entrar. Si el nivel máximo está demasiado cerca en la dirección de tu operación, todavía no entras: espera.\n\nCuando el precio rompe VAL o VAH con un delta fuerte (±3.000 o más), lo normal es que esas zonas no aguanten y que el movimiento continúe. Si ya has tenido un delta de −3.000 saliendo de una zona de desequilibrio sólida y el VAL está cerca, ese VAL suele romperse.",
      key: "Ruptura de VAL o VAH con delta fuerte = el mercado acepta precios nuevos.",
      steps: ["Dibuja VAL, VAH y el nivel máximo de la sesión anterior y de la actual.", "No entres si el nivel máximo bloquea el camino hacia tu objetivo.", "Prioriza las entradas en las que el precio rompe VAL o VAH con delta de ±3.000."],
      example: "En tu captura de las 15:48–16:24 la fila de delta marca −2.490, −2.155 y −2.285 en velas de 3 minutos, y el nivel 29.800 queda resaltado. Solo las dos primeras velas de 3 minutos suman −4.645: la presión vendedora tenía de sobra el tamaño que pide la estrategia.",
      fig: { svg: FIG_VALOR, caption: "Ruptura del VAL con delta fuerte tras pasar el nivel máximo." },
      shots: [shot("mnq-huella-nivel.png", "Operación real · MNQ 16/10/2026 (M3, Bid × Ask) · deltas vendedores de más de −2.000 y nivel 29.800 resaltado."), shot("mnq-delta-cierre.png", "Delta de las velas siguientes (16:30–16:50): 719 y después −749 y −676. El flujo cambia de lado.")],
    },
    {
      title: "Ejecución y gestión",
      body: "Entrada. Solo cuando se cumplen los 8 filtros y siempre después del cierre de la vela de 5 minutos con el delta confirmado. Nunca dentro de la vela.\n\nObjetivo. En una sesión con tendencia, MNQ suele recorrer entre 200 y 500 ticks en una dirección. Como referencia, el objetivo va a 150–200 ticks (40–50 puntos), y se acorta si hay una zona importante antes.\n\nStop. Por encima del nivel máximo o de la zona de desequilibrio en las ventas, y por debajo en las compras. El ratio riesgo-beneficio tiene que ser como mínimo 1:1; mejor si es 1:2 o más.\n\nCuándo no operar. En semanas de NFP (nóminas no agrícolas) o con noticias fuertes, cuando el mercado está en rango y nunca contra la tendencia del día.",
      key: "Si pierdes una operación, la siguiente buena tiene que poder recuperarla: cuida el ratio.",
      steps: ["Coloca entrada, stop y objetivo en la misma orden (OCO) al cierre de la vela.", "Si aparecen imbalances pequeños antes del objetivo, no cierres por nervios: el delta ya marcó la dirección.", "Si el precio vuelve a la zona y el delta se gira con fuerza en contra, sal sin esperar al stop."],
      example: "Venta en 29.850 tras una vela de 5 minutos con delta −3.200. Stop en 29.860, por encima del nivel máximo (40 ticks, 20 $ por contrato). Objetivo en 29.800 (200 ticks, 100 $ por contrato). Ratio 1:5.",
      fig: { svg: FIG_EJECUCION, caption: "Entrada al cierre con delta, stop por encima de la zona y objetivo de 200 ticks." },
      shots: [],
    },
    {
      title: "La lista de verificación",
      body: "Paso 1 · Análisis antes de la apertura (15:00, hora de Madrid). Marca en el gráfico de 5 minutos todos los niveles clave: zonas con imbalances grandes (como 90 × 0, 65 × 0 o incluso 76 × 9), zonas de salida fuerte con delta alto y el área de valor con su nivel máximo.\n\nPaso 2 · Espera a la apertura de Nueva York. Ninguna operación antes de las 15:30. Con los niveles ya dibujados sabrás qué zonas vigilar; si el precio ya está cerca de una, ten paciencia.\n\nPaso 3 · Condiciones. Repasa los 8 filtros en orden: horario, zona, liquidez, imbalances, delta, objetivo, área de valor y tendencia.\n\nPaso 4 · Ejecución. Entrada al cierre de la vela, stop y objetivo puestos a la vez.\n\nPaso 5 · Registro. Guarda la captura de la operación y anota en el diario qué filtros se cumplían.",
      key: "Si falta alguna condición, no realices la operación.",
      steps: ["Haz el análisis previo todos los días a la misma hora.", "Ten la lista impresa al lado del teclado.", "Revisa cada viernes tus capturas: ¿qué filtro fallaba en las operaciones perdedoras?"],
      example: "Un martes a las 15:00 marcas una zona de desequilibrio en 30.180–30.199 y el nivel máximo en 30.190. A las 15:45 el precio entra en la zona, hay un triple imbalance vendedor y la vela de 5 minutos cierra con −3.400 por debajo del nivel máximo: se cumplen los 8 filtros y ejecutas la venta.",
      fig: { svg: FIG_CHECKLIST, caption: "La rutina completa del día en cinco pasos." },
      shots: [],
    },
    {
      title: "Palabras finales",
      body: "Esta estrategia funciona porque es simple y repetible: pocas horas, una lista de condiciones y una forma fija de entrar y salir. Lo difícil no es entenderla, es respetarla cada día.\n\nHabrá días sin operación, y eso también es seguir el plan. Habrá operaciones perdedoras aunque se cumplan todos los filtros: ninguna estrategia acierta siempre, y por eso el stop y el ratio importan tanto como la entrada.\n\nTrata cada operación como un dato. Registra, revisa y ajusta con tus propias estadísticas. La constancia es lo que convierte una buena estrategia en resultados.\n\nNos vemos en el Discord de Kairos. — Equipo Kairos",
      key: "Disciplina antes que frecuencia: el plan es la ventaja.",
      steps: ["Opera en demo o con el tamaño mínimo las primeras 20 operaciones.", "Mide tu tasa de acierto y tu ratio medio con el diario de Kairos.", "Comparte tus capturas en el canal de la comunidad para revisarlas juntos."],
      example: "Tras 20 operaciones con la lista, el diario muestra 12 ganadoras con +180 ticks de media y 8 perdedoras con −45 ticks de media. Con un ratio así, el sistema gana aunque falle 4 de cada 10.",
      fig: null,
      shots: [],
    },
  ],
};
