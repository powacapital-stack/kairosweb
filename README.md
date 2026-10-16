# Kairos — web

Web de Kairos publicada en Vercel: https://kairos-web-steel.vercel.app

- `index.html` — página pública (diseño futurista con animaciones 3D, GSAP).
- `app.html` — área de miembros: Sala de Mando, Calendario, Mapa de calor, Macro, Diario y Academia.
- `api/macro.js` — función de Vercel que genera la inteligencia macro con datos reales de FRED.

## Estructura

| Ruta | Qué es |
|---|---|
| `css/landing.css`, `js/landing.js` | Estilos y animaciones de la página pública |
| `css/styles.css`, `js/app.js`, `js/sections.js` | Área de miembros |
| `js/config.js` | Precio, enlace de pago de Whop, invitación de Discord y símbolos de TradingView |
| `js/tv.js` | Inserción de los widgets de TradingView |
| `api/macro.js` | `GET /api/macro`: datos macro reales (caché de 6 h) |
| `api/_lib/macro-core.js` | Descarga de FRED y cálculo de motores, régimen y correlaciones |
| `api/_lib/macro-rules.js` | Análisis por reglas (sin IA) |
| `brand/` | Icono de la marca (SVG y PNG para Discord) |
| `server.js` | Servidor local de pruebas (no se publica) |

## Qué es real y qué es de ejemplo

| Parte | Origen |
|---|---|
| Precios, gráficos, calendario económico, mapa de calor | En vivo · widgets de TradingView |
| Macro: régimen, convicción, motores, sesgo por activo, tipos Fed/BCE, correlaciones | Real · FRED (`/api/macro`) |
| Sesgo/orderflow/niveles de la Sala de Mando, orderflow de Macro, "Próximo riesgo" | Ejemplo |
| Diario, alertas y progreso de la Academia | Navegador de cada usuario (`localStorage`) |

## Variables de entorno (Vercel → Settings → Environment Variables)

| Variable | Obligatoria | Para qué |
|---|---|---|
| `FRED_API_KEY` | Sí | Datos macro de la Reserva Federal (gratis) |
| `ANTHROPIC_API_KEY` | No | Si existe, Claude redacta el análisis macro; si no, se usan reglas (gratis) |

## Pagos y comunidad

- Pago: Whop, producto "Kairos – Membresía" (77 €/mes). Enlace en `js/config.js`.
- Discord: servidor Kairos; Whop da y quita el rol **Miembro** automáticamente.

## Trabajar en local

```bash
npm install
node server.js
```

Abre http://localhost:5173 (la función `/api/macro` solo funciona en Vercel; en local la sección Macro muestra los datos de ejemplo).

## Publicar

```bash
npx.cmd vercel@48.1.0 deploy --prod --global-config .vercel-kairos
```

La sesión de Vercel se guarda en `.vercel-kairos` (no se sube a GitHub).

## Pendiente

1. Proteger el área de miembros con el login de Whop (ahora cualquiera puede abrir `app.html`).
2. Páginas legales: aviso legal, privacidad, términos y cookies.
3. Dominio propio.
4. Datos de orderflow reales para la Sala de Mando.
