# Kairos — web

Web estática (HTML, CSS y JavaScript sin compilación) con:

- `index.html` — landing pública: cinta de cotizaciones, gráfico del Nasdaq, herramientas, alta, precio (77 €/mes) y preguntas frecuentes.
- `app.html` — área de miembros: Sala de Mando, Calendario, Mapa de calor, Macro (global y por activo), Diario y Academia (bloqueada para clientes exclusivos).

## Qué es real y qué es de ejemplo

| Parte | Origen de los datos |
|---|---|
| Cinta de cotizaciones, gráfico de la portada, tarjetas de precio y gráfico de la Sala de Mando | **En vivo** · widgets gratuitos de TradingView |
| Calendario económico | **En vivo** · widget de TradingView |
| Mapa de calor (S&P 500, Nasdaq 100, cripto) | **En vivo** · widgets de TradingView |
| Indicadores de la pestaña Macro (DXY, bono 10 años, VIX, oro, crudo) | **En vivo** · widgets de TradingView |
| Sesgo, confianza, orderflow, delta, niveles clave, perfil de volumen y briefing | **Ejemplo simulado**: necesita un proveedor de orderflow |
| Régimen macro, motores, alineación, divergencias y resúmenes IA | **Ejemplo**: se puede alimentar después con datos y un modelo de IA |
| Diario de trading, alertas y progreso de la Academia | Se guardan en el navegador de cada usuario (`localStorage`) |

### Sobre los precios de TradingView
- Los widgets gratuitos no necesitan cuenta. Tu cuenta Pro de TradingView no se usa ni hace falta.
- En `js/config.js`, `feed: "cfd"` usa CFD de OANDA y cripto spot, que en los widgets suelen ir en tiempo real.
  Con `feed: "futures"` se muestran los futuros de CME (MNQ1!, GC1!…), pero en los widgets gratuitos van con unos 10 minutos de retraso.
- Los símbolos TVC (DXY, US10Y, VIX) no se pueden mostrar en widgets gratuitos; por eso se usan CFD equivalentes.
- Los widgets llevan el logo de TradingView y sus condiciones de uso: https://www.tradingview.com/widget-docs/

## Probarlo en tu ordenador

Necesitas Node.js. En esta carpeta:

```bash
node server.js
```

Y abre http://localhost:5173

## Publicarlo

Al ser una web estática se puede subir tal cual a Netlify, Vercel, Cloudflare Pages o GitHub Pages. En Netlify basta con arrastrar la carpeta a https://app.netlify.com/drop.
`server.js` y la carpeta `.claude` solo sirven para probar en local.

## Configuración

Todo lo que cambia a menudo está en `js/config.js`: nombre, precio, fuente de datos y símbolos de cada instrumento.

## Pendiente para la versión de producción

1. **Usuarios y pagos:** registro e inicio de sesión, suscripción de 77 €/mes con Stripe y el rol de "cliente exclusivo" que desbloquea la Academia. Hoy el bloqueo es solo visual; para que sea seguro, el contenido de la Academia tiene que servirse desde el servidor solo a usuarios con ese rol.
2. **Orderflow real:** proveedor de datos de futuros (por ejemplo Databento o Rithmic) y un pequeño backend que calcule el delta, el sesgo y los niveles.
3. **IA:** briefings y resúmenes macro generados con un modelo a partir de esos datos.
4. **Diario y alertas en el servidor**, para que no se pierdan al cambiar de navegador.
