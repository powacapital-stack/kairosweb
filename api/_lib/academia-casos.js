/* Módulo 06 · Operaciones reales. Casos del autor con capturas de su plataforma (carpeta academia-img).
   Cada captura lleva una descripción narrativa de lo que se ve en ella. Solo se entregan a compradores del curso. */

const shot = (file, caption) => ({ caption, src: "/api/academia-img?f=" + file });
const AVISO = "Operación real del autor. Los resultados pasados no garantizan resultados futuros.";
const caso = c => ({ stepsLabel: "Qué mirar en la captura", exampleLabel: "Resultado", fig: null, video: "", disclaimer: AVISO, ...c });

module.exports = {
  title: "Operaciones reales",
  desc: "Casos reales del autor con capturas de su plataforma: qué vio, cuándo entró y cuándo no.",
  cover: "img/academia/modulo-6.svg",
  lessons: [
    caso({
      title: "14/04 · MNQ · Liquidez en los máximos de Londres",
      body: "Durante la mañana se formaron dos zonas de imbalances en 19.175,50 y 19.182,50, que marcaron los máximos de la sesión de Londres. Por la tarde el precio superó esos máximos varias veces, barrió la liquidez que había por encima y no consiguió mantenerse.\n\nEl giro se confirmó con varias velas de delta vendedor muy fuerte (−3.127, −2.018 y −2.380). A partir de ahí el mercado cayó con decisión hasta la zona de 18.850.",
      key: "Un máximo que se supera y se pierde enseguida es liquidez tomada, no una ruptura.",
      steps: ["Las dos zonas moradas de la mañana: son el origen de los máximos de Londres.", "Las barridas por encima de 19.182,50 que no se sostienen.", "La fila de delta: varias velas de más de −2.000 seguidas confirman el giro."],
      example: "Desde los máximos de Londres (≈19.182) el precio bajó hasta la zona de 18.850: más de 300 puntos de recorrido.",
      shots: [
        shot("caso1-mnq-14abr-dia.png", "Visión del día completo. El precio sube tres veces por encima de los máximos de Londres (19.175–19.182) y en el tercer intento se gira. Después pierde el vPOC y el soporte de 19.028 y cae con fuerza hasta 18.850, donde marca el mínimo de la sesión."),
        shot("caso1-mnq-14abr-maximos.webp", "Arriba, a primera hora: dos columnas con imbalances compradores dejan marcadas las zonas de 19.175,50 y 19.182,50, los máximos de Londres. Abajo, por la tarde: llegan velas rojas con deltas de −3.127, −2.018 y −2.380 y el precio se desploma de 18.990 a 18.840."),
        shot("caso1-mnq-14abr-liquidez.webp", "Arriba: una vela compradora muy amplia sube hasta la zona de imbalances superior y la siguiente se gira con −1.581 y −1.957 de delta. Abajo: el gráfico del día muestra las dos tomas de liquidez sobre los máximos de Londres y el «rollover» posterior, un cambio a delta vendedor de unos 3.000 que arrastra el precio hacia abajo."),
      ],
    }),
    caso({
      title: "25/04 · NQ · Venta en el máximo del impulso",
      body: "Tras una subida limpia de casi una hora, el precio marcó un máximo en 19.555 y la vela siguiente lo rechazó con fuerza. En el rebote posterior ya no pudo recuperar la zona de 19.538–19.544.\n\nLa venta se planteó en 19.526, con el stop por encima de esa zona y el objetivo en el soporte de 19.469, donde se habían acumulado compras antes de la subida.",
      key: "Después de un impulso largo, el primer rechazo fuerte en el máximo avisa; el rebote que no recupera el nivel es la entrada.",
      steps: ["El máximo de 19.555 y la vela roja que lo rechaza.", "El rebote que se queda por debajo de las líneas azules (19.538–19.544).", "La caja roja (riesgo) frente a la verde (beneficio): el ratio es de más de 1:3."],
      example: "Entrada 19.526 · stop 19.544 (18 puntos) · objetivo 19.469 (57 puntos). La vela vendedora de las 19:38 alcanza el objetivo y el precio llega a 19.458.",
      shots: [
        shot("caso2-nq-25abr-grafico.webp", "Gráfico de 1 minuto. El precio sube de forma ordenada desde 19.420 hasta el máximo de 19.555. La primera vela roja lo rechaza, el rebote se queda corto y se abre la venta: la caja roja marca el riesgo hasta 19.544 y la verde el objetivo en 19.469, que se alcanza con una sola vela vendedora."),
        shot("caso2-nq-25abr-huella.webp", "La misma operación en la huella. En el máximo aparecen niveles vendedores dominantes. Mientras el precio lateraliza bajo la zona, el delta se mantiene débil y, en la vela de las 19:38, el volumen se dispara (4.367 contratos) con −493 de delta y el precio cae directo al objetivo."),
      ],
    }),
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
    caso({
      title: "30/04 · MNQ · Recuperación nivel a nivel",
      body: "A mediodía el precio cayó más de 300 puntos, hasta la zona de 19.180. Desde ese mínimo empezó a recuperar, uno a uno, los niveles de imbalances marcados en el análisis previo: 19.263, 19.285, el área de valor en 19.307 y 19.355.\n\nLa entrada en compra llegó después de recuperar el área de valor, y el precio continuó hasta volver al nivel máximo de 19.505.",
      key: "Los niveles marcados antes de la sesión son el mapa: sirven tanto para entrar como para saber hasta dónde puede llegar el precio.",
      steps: ["Los niveles horizontales con su tamaño de imbalance (x25, x43, 23x 28x…).", "La compra marcada cerca de 19.340, justo tras recuperar el área de valor (19.307).", "Cómo cada nivel recuperado sirve de soporte en los retrocesos."],
      example: "Del mínimo de 19.180 al nivel máximo de 19.505: más de 300 puntos de recuperación en la tarde.",
      shots: [
        shot("caso4-mnq-30abr-niveles.png", "Gráfico del día con el perfil de volumen. Tras la caída de mediodía hasta 19.180, el precio rebota y va superando los niveles marcados: 19.263, 19.285, el área de valor de 19.307 y 19.355. La flecha azul señala la compra. Por la tarde el precio vuelve al nivel máximo de 19.505."),
      ],
    }),
    caso({
      title: "06/05 · MNQ · Apertura de Londres (09:00)",
      body: "Antes de la apertura de Londres el precio llegó a una zona de imbalances en 19.962–19.977 y dejó nuevos imbalances vendedores justo en lo alto. Con la apertura llegó el cambio de delta (−465) y el precio rompió hacia abajo el nivel máximo de 19.955.\n\nLa venta se hizo tras ese cambio de delta y la ruptura del nivel máximo. El delta siguió negativo en las velas siguientes (−514, −531) y la operación llegó al objetivo de 150 ticks.",
      key: "La misma lógica funciona en la apertura de Londres: zona, imbalances, cambio de delta y ruptura del nivel máximo.",
      steps: ["La zona morada de arriba y los imbalances en su parte alta.", "La línea gris del nivel máximo (19.955) y su ruptura.", "La fila de delta: −465 en la apertura y continuación con −514 y −531."],
      example: "Venta en torno a 19.941 y objetivo en 19.903,75: 150 ticks (37,5 puntos).",
      shots: [
        shot("caso8-mnq-6jun-londres.webp", "Huella de 5 minutos de MNQ en la apertura de Londres. Arriba, la zona de imbalances con niveles vendedores dominantes en su techo. A las 08:00–08:05 el delta cambia a −465 y el precio rompe el nivel máximo de 19.955; la flecha marca la entrada. Las velas siguientes mantienen el delta negativo y el precio cae hasta el objetivo de 150 ticks en 19.903,75."),
      ],
    }),
    caso({
      title: "07/05 · MGC · Micro oro: ruptura del nivel máximo",
      body: "El micro oro pasó horas dentro de una zona de imbalances entre 3.400 y 3.403. Hizo un último barrido por encima, hasta 3.406, y volvió a caer dentro de la zona.\n\nLa entrada llegó cuando el precio rompió el nivel máximo de 3.400 y el delta cambió a negativo. Las velas siguientes confirmaron con deltas de −219, −221 y −213 y el precio alcanzó el objetivo en la zona de 3.391.",
      key: "La estrategia no es exclusiva del Nasdaq: la misma lectura funciona en el oro.",
      steps: ["La zona morada (IMB Level) entre 3.400 y 3.403.", "El barrido hasta 3.406 que no se sostiene.", "La ruptura del nivel máximo de 3.400 y el cambio a delta negativo."],
      example: "Venta tras perder 3.400 (en torno a 3.398) y objetivo alcanzado cerca de 3.391.",
      shots: [
        shot("caso5-mgc-7may.webp", "Huella del micro oro. El precio lateraliza dentro de la zona de imbalances (3.400–3.403) y hace un último barrido hasta 3.406. Al perder el nivel máximo de 3.400 con delta negativo llega la entrada en venta. Las flechas inferiores marcan los deltas de −219, −221 y −213 y la flecha «TP», el objetivo en 3.391."),
      ],
    }),
    caso({
      title: "09/05 · MNQ · Nivel fresco lleno de imbalances",
      body: "Por la mañana quedó un nivel nuevo, cargado de imbalances, entre 20.200 y 20.290. A primera hora de la tarde el precio subió hasta él. Los compradores lo intentaron entre las 13:45 y las 13:55 (+1.231 y +2.504), pero no consiguieron superarlo.\n\nA partir de las 14:00 el delta se dio la vuelta y se mantuvo negativo vela tras vela, con un pico de −3.684. Es el «rollover» del delta: los compradores se rinden y el mercado cae por debajo de 20.170.",
      key: "Cuando el delta positivo se apaga en un nivel fresco y pasa a negativo de forma continuada, el giro está confirmado.",
      steps: ["El recuadro azul grande: el nivel fresco con imbalances (20.200–20.290).", "El recuadro verde de la fila de delta: el intento comprador.", "El recuadro rojo: deltas negativos seguidos, con −3.684 a las 14:15."],
      example: "Desde el techo del nivel (≈20.275) el precio cayó por debajo de 20.170: unos 100 puntos.",
      shots: [
        shot("caso6-mnq-9may-nivel.png", "Visión general. El recuadro azul marca un nivel fresco lleno de imbalances, con su máximo en 20.290. El precio sube hasta él entre las 12:45 y las 14:00, lo intenta varias veces sin superar 20.275 y, en la última media hora, cae con fuerza por debajo de 20.170."),
        shot("caso6-mnq-9may-huella.png", "La huella del mismo tramo. En verde, de 13:45 a 13:55, el último intento comprador (+1.231 y +2.504). En rojo, de 14:00 a 14:25, el delta pasa a negativo vela tras vela, con −1.060, −3.684 y −1.448. Las flechas rojas marcan cómo cada vela hace un mínimo más bajo."),
        shot("caso6-mnq-9may-rollover.png", "Detalle del «rollover delta». El recuadro azul es la zona donde se concentró el volumen vendedor en 20.195–20.200. Las flechas azules muestran la caída hasta 20.150 mientras la fila de delta cambia del bloque verde al bloque rojo."),
      ],
    }),
    caso({
      title: "MNQ · Liquidación y giro",
      body: "Una sola vela vendedora de −1.811 de delta y más de 27.000 contratos atravesó las dos zonas marcadas y llegó hasta un mínimo nuevo. Allí la presión vendedora se agotó: en la parte baja de la vela apenas hay operaciones.\n\nLas velas siguientes giraron con fuerza a delta comprador (+1.897, +2.508 y +1.020). Es una liquidación seguida de rollover: el mercado barre los stops de abajo y se da la vuelta.",
      key: "No persigas una vela de liquidación: espera a ver si el delta se gira en el mínimo.",
      steps: ["La vela roja larga que atraviesa las dos zonas azules.", "El círculo del mínimo: niveles con muy poco volumen, señal de agotamiento.", "La fila de delta: −1.811 y, justo después, +1.897 y +2.508."],
      example: "Quien vendió tarde en esa vela quedó atrapado en el mínimo; el giro alcista ofreció la oportunidad contraria.",
      shots: [
        shot("caso7-mnq-liquidacion.png", "Huella de 3 minutos. La vela roja central cae desde la zona superior, atraviesa la inferior y termina en el círculo, donde los niveles casi no tienen volumen: la venta se ha agotado. Debajo, la fila de delta pasa de −1.811 a +1.897, +2.508 y +1.020 en las velas siguientes."),
      ],
    }),
    caso({
      title: "MNQ · Cuándo NO entrar y cómo esperar la buena",
      body: "La apertura empezó con compras. Después llegó una vela muy agresiva a la baja, con un delta de −4.686. No hubo entrada: un delta tan extremo, justo después de comprar, puede ser una trampa (fakeout). La siguiente vela con delta negativo grande tampoco cumplía todos los criterios.\n\nEl precio se giró al alza, rompió los niveles de imbalances y volvió a probarlos: la oferta se convirtió en demanda. El delta pasó de negativo a +2.656, el precio hizo un retesteo al nivel máximo y ahí llegó la entrada en compra.",
      key: "Las operaciones que no haces también son parte de la estrategia: un delta extremo sin contexto es motivo para esperar.",
      steps: ["El bloque rojo (−4.686, −1.690, −2.248): ventas agresivas, pero sin entrada.", "El bloque verde «In to buying»: el mercado gira y rompe los niveles.", "«Test» y «Again buying»: retesteo del nivel y delta de +2.656, la entrada."],
      example: "La paciencia evitó una venta en plena trampa y permitió comprar a favor del giro tras la confirmación.",
      shots: [
        shot("caso9-mnq-sin-entrada.png", "Huella con las notas del autor. A la izquierda, tras la apertura compradora, la vela de −4.686 de delta; las notas explican por qué no se entró. En el centro, el bloque verde muestra el giro comprador y la ruptura de los niveles. El recuadro «Test» marca el retesteo con −219 y −961, y «Again buying», el delta de +2.656 que da la entrada."),
      ],
    }),
  ],
};
