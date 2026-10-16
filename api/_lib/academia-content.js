/* Contenido completo del curso exclusivo (299 €). Solo lo entrega /api/academia a quien lo ha comprado. */
module.exports = [
  {
    "title": "La Sala de Mando",
    "desc": "Cómo leer cada módulo del panel y en qué orden mirarlo.",
    "lessons": [
      {
        "title": "Qué es la Sala de Mando",
        "body": "Es el panel donde se reúne todo lo que necesitas para decidir: sesgo, flujo de órdenes, niveles y contexto de noticias. La idea es que en menos de un minuto sepas si hay una operación de calidad o si toca esperar.",
        "key": "Empieza siempre por el sesgo y la confianza. Si la confianza es débil, el resto del panel pasa a segundo plano."
      },
      {
        "title": "El sesgo y la confianza",
        "body": "El sesgo indica hacia dónde empuja el flujo institucional. La confianza mide cuánto lo confirman el orderflow, la tendencia y la estructura. Un sesgo alcista con confianza 20 no es lo mismo que uno con confianza 75.",
        "key": "Opera a favor del sesgo solo cuando la confianza supere el nivel moderado."
      },
      {
        "title": "Precios y flujo",
        "body": "Cada tarjeta muestra el precio, la variación del día y el reparto entre volumen comprador y vendedor. Cuando el precio sube con el volumen vendedor dominando, el movimiento suele ser débil.",
        "key": "Busca que el precio y el flujo vayan en la misma dirección."
      },
      {
        "title": "Cómo leer el briefing",
        "body": "El briefing resume la situación cada cinco minutos: dónde está el precio respecto a oferta y demanda, qué hace el delta y qué riesgos hay en el calendario.",
        "key": "Lee la línea de riesgo antes que la de oportunidad."
      },
      {
        "title": "El calendario económico",
        "body": "Los datos de alto impacto como el IPC o las ventas minoristas pueden mover el precio decenas de puntos en segundos. Conviene reducir el tamaño o estar fuera del mercado en ese momento.",
        "key": "Mira el calendario antes de abrir el panel cada mañana."
      },
      {
        "title": "Sesiones y apertura de NY",
        "body": "Londres marca el tono de la mañana europea y Nueva York concentra el mayor volumen. Los primeros 30 minutos tras las 15:30 (hora de Madrid) suelen definir el rango del día.",
        "key": "Evita operar índices americanos en la sesión asiática: hay poco volumen."
      }
    ]
  },
  {
    "title": "Oferta y demanda",
    "desc": "Zonas donde el precio reaccionó con fuerza y por qué tienden a repetirse.",
    "lessons": [
      {
        "title": "Qué es una zona",
        "body": "Una zona de demanda es un área de precio desde la que el mercado subió con fuerza porque había más compradores que vendedores. Una zona de oferta es lo contrario. Las órdenes que quedaron sin ejecutar allí pueden volver a actuar.",
        "key": "Piensa en zonas, no en líneas exactas."
      },
      {
        "title": "Cómo identificar una zona válida",
        "body": "Busca una base pequeña de velas seguida de una salida rápida y amplia. Cuanto más rápido se aleja el precio, más desequilibrio hubo.",
        "key": "Una zona ya tocada varias veces pierde fuerza."
      },
      {
        "title": "Zonas en MNQ, MES y oro",
        "body": "Cada instrumento tiene su ritmo. En MNQ las zonas de 1H suelen dar reacciones de 30 a 60 puntos; en oro, de 5 a 15 dólares. Ajusta tus expectativas a cada mercado.",
        "key": "Usa el gráfico de 1H para marcar zonas y el de 5 min para entrar."
      },
      {
        "title": "Fuerza y confluencias",
        "body": "Una zona gana fuerza si coincide con el VWAP, con un máximo o mínimo del día anterior o con un número redondo.",
        "key": "Dos o más confluencias justifican una operación; una sola, no."
      },
      {
        "title": "Entradas desde zonas",
        "body": "Puedes entrar con una orden límite en el borde de la zona o esperar a una vela de rechazo. La primera da mejor precio; la segunda, más confirmación.",
        "key": "Coloca el stop al otro lado de la zona, nunca dentro."
      },
      {
        "title": "Zonas y sesgo",
        "body": "Una zona de demanda con sesgo alcista es una oportunidad de alta calidad. La misma zona con sesgo bajista probablemente se rompa.",
        "key": "Opera solo las zonas que van a favor del sesgo."
      }
    ]
  },
  {
    "title": "Orderflow",
    "desc": "Ver quién está agrediendo el mercado en cada momento.",
    "lessons": [
      {
        "title": "Qué es el orderflow",
        "body": "Es el registro de las órdenes que se ejecutan: quién compra a mercado y quién vende a mercado. Muestra la intención real detrás del movimiento del precio.",
        "key": "El precio te dice qué pasó; el orderflow, quién lo provocó."
      },
      {
        "title": "El delta",
        "body": "El delta es la diferencia entre el volumen comprado a mercado y el vendido a mercado. Un delta positivo indica compradores más agresivos.",
        "key": "Fíjate en cómo cambia el delta, no solo en su valor."
      },
      {
        "title": "Barras de compra y venta",
        "body": "La barra verde y roja muestra qué porcentaje del volumen reciente fue comprador. Por encima del 55% hay presión compradora clara.",
        "key": "Entre el 45% y el 55% el mercado está indeciso."
      },
      {
        "title": "Volumen por precio y absorción",
        "body": "El perfil de volumen muestra en qué precios se negoció más. Si llega mucho volumen vendedor a una zona y el precio no baja, alguien está absorbiendo esas ventas.",
        "key": "La absorción en demanda es una de las mejores señales de entrada."
      },
      {
        "title": "Divergencias de delta",
        "body": "Si el precio hace un nuevo máximo pero el delta no lo acompaña, los compradores están perdiendo fuerza. Es una señal de alerta, no una entrada por sí sola.",
        "key": "Confirma siempre la divergencia con una zona de oferta o demanda."
      },
      {
        "title": "Orderflow en el briefing",
        "body": "El briefing resume el orderflow de los últimos buckets de 5 minutos. Si dos o tres buckets seguidos van contra tu operación, revisa tu plan.",
        "key": "Tres buckets en contra justifican salir antes del stop."
      }
    ]
  },
  {
    "title": "Ejecución",
    "desc": "Del análisis a la orden: rutina, entradas y gestión del riesgo.",
    "lessons": [
      {
        "title": "Preparación antes del mercado",
        "body": "Antes de operar revisa el calendario, marca las zonas de 1H y anota el sesgo de cada instrumento. Escribe qué harías si el precio llega a cada zona.",
        "key": "Si no puedes explicar el plan en dos frases, no está listo."
      },
      {
        "title": "La apertura de Nueva York",
        "body": "A las 15:30 (hora de Madrid) entra el mayor volumen del día. Los primeros minutos son muy volátiles; muchos traders esperan de 5 a 15 minutos antes de actuar.",
        "key": "Deja que se forme el primer rango antes de entrar."
      },
      {
        "title": "El modelo de entrada",
        "body": "Sesgo a favor, precio en una zona con confluencia y orderflow que confirma. Si falta una de las tres condiciones, no hay operación.",
        "key": "Menos operaciones y mejor elegidas dan mejores resultados."
      },
      {
        "title": "Gestión del riesgo",
        "body": "Arriesga una cantidad fija por operación, por ejemplo el 0,5% de la cuenta. Fija también una pérdida máxima diaria y deja de operar al alcanzarla.",
        "key": "El tamaño de la posición se calcula desde el stop, no al revés."
      },
      {
        "title": "Gestión de la operación",
        "body": "Toma beneficio parcial en el primer objetivo y mueve el stop a break even. Deja correr el resto mientras el orderflow siga a favor.",
        "key": "No muevas nunca el stop en contra."
      },
      {
        "title": "La rutina diaria completa",
        "body": "Prepárate antes de la apertura, opera tu plan y registra cada operación en el diario. Una vez por semana revisa las estadísticas por sesión e instrumento.",
        "key": "El diario es lo que convierte la experiencia en mejora."
      }
    ]
  }
];
