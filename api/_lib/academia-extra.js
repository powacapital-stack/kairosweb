/* Ampliación de cada lección del curso: pasos para aplicarla, un ejemplo práctico y, si existe, un vídeo.
   El orden sigue al de academia-content.js (módulo → lección).
   video: enlace de inserción de YouTube (no listado) o Vimeo, p. ej. "https://www.youtube-nocookie.com/embed/ID". Vacío = sin vídeo. */
module.exports = [
  // MÓDULO 1 · LA SALA DE MANDO
  [
    { steps: ["Abre la Sala de Mando 15 minutos antes de la sesión que vas a operar.", "Lee en este orden: sesgo, confianza, flujo, niveles y briefing.", "Anota en una frase qué buscarías hoy y qué te haría no operar."],
      example: "Son las 15:10. MNQ marca sesgo alcista con confianza 68, el 61 % del volumen es comprador y la demanda más cercana está 40 puntos por debajo. Tu frase del día: «Compro retrocesos a demanda si el delta aguanta positivo; si la confianza baja de 35, no opero»." },
    { steps: ["Mira primero la confianza: por debajo de 35 el sesgo es solo orientativo.", "Entre 35 y 60, opera a favor del sesgo con la mitad del tamaño.", "Por encima de 60, el sesgo tiene respaldo suficiente para tu tamaño normal."],
      example: "El oro marca sesgo bajista con confianza 22. Aunque el precio baje, la lectura es débil: no buscas ventas agresivas, esperas. Una hora después la confianza sube a 64 con el flujo vendedor al 58 %: ahora sí buscas ventas en oferta." },
    { steps: ["Compara la dirección del precio con el reparto de compra y venta.", "Si el precio sube con más volumen vendedor, desconfía de la subida.", "Busca tarjetas en las que el precio y el flujo vayan en la misma dirección."],
      example: "MES sube un 0,4 % pero la barra muestra un 44 % de compra. Es una subida sin respaldo: probablemente cortos cerrando posiciones. Mejor no perseguirla y esperar a que el flujo confirme." },
    { steps: ["Lee primero la línea de riesgo del briefing.", "Localiza la oferta y la demanda más cercanas que menciona.", "Decide la acción con la recomendación: buscar compras, buscar ventas o esperar."],
      example: "El briefing de las 16:05 dice: sesgo alcista, demanda en 30.120 y riesgo por el dato de vivienda a las 16:00 ya publicado. La recomendación es «buscar compras». Colocas una alerta en 30.125 y esperas a que el precio llegue." },
    { steps: ["Revisa cada mañana los eventos de alto impacto del día.", "No abras operaciones 5 minutos antes de un dato importante.", "Si ya estás dentro, reduce tamaño o asegura parte del beneficio antes del dato."],
      example: "El IPC de EE. UU. sale a las 14:30 (hora de Madrid). A las 14:20 tienes un largo en MNQ con 25 puntos a favor: cierras la mitad y subes el stop a break even. El dato mueve el índice 80 puntos en un minuto y tu riesgo ya estaba controlado." },
    { steps: ["Opera índices americanos sobre todo entre las 15:30 y las 18:00 (hora de Madrid).", "Usa la mañana europea para preparar zonas, no para forzar entradas.", "Marca el máximo y el mínimo de los primeros 30 minutos de Nueva York."],
      example: "Entre las 15:30 y las 16:00 MNQ forma un rango de 60 puntos. Rompe por arriba a las 16:10 con el flujo comprador al 63 %: es la ruptura con volumen que querías ver, no un movimiento de la sesión asiática con poca liquidez." },
  ],
  // MÓDULO 2 · OFERTA Y DEMANDA
  [
    { steps: ["Marca la zona desde el inicio de la base hasta el final de la última vela antes del impulso.", "Usa rectángulos, no líneas.", "Borra las zonas que el precio ya ha atravesado con claridad."],
      example: "En el gráfico de 1H de MNQ ves tres velas pequeñas entre 29.980 y 30.010 y después una subida de 150 puntos. Esa franja de 30 puntos es tu zona de demanda." },
    { steps: ["Busca una base de 1 a 4 velas pequeñas.", "Exige una salida amplia y rápida: al menos tres veces el tamaño de la base.", "Da prioridad a las zonas que aún no se han vuelto a tocar."],
      example: "Una base de 2 velas en el oro, entre 4.195 y 4.198 dólares, va seguida de una vela de 14 dólares. La salida es casi cinco veces la base: la zona es válida y está sin tocar." },
    { steps: ["Mide la reacción media de las últimas 10 zonas en cada instrumento.", "Fija objetivos realistas según ese recorrido.", "No apliques al oro las distancias del Nasdaq ni al revés."],
      example: "Tus últimas 10 reacciones en MNQ desde zonas de 1H promedian 45 puntos. Pones el primer objetivo a 35 puntos y dejas el resto con stop en break even: tu objetivo está dentro de lo que el mercado suele dar." },
    { steps: ["Anota las confluencias de cada zona: VWAP, máximo o mínimo del día anterior y número redondo.", "Puntúa la zona según cuántas tiene.", "Opera solo zonas con dos o más."],
      example: "La demanda de MES en 7.780 coincide con el mínimo del día anterior (7.782) y con el número redondo 7.780. Son dos confluencias: zona operable. La demanda de 7.750 no tiene ninguna: la descartas." },
    { steps: ["Elige un método de entrada y úsalo siempre igual durante 20 operaciones.", "Con orden límite, entra en el borde de la zona.", "Con confirmación, espera a una vela de rechazo cerrada en 5 minutos."],
      example: "Zona de demanda en EUR/USD entre 1,1240 y 1,1250. Método de confirmación: el precio entra en la zona, deja una mecha inferior larga y cierra en 1,1256. Entras al cierre con el stop en 1,1236, por debajo de la zona." },
    { steps: ["Antes de cada operación, comprueba que la zona va a favor del sesgo.", "Si va en contra, trátala como posible ruptura, no como entrada.", "Registra en el diario las operaciones contra el sesgo para medir su resultado."],
      example: "Sesgo bajista en GBP/USD con confianza 70. El precio llega a una demanda en 1,3290 y la atraviesa sin reaccionar. No compraste: la zona iba contra el sesgo y era candidata a romperse." },
  ],
  // MÓDULO 3 · ORDERFLOW
  [
    { steps: ["Observa el flujo solo en los niveles que ya has marcado.", "Pregúntate quién agrede: compradores o vendedores a mercado.", "Usa el orderflow para confirmar entradas, no para encontrarlas."],
      example: "El precio llega a tu demanda en MNQ y el flujo pasa del 45 % al 60 % comprador en dos minutos. Alguien empieza a comprar a mercado justo en tu zona: es la confirmación que buscabas." },
    { steps: ["Mira el delta de cada vela o bucket, no solo el acumulado.", "Fíjate en si el delta crece o se agota en la dirección del movimiento.", "Desconfía de los movimientos con delta plano."],
      example: "Tres buckets seguidos de +120, +80 y +30 mientras el precio sigue subiendo: los compradores pierden fuerza. No es momento de comprar más arriba, sino de esperar un retroceso." },
    { steps: ["Por encima del 55 %, la presión compradora es clara.", "Por debajo del 45 %, la presión vendedora es clara.", "Entre ambas, reduce tamaño o espera."],
      example: "El oro oscila entre el 48 % y el 52 % de compra durante una hora. El mercado no tiene dueño: no hay operación hasta que el reparto salga de esa franja." },
    { steps: ["Localiza el precio con más volumen del perfil (POC).", "Vigila si llega mucho volumen agresivo a una zona sin que el precio avance.", "Entra cuando la absorción termina y el precio se gira."],
      example: "En la demanda de MES entran 900 contratos vendedores en dos minutos y el precio no baja ni un tick. Después el flujo gira a comprador: las ventas fueron absorbidas y entras largo con el stop bajo la zona." },
    { steps: ["Compara cada nuevo máximo o mínimo del precio con el delta.", "Si el precio hace un extremo nuevo y el delta no, marca la divergencia.", "Opera la divergencia solo si coincide con una zona."],
      example: "MNQ marca un nuevo máximo en 30.240, pero el delta del impulso es la mitad que el del máximo anterior. Además estás en una oferta de 1H. Divergencia más zona: buscas una venta con confirmación en 5 minutos." },
    { steps: ["Revisa los últimos 3 buckets del briefing mientras estás dentro.", "Si dos van en contra, ajusta el stop o reduce tamaño.", "Si tres van en contra, cierra aunque no haya saltado el stop."],
      example: "Largo en MNQ con 12 puntos a favor. Llegan tres buckets de −90, −110 y −140. Cierras en +4 puntos en vez de esperar al stop de −20: el flujo ya había cambiado de manos." },
  ],
  // MÓDULO 4 · EJECUCIÓN
  [
    { steps: ["Escribe el plan del día con zonas, sesgo y eventos.", "Define tu riesgo máximo del día antes de abrir la plataforma.", "Si el plan no cabe en dos frases, simplifícalo."],
      example: "Plan: «MNQ alcista con confianza 65. Compro en la demanda 30.120–30.140 con confirmación en 5 min. Riesgo 0,5 % por operación y máximo 1,5 % al día. IPC a las 14:30: no opero antes de las 14:40»." },
    { steps: ["Espera 5 a 15 minutos después de las 15:30.", "Marca el máximo y el mínimo del primer rango.", "Opera la ruptura o el rechazo del rango con el flujo a favor."],
      example: "El primer rango de 15 minutos va de 30.150 a 30.210. A las 15:52 el precio rompe 30.210 con el 64 % de compra y el delta creciendo: entras largo con el stop en 30.185, dentro del rango." },
    { steps: ["Comprueba las tres condiciones: sesgo, zona con confluencia y orderflow.", "Si falta una, no hay operación.", "Apunta en el diario qué condición faltaba en las operaciones que no hiciste."],
      example: "Sesgo alcista y demanda con dos confluencias, pero el flujo marca un 41 % comprador al llegar a la zona. Falta la tercera condición: no entras. El precio rompe la zona 15 minutos después." },
    { steps: ["Decide el riesgo en euros: por ejemplo, el 0,5 % de la cuenta.", "Mide la distancia hasta el stop en puntos.", "Divide el riesgo entre el valor de esa distancia para obtener el tamaño."],
      example: "Cuenta de 10.000 €: riesgo de 50 € por operación. Stop a 20 puntos en MNQ, donde cada punto vale 2 $ por contrato: 40 $ por contrato. Operas 1 contrato. Si el stop fuera de 10 puntos, podrías operar 2." },
    { steps: ["Cierra una parte en el primer objetivo.", "Mueve el stop a break even en ese momento.", "Gestiona el resto con el orderflow o con el siguiente nivel."],
      example: "Largo de 2 contratos en MES. En el primer objetivo (+8 puntos) cierras uno y subes el stop a la entrada. El segundo llega a +19 puntos en la siguiente oferta, donde el flujo gira a vendedor, y cierras ahí." },
    { steps: ["Antes de la sesión: calendario, zonas, sesgo y plan escrito.", "Durante la sesión: solo operaciones que cumplan el modelo.", "Después: registra cada operación en el diario y revisa la semana cada viernes."],
      example: "El viernes el diario muestra un 62 % de acierto en Nueva York y un 31 % en Londres. La semana siguiente dejas Londres solo para preparar zonas y concentras tus operaciones en Nueva York." },
  ],
];
