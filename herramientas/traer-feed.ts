/**
 * Adaptador: trae los videos del canal de YouTube, los clasifica con el
 * dominio y deja el resultado en `src/datos/feed.json`, que sí se commitea.
 *
 * Por qué se guarda el resultado en vez de pedirlo en cada build: para que el
 * build no dependa de la red. Si YouTube está caído un miércoles, el sitio se
 * sigue construyendo con lo último que trajimos.
 *
 * Dos fuentes, cada una para lo que sirve:
 * - El RSS del canal trae SOLO LAS ÚLTIMAS 15 ENTRADAS y no trae duración.
 *   Alcanza para enterarse de lo nuevo dos veces por semana y no gasta cuota.
 * - La YouTube Data API da la duración de cada video (videos.list, 1 unidad
 *   cada 50) y, con `--historico`, recorre la lista de subidas completa para
 *   la carga única del archivo (~496 videos, unas 20 unidades de 10.000).
 *
 * Este script agrega, nunca borra. Lo que hay que corregir a mano va en
 * `src/datos/curaduria.ts`, no en `feed.json`.
 *
 * Uso (necesita YOUTUBE_API_KEY en el entorno):
 *   npm run feed                  # trae lo nuevo del RSS
 *   npm run feed -- --historico   # recorre todas las subidas del canal
 *   npm run feed -- --ver         # muestra lo que haría, sin escribir
 */
import { readFileSync, writeFileSync } from 'node:fs';

import {
  clasificar,
  descartar,
  segundosDesdeIso,
  type EntradaDeFeed,
  type MotivoDeDescarte,
} from '../src/dominio/feed.ts';
import { armarEmisiones, type PiezaDelFeed } from '../src/dominio/emisiones.ts';
import * as curaduria from '../src/datos/curaduria.ts';

const CANAL = 'UCRIusH-9eFX3LztaqSRMtXQ';
/** La lista de subidas de un canal es su id con UU en vez de UC. */
const SUBIDAS = `UU${CANAL.slice(2)}`;
const RSS = `https://www.youtube.com/feeds/videos.xml?channel_id=${CANAL}`;
const API = 'https://www.googleapis.com/youtube/v3';
const LOTE_DE_LA_API = 50;
const DESTINO = new URL('../src/datos/feed.json', import.meta.url);

type SinDuracion = Omit<EntradaDeFeed, 'segundos'>;
type Descartado = { videoId: string; titulo: string; motivo: MotivoDeDescarte };
type Archivo = {
  actualizado: string;
  piezas: PiezaDelFeed[];
  /** Shorts y lo que no es de Noche D10: se guardan para no volver a pedirlos. */
  descartados: Descartado[];
};

const soloVer = process.argv.includes('--ver');
const historico = process.argv.includes('--historico');
const clave = process.env.YOUTUBE_API_KEY;

function fallar(mensaje: string): never {
  console.error(`${mensaje} No se toca feed.json.`);
  process.exit(1);
}

const ENTIDADES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
  '&#39;': "'",
};

const decodificar = (texto: string) =>
  texto.replace(/&(?:amp|lt|gt|quot|apos|#39);/g, (e) => ENTIDADES[e] ?? e);

function sacar(bloque: string, etiqueta: string): string {
  const encontrado = bloque.match(
    new RegExp(`<${etiqueta}[^>]*>([\\s\\S]*?)</${etiqueta}>`),
  );
  return encontrado ? decodificar(encontrado[1].trim()) : '';
}

/**
 * El RSS de YouTube es Atom plano y estable. Un parser de XML completo sería
 * una dependencia más para leer cuatro campos.
 */
async function entradasDelRss(): Promise<SinDuracion[]> {
  const respuesta = await fetch(RSS);
  if (!respuesta.ok) fallar(`El RSS respondió ${respuesta.status}.`);
  const bloques = (await respuesta.text()).match(/<entry>[\s\S]*?<\/entry>/g) ?? [];
  return bloques.map((bloque) => ({
    videoId: sacar(bloque, 'yt:videoId'),
    titulo: sacar(bloque, 'title'),
    publicado: sacar(bloque, 'published'),
    descripcion: sacar(bloque, 'media:description'),
  }));
}

async function pedirALaApi<T>(recurso: string, parametros: Record<string, string>) {
  const url = new URL(`${API}/${recurso}`);
  for (const [nombre, valor] of Object.entries({ ...parametros, key: clave! })) {
    url.searchParams.set(nombre, valor);
  }
  const respuesta = await fetch(url);
  // El cuerpo del error de Google no incluye la clave; la URL sí, por eso no se imprime.
  if (!respuesta.ok) fallar(`La Data API respondió ${respuesta.status} en ${recurso}.`);
  return (await respuesta.json()) as T;
}

type PaginaDeSubidas = {
  nextPageToken?: string;
  items: {
    snippet: { title: string; description: string; publishedAt: string };
    contentDetails: { videoId: string };
  }[];
};

async function entradasDelHistorico(): Promise<SinDuracion[]> {
  const entradas: SinDuracion[] = [];
  let pagina: string | undefined;
  do {
    const respuesta: PaginaDeSubidas = await pedirALaApi('playlistItems', {
      part: 'snippet,contentDetails',
      playlistId: SUBIDAS,
      maxResults: String(LOTE_DE_LA_API),
      ...(pagina ? { pageToken: pagina } : {}),
    });
    for (const item of respuesta.items) {
      entradas.push({
        videoId: item.contentDetails.videoId,
        titulo: item.snippet.title,
        publicado: item.snippet.publishedAt,
        descripcion: item.snippet.description,
      });
    }
    pagina = respuesta.nextPageToken;
  } while (pagina);
  return entradas;
}

async function segundosPorVideo(
  videoIds: string[],
): Promise<Map<string, number | null>> {
  const resultado = new Map<string, number | null>();
  for (let i = 0; i < videoIds.length; i += LOTE_DE_LA_API) {
    const lote = videoIds.slice(i, i + LOTE_DE_LA_API);
    const respuesta = await pedirALaApi<{
      items: { id: string; contentDetails: { duration: string } }[];
    }>('videos', { part: 'contentDetails', id: lote.join(',') });
    for (const item of respuesta.items) {
      resultado.set(item.id, segundosDesdeIso(item.contentDetails.duration));
    }
  }
  return resultado;
}

function leerArchivo(): Archivo {
  try {
    return JSON.parse(readFileSync(DESTINO, 'utf8')) as Archivo;
  } catch {
    return { actualizado: '', piezas: [], descartados: [] };
  }
}

function listar(titulo: string, lineas: string[]) {
  if (lineas.length === 0) return;
  console.log(`\n${titulo}: ${lineas.length}`);
  for (const linea of lineas) console.log(`  ${linea}`);
}

if (!clave) fallar('Falta YOUTUBE_API_KEY: sin la Data API no hay duraciones.');

const entradas = historico ? await entradasDelHistorico() : await entradasDelRss();
if (entradas.length === 0) fallar('La fuente vino vacía o cambió de formato.');

const archivo = leerArchivo();
const conocidos = new Set(
  [...archivo.piezas, ...archivo.descartados].map((video) => video.videoId),
);
const novedades = entradas.filter((entrada) => !conocidos.has(entrada.videoId));
const segundos = await segundosPorVideo(novedades.map((entrada) => entrada.videoId));

const nuevas: PiezaDelFeed[] = [];
const nuevosDescartes: Descartado[] = [];
const enCurso: string[] = [];
const noDisponibles: string[] = [];
for (const entrada of novedades) {
  // La API no devuelve los videos borrados o privados: no es un vivo en curso.
  if (!segundos.has(entrada.videoId)) {
    noDisponibles.push(`${entrada.videoId}  ${entrada.titulo}`);
    continue;
  }
  const duracion = segundos.get(entrada.videoId);
  // Un vivo que sigue al aire no tiene duración: se retoma en la próxima corrida.
  if (!duracion) {
    enCurso.push(entrada.titulo);
    continue;
  }
  const completa = { ...entrada, segundos: duracion };
  const motivo = descartar(completa);
  if (motivo)
    nuevosDescartes.push({ videoId: entrada.videoId, titulo: entrada.titulo, motivo });
  else nuevas.push(clasificar(completa));
}

console.log(
  historico
    ? `Histórico: ${entradas.length} videos en la lista de subidas.`
    : `RSS: ${entradas.length} entradas (YouTube devuelve 15 como máximo).`,
);
listar(
  'Nuevas',
  nuevas.map(
    (pieza) => `[${pieza.tipo}${pieza.pase ? `/${pieza.pase}` : ''}] ${pieza.titulo}`,
  ),
);
listar(
  'Descartadas',
  nuevosDescartes.map((video) => `[${video.motivo}] ${video.titulo}`),
);
listar('Sin duración todavía (quedan para la próxima)', enCurso);
listar('No disponibles en la API (borrados o privados)', noDisponibles);

const salida: Archivo = {
  actualizado: new Date().toISOString(),
  piezas: [...archivo.piezas, ...nuevas].sort((a, b) =>
    b.publicado.localeCompare(a.publicado),
  ),
  descartados: [...archivo.descartados, ...nuevosDescartes],
};

// Lo que hay que mirar a mano: se corrige en src/datos/curaduria.ts.
const { emisiones, huerfanas, vivosSinEstreno, curaduriaSinResolver } = armarEmisiones(
  salida.piezas,
  curaduria,
);
listar(
  'Programas con la fecha de publicación y no la del título (fechaPorVideo)',
  nuevas
    .filter((pieza) => pieza.fechaDeducida)
    .map((pieza) => `${pieza.videoId}  ${pieza.fechaEmision}  ${pieza.tituloOriginal}`),
);
listar(
  'Programas con fecha repetida (fechaPorVideo)',
  emisiones
    .filter((emision) => emision.slug !== emision.fecha)
    .map((emision) => `${emision.videoId}  ${emision.slug}  ${emision.titulo}`),
);
listar(
  'Recortes sin emisión (emisionPorVideo)',
  huerfanas.map((pieza) => `${pieza.videoId}  ${pieza.titulo}`),
);
listar('Vivos esperando su estreno', vivosSinEstreno);
listar(
  'Reasignaciones de curaduria.ts que no encuentran la emisión',
  curaduriaSinResolver,
);

if (soloVer) {
  console.log('\n--ver: no se escribió nada.');
} else if (nuevas.length === 0 && nuevosDescartes.length === 0) {
  console.log('\nNada nuevo. feed.json queda como estaba.');
} else {
  writeFileSync(DESTINO, `${JSON.stringify(salida, null, 2)}\n`);
  console.log(
    `\nEscrito: src/datos/feed.json (${salida.piezas.length} piezas, ${emisiones.length} emisiones).`,
  );
}
