/**
 * Genera los íconos y la placa para compartir a partir de un SVG.
 *
 * OJO: esto NO es el logo de Noche D10. Es una placa provisoria hecha con los
 * tokens de marca para que el sitio no salga con el ícono por defecto de Astro
 * y para que los previews de WhatsApp y Facebook no queden en blanco.
 * TODO: dato pendiente del cliente — el escudo de Noche D10 en vectorial.
 *
 * Se corre a mano cuando cambia la placa: `node scripts/generar-iconos.mjs`.
 * No va en el build: las salidas están commiteadas en public/.
 */
import { writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const NEGRO = '#0a0a0a';
const ROJO = '#c8102e';
const HUESO = '#f4f3ef';

const marca = (tamanio) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${tamanio}" height="${tamanio}">
  <rect width="512" height="512" fill="${NEGRO}"/>
  <rect x="0" y="0" width="512" height="28" fill="${ROJO}"/>
  <text x="256" y="300" text-anchor="middle" font-family="Helvetica, Arial, sans-serif"
        font-weight="bold" font-size="210" fill="${HUESO}" letter-spacing="-8">D10</text>
  <text x="256" y="372" text-anchor="middle" font-family="Helvetica, Arial, sans-serif"
        font-weight="bold" font-size="58" fill="${ROJO}" letter-spacing="10">NOCHE</text>
</svg>`;

const placa = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <rect width="1200" height="630" fill="${NEGRO}"/>
  <rect x="0" y="0" width="1200" height="14" fill="${ROJO}"/>
  <text x="80" y="300" font-family="Helvetica, Arial, sans-serif" font-weight="bold"
        font-size="132" fill="${HUESO}" letter-spacing="-4">NOCHE <tspan fill="${ROJO}">D10</tspan></text>
  <text x="84" y="372" font-family="Helvetica, Arial, sans-serif" font-size="38" fill="${HUESO}">
    Entrevistas, música en vivo y humor. Hace 16 años.
  </text>
  <text x="84" y="446" font-family="Helvetica, Arial, sans-serif" font-size="30" fill="#9a9a9a">
    CX30 Radio Nacional AM 1130 · VIVO TV · Cables del interior · YouTube
  </text>
</svg>`;

/** ICO con un PNG adentro: es válido y lo entienden todos los navegadores. */
function empaquetarIco(png) {
  const cabecera = Buffer.alloc(6);
  cabecera.writeUInt16LE(0, 0); // reservado
  cabecera.writeUInt16LE(1, 2); // tipo: ícono
  cabecera.writeUInt16LE(1, 4); // cantidad de imágenes

  const entrada = Buffer.alloc(16);
  entrada.writeUInt8(32, 0); // ancho
  entrada.writeUInt8(32, 1); // alto
  entrada.writeUInt8(0, 2); // colores de paleta
  entrada.writeUInt8(0, 3); // reservado
  entrada.writeUInt16LE(1, 4); // planos
  entrada.writeUInt16LE(32, 6); // bits por pixel
  entrada.writeUInt32LE(png.length, 8);
  entrada.writeUInt32LE(22, 12); // offset de la imagen

  return Buffer.concat([cabecera, entrada, png]);
}

const png = (svg, tamanio) =>
  sharp(Buffer.from(svg))
    .resize(tamanio, tamanio)
    .png({ compressionLevel: 9 })
    .toBuffer();

await writeFile('public/favicon.svg', marca(512).trim() + '\n');

await writeFile('public/icono-192.png', await png(marca(512), 192));
await writeFile('public/icono-512.png', await png(marca(512), 512));
await writeFile('public/icono-180.png', await png(marca(512), 180));
await writeFile('public/favicon.ico', empaquetarIco(await png(marca(512), 32)));

await writeFile(
  'public/og-noche-d10.png',
  await sharp(Buffer.from(placa)).png({ compressionLevel: 9 }).toBuffer(),
);

console.log('Íconos y placa OG generados en public/.');
