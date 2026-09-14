/**
 * Adaptador: trae el feed del canal de YouTube, lo clasifica con el dominio y
 * deja el resultado en `src/datos/feed.json`, que sí se commitea.
 *
 * Por qué se guarda el resultado en vez de pedir el feed en cada build: para
 * que el build no dependa de la red. Si YouTube está caído un martes, el sitio
 * se sigue construyendo con lo último que trajimos.
 *
 * LÍMITE IMPORTANTE: el feed de YouTube devuelve SOLO LAS ÚLTIMAS 15 ENTRADAS.
 * Sirve para mantener el sitio al día de acá en adelante; NO sirve para traer
 * los 496 videos que ya están publicados. El archivo viejo se carga una sola
 * vez por otra vía y queda en `feed.json`: este script agrega, nunca borra.
 *
 * Uso:
 *   npm run feed          # trae y actualiza src/datos/feed.json
 *   npm run feed -- --ver # muestra lo que traería, sin escribir nada
 */
import { readFileSync, writeFileSync } from 'node:fs';
import {
  clasificar,
  type EntradaDeFeed,
  type PiezaClasificada,
} from '../src/dominio/feed.ts';

const CANAL = 'UCRIusH-9eFX3LztaqSRMtXQ';
const FEED = `https://www.youtube.com/feeds/videos.xml?channel_id=${CANAL}`;
const DESTINO = new URL('../src/datos/feed.json', import.meta.url);

const ENTIDADES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
  '&#39;': "'",
};

function decodificar(texto: string): string {
  return texto.replace(/&(?:amp|lt|gt|quot|apos|#39);/g, (e) => ENTIDADES[e] ?? e);
}

function sacar(bloque: string, etiqueta: string): string {
  const encontrado = bloque.match(
    new RegExp(`<${etiqueta}[^>]*>([\\s\\S]*?)</${etiqueta}>`),
  );
  return encontrado ? decodificar(encontrado[1].trim()) : '';
}

/**
 * El feed de YouTube es Atom plano y estable. Un parser de XML completo sería
 * una dependencia más para leer cinco campos: esto alcanza y no agrega nada al
 * package.json.
 */
function leerEntradas(xml: string): EntradaDeFeed[] {
  const bloques = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];
  return bloques.map((bloque) => ({
    videoId: sacar(bloque, 'yt:videoId'),
    titulo: sacar(bloque, 'title'),
    publicado: sacar(bloque, 'published'),
    descripcion: sacar(bloque, 'media:description'),
  }));
}

type Archivo = {
  actualizado: string;
  piezas: PiezaClasificada[];
  /** Títulos que el parser no supo clasificar. Se revisan a mano. */
  sinClasificar: { videoId: string; titulo: string }[];
};

function leerArchivo(): Archivo {
  try {
    return JSON.parse(readFileSync(DESTINO, 'utf8')) as Archivo;
  } catch {
    return { actualizado: '', piezas: [], sinClasificar: [] };
  }
}

const soloVer = process.argv.includes('--ver');

const respuesta = await fetch(FEED);
if (!respuesta.ok) {
  console.error(`El feed respondió ${respuesta.status}. No se toca feed.json.`);
  process.exit(1);
}

const entradas = leerEntradas(await respuesta.text());
if (entradas.length === 0) {
  console.error('El feed vino vacío o cambió de formato. No se toca feed.json.');
  process.exit(1);
}

const archivo = leerArchivo();
const yaTenemos = new Set(archivo.piezas.map((pieza) => pieza.videoId));
const yaDescartadas = new Set(archivo.sinClasificar.map((pieza) => pieza.videoId));

const nuevas: PiezaClasificada[] = [];
const nuevasSinClasificar: { videoId: string; titulo: string }[] = [];

for (const entrada of entradas) {
  if (yaTenemos.has(entrada.videoId) || yaDescartadas.has(entrada.videoId)) continue;
  const pieza = clasificar(entrada);
  if (pieza) nuevas.push(pieza);
  else nuevasSinClasificar.push({ videoId: entrada.videoId, titulo: entrada.titulo });
}

console.log(`Feed: ${entradas.length} entradas (YouTube devuelve 15 como máximo).`);
console.log(`Nuevas clasificadas: ${nuevas.length}`);
for (const pieza of nuevas) console.log(`  [${pieza.tipo}] ${pieza.titulo}`);

if (nuevasSinClasificar.length > 0) {
  console.log(
    `\nSin clasificar: ${nuevasSinClasificar.length} — miralos y agregá el formato`,
  );
  console.log('a src/dominio/feed.ts con su caso de prueba:');
  for (const pieza of nuevasSinClasificar) console.log(`  ${pieza.titulo}`);
}

if (soloVer) {
  console.log('\n--ver: no se escribió nada.');
  process.exit(0);
}

if (nuevas.length === 0 && nuevasSinClasificar.length === 0) {
  console.log('\nNada nuevo. feed.json queda como estaba.');
  process.exit(0);
}

const salida: Archivo = {
  actualizado: new Date().toISOString(),
  piezas: [...archivo.piezas, ...nuevas].sort((a, b) =>
    b.publicado.localeCompare(a.publicado),
  ),
  sinClasificar: [...archivo.sinClasificar, ...nuevasSinClasificar],
};

writeFileSync(DESTINO, `${JSON.stringify(salida, null, 2)}\n`);
console.log(
  `\nEscrito: src/datos/feed.json (${salida.piezas.length} piezas en total).`,
);
