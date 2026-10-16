/* Módulo 06 · Operaciones reales. Casos del autor con capturas de su plataforma (carpeta academia-img).
   Cada captura lleva una descripción narrativa de lo que se ve en ella. Solo se entregan a compradores del curso. */

const shot = (file, caption) => ({ caption, src: "/api/academia-img?f=" + file });
const AVISO = "Operación real del autor. Los resultados pasados no garantizan resultados futuros.";
const caso = c => ({ stepsLabel: "Qué mirar en la captura", exampleLabel: "Resultado", fig: null, video: "", disclaimer: AVISO, ...c });

module.exports = {
  title: "Operaciones reales",
  desc: "Casos reales del autor con capturas de su plataforma: qué vio y cómo lo leyó.",
  cover: "img/academia/modulo-6.svg",
  lessons: [
    caso({
      title: "28/04 · MNQ · El delta extremo que no continúa",
      body: "A las 13:40 se imprimió una vela con un delta de +5.104 y más de 36.000 contratos, la más agresiva de la sesión. La siguiente vela subió hasta 19.625, pero se giró enseguida y dejó una cola de niveles vendedores sin contrapartida.\n\nCuando un delta tan grande no consigue continuidad, los compradores que entraron tarde quedan atrapados. Las dos velas siguientes cerraron con −1.435 y −1.552 y el precio volvió por debajo de 19.590.",
      key: "Un delta enorme sin continuación suele marcar agotamiento, no fuerza.",
      steps: ["La vela de las 13:40: delta +5.104 y volumen muy por encima del resto.", "La vela de las 13:45: sube a 19.625 y cierra lejos del máximo.", "Las velas de −1.435 y −1.552 que confirman el giro."],
      example: "Tras el agotamiento, el precio pasó de 19.625 a cerrar la vela de las 13:55 en 19.511, más de 100 puntos por debajo del máximo.",
      shots: [
        shot("caso3-mnq-28abr-delta.png", "Huella de 5 minutos. La columna verde de las 13:40 es la vela de +5.104. La de las 13:45 llega a 19.625 pero se gira: en su parte baja aparecen niveles como 45 × 0 o 43 × 0, donde solo hubo ventas. Las siguientes velas, ya rojas, cierran por debajo de la línea de 19.590."),
      ],
    }),
  ],
};
