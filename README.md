# Kairos — web

Web de Kairos publicada en Vercel: https://kairos-web-steel.vercel.app

- `index.html` — página pública (diseño futurista con animaciones 3D, GSAP) con los dos planes: membresía de 77 €/mes y curso exclusivo de 299 € (pago único).
- `app.html` — área de miembros con login de Whop: Sala de Mando, Calendario, Mapa de calor, Macro, Diario y Academia.
- `api/` — funciones de Vercel: login, acceso, curso, macro con datos reales de FRED y publicaciones automáticas en Discord.

## Estructura

| Ruta | Qué es |
|---|---|
| `css/landing.css`, `js/landing.js` | Estilos y animaciones de la página pública |
| `css/styles.css`, `js/app.js`, `js/sections.js` | Área de miembros (la Academia lleva solo el temario; el contenido lo da el servidor) |
| `js/auth.js` | Pantalla de acceso: consulta `/api/me` y decide qué puede ver cada usuario |
| `js/config.js` | Precios, enlaces de pago de Whop, invitación de Discord y símbolos de TradingView |
| `js/tv.js` | Inserción de los widgets de TradingView |
| `api/auth/login.js`, `callback.js`, `logout.js` | Login con Whop (OAuth + PKCE) y sesión en cookie firmada |
| `api/me.js` | `GET /api/me`: usuario y accesos (membresía y curso) |
| `api/academia.js` | `GET /api/academia`: lecciones completas, solo para compradores del curso |
| `api/academia-img.js` | `GET /api/academia-img?f=`: capturas de operaciones, solo para compradores del curso |
| `api/_lib/session.js` | Cookies firmadas, comprobación de acceso en Whop e identificadores de la app y productos |
| `api/_lib/academia-*.js` | Contenido del curso: módulos 1–4, ampliación, diagramas, módulo 5 (Método Kairos MNQ) y módulo 6 (operaciones reales) |
| `api/_lib/academia-img/` | Capturas del autor (privadas, no se sirven como archivos públicos) |
| `api/_lib/svg.js` | Piezas para dibujar los diagramas de las lecciones |
| `img/academia/` | Portadas de los módulos (públicas). Se generan con `node scripts/portadas-academia.js` |
| `api/macro.js`, `api/_lib/macro-*.js` | `GET /api/macro`: datos macro reales de FRED y análisis por reglas (caché de 6 h) |
| `api/discord-sesgo.js`, `api/discord-alertas.js` | Publicaciones automáticas en Discord |
| `.github/workflows/discord.yml` | Lanza el sesgo cada 4 h y las noticias cada hora |
| `brand/` | Icono de la marca (SVG y PNG para Discord) |
| `server.js` | Servidor local de pruebas; también ejecuta las funciones de `/api` (no se publica) |

## Accesos

| Compra en Whop | Qué ve |
|---|---|
| Nada / sin sesión | Pantalla de acceso con login y botón de pago |
| Membresía 77 €/mes (`prod_NLZPs1lvQhI2U`) | Toda el área de miembros; Academia bloqueada con la compra del curso |
| Curso 299 € (`prod_ynrZy74vWNL0v`) | Academia completa (6 módulos, 39 lecciones) |

La protección real está en el servidor: sin el curso, `/api/academia` y `/api/academia-img` responden 401/403.

## Qué es real y qué es de ejemplo

| Parte | Origen |
|---|---|
| Precios, gráficos, calendario económico, mapa de calor | En vivo · widgets de TradingView |
| Macro: régimen, convicción, motores, sesgo por activo, tipos Fed/BCE, correlaciones | Real · FRED (`/api/macro`) |
| Sesgo/orderflow/niveles de la Sala de Mando, orderflow de Macro, "Próximo riesgo" | Ejemplo |
| Diario, alertas y progreso de la Academia | Navegador de cada usuario (`localStorage`) |

## Variables de entorno (Vercel → Settings → Environment Variables, Production)

| Variable | Obligatoria | Para qué |
|---|---|---|
| `SESSION_SECRET` | Sí | Firmar las cookies de sesión |
| `WHOP_API_KEY` | No | Comprobar accesos si falla el token del usuario (la app de Whop está en modo OAuth público) |
| `FRED_API_KEY` | Sí | Datos macro de la Reserva Federal (gratis) |
| `CRON_SECRET` | Sí | Autoriza las publicaciones en Discord (igual que `KAIROS_CRON_SECRET` en GitHub) |
| `DISCORD_WEBHOOK_SESGO`, `DISCORD_WEBHOOK_ALERTAS` | Sí | Webhooks de #sesgo-del-dia y #alertas |
| `ANTHROPIC_API_KEY` | No | Si existe, Claude redacta el análisis macro; si no, se usan reglas (gratis) |

## Pagos y comunidad

- Whop: "Kairos – Membresía" (77 €/mes) y "Kairos – Curso Exclusivo" (299 €, pago único). Enlaces en `js/config.js`.
- App de Whop "Kairos Web" (`app_zHT0LV0rLU7Qpb`) con la URL de vuelta `https://kairos-web-steel.vercel.app/api/auth/callback`.
- Discord: Whop da y quita el rol **Miembro** automáticamente.

## Trabajar en local

```bash
npm install
SESSION_SECRET=prueba node server.js
```

Abre http://localhost:5173. El login con Whop solo funciona en la web publicada; en local se puede probar con una cookie de sesión firmada con el mismo `SESSION_SECRET`.

Si cambias CSS o JS, sube la versión `?v=` de los enlaces en `index.html` y `app.html` para que los navegadores no usen la copia antigua.

## Publicar

```bash
npx.cmd vercel deploy --prod --yes --global-config .vercel-kairos
```

La sesión de Vercel se guarda en `.vercel-kairos` (no se sube a GitHub).

## Pendiente

1. Páginas legales: aviso legal, privacidad, términos y cookies.
2. Dominio propio y plan Pro de Vercel (el plan Hobby no permite uso comercial).
3. Rol de Discord para compradores del curso.
4. Datos de orderflow reales para la Sala de Mando.
5. Más operaciones reales propias en el módulo 6.
