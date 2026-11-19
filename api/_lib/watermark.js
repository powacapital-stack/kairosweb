/* Marca de agua de las capturas del curso: nombre del alumno, su id de Whop y la fecha, en diagonal y repetida.
   El texto se convierte en trazos (opentype.js + fuente Inter, licencia OFL en fonts/) para no depender de fuentes del servidor. */
const path = require("path");
const sharp = require("sharp");
const opentype = require("opentype.js");

const FONT = opentype.loadSync(path.join(__dirname, "fonts", "inter-latin-600-normal.woff"));
const clean = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w @.\-·/]/g, "").slice(0, 40);

async function watermark(file, user) {
  const img = sharp(file);
  const { width: W, height: H } = await img.metadata();
  const fecha = new Date().toLocaleDateString("es-ES", { timeZone: "Europe/Madrid" });
  const text = `${clean(user.name) || "Alumno"} · ${clean(user.uid).slice(-8)} · ${fecha} · Kairos`;
  const size = Math.max(14, Math.round(Math.min(W, H) / 32));
  const d = FONT.getPath(text, 0, 0, size).toPathData(1);
  const tw = FONT.getAdvanceWidth(text, size);
  const gapX = tw + size * 4, gapY = size * 6;
  // Repite el texto en filas desplazadas, girado -28°, sobre un lienzo mayor que la imagen
  const R = Math.ceil(Math.hypot(W, H));
  let rows = "";
  for (let y = -R, row = 0; y < R; y += gapY, row++)
    for (let x = -R + (row % 2) * gapX / 2; x < R; x += gapX)
      rows += `<use href="#t" x="${x.toFixed(0)}" y="${y.toFixed(0)}"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}">
    <defs><path id="t" d="${d}"/></defs>
    <g transform="translate(${W / 2} ${H / 2}) rotate(-28)">
      <g fill="#000" fill-opacity=".16" transform="translate(1.5 1.5)">${rows.replace(/href=/g, "xlink:href=")}</g>
      <g fill="#fff" fill-opacity=".2">${rows.replace(/href=/g, "xlink:href=")}</g>
    </g></svg>`;
  return img.composite([{ input: Buffer.from(svg), top: 0, left: 0 }]).webp({ quality: 84 }).toBuffer();
}

module.exports = { watermark };
