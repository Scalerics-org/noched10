/**
 * Dominio: interpretar los videos del canal de YouTube.
 *
 * Todo lo de acá son funciones puras. No hay fetch, no hay archivos, no hay
 * red: se testea con `node --test` sin levantar nada. El que sale a buscar
 * los videos es `herramientas/traer-feed.ts`, que es el adaptador.
 *
 * TRAMPA: en siete años el canal usó más de ocho formatos de título, con
 * barras, guiones, comas, una `l` minúscula como separador, emojis y fechas
 * escritas de cinco maneras. Por eso el TIPO no se adivina por el título sino
 * por la DURACIÓN, que es el único dato parejo:
 *   - más de una hora: programa completo (vivo, estreno o pase único);
 *   - hasta tres minutos: short, no entra al archivo;
 *   - lo del medio: recorte (entrevista, humor o columna).
 * Del título sólo se sacan los invitados y la fecha, con la mejor regla
 * posible. Lo que salga mal se corrige en `src/datos/curaduria.ts`.
 */

export type TipoDePieza = 'emision' | 'entrevista' | 'humor' | 'columna' | 'musica';

export type EntradaDeFeed = {
  videoId: string;
  titulo: string;
  publicado: string; // ISO, instante UTC
  descripcion: string;
  /** Duración según la Data API. */
  segundos: number;
};

export type PiezaClasificada = {
  videoId: string;
  tipo: TipoDePieza;
  titulo: string;
  tituloOriginal: string;
  publicado: string;
  duracion: string;
  /** Sólo en emisiones: la del título o, si no trae, la de publicación. */
  fechaEmision: string | null;
  /** true si la fecha salió de la publicación y no del título: revisar. */
  fechaDeducida: boolean;
  /** Vivo del jueves, estreno del martes, o programa de un solo pase. */
  pase: 'vivo' | 'estreno' | 'unico' | null;
  invitados: string[];
};

export type MotivoDeDescarte = 'short' | 'todo-d10';

const UNA_HORA = 3600;
const LARGO_DE_UN_SHORT = 180;

/** Montevideo es UTC-3 todo el año: no hay horario de verano desde 2015. */
export function fechaEnMontevideo(instante: string): string {
  return new Date(Date.parse(instante) - 3 * 3_600_000).toISOString().slice(0, 10);
}

/** `PT2H2M31S` → 7351. Un vivo en curso viene como `P0D`: devuelve null. */
export function segundosDesdeIso(iso: string): number | null {
  const partes = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!partes || partes.slice(1).every((parte) => parte === undefined)) return null;
  const [horas, minutos, segundos] = partes.slice(1).map((parte) => Number(parte ?? 0));
  return horas * UNA_HORA + minutos * 60 + segundos;
}

/** 7351 → `2:02:31`; 2359 → `39:19`. */
export function formatearDuracion(total: number): string {
  const dosDigitos = (n: number) => String(n).padStart(2, '0');
  const horas = Math.floor(total / UNA_HORA);
  const minutos = Math.floor((total % UNA_HORA) / 60);
  const segundos = total % 60;
  return horas > 0
    ? `${horas}:${dosDigitos(minutos)}:${dosDigitos(segundos)}`
    : `${minutos}:${dosDigitos(segundos)}`;
}

const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];
const DIAS = '(?:lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo)';
const MES_EN_LETRAS =
  '(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)';

/** Todas las formas en que el canal escribió una fecha. */
const FECHAS = {
  completa: /\b(\d{1,2})[-/](\d{1,2})[-/](\d{4})\b/,
  corta: /\b(\d{2})-(\d{2})-(\d{2})\b/,
  enLetras: new RegExp(
    `(?:${DIAS}\\s+)?(\\d{1,2})\\s+de\\s+${MES_EN_LETRAS}(?:\\s+de\\s+(\\d{4}))?`,
    'i',
  ),
  // "NOCHE D10 26 08 OK", "noche d10 pgm 31 08", "NOCHE D 10 09 8"
  numerica: /NOCHE\s*D\s*10\s+(?:PGM\s+)?(\d{1,2})\s+(\d{1,2})\b/i,
};

const iso = (anio: number, mes: number, dia: number) =>
  `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

/**
 * Fecha de emisión escrita en el título, o null. Cuando el título no trae el
 * año se toma el de la publicación, salvo que eso deje la emisión después de
 * publicada: entonces es del año anterior (un programa del 29/12 subido en enero).
 */
export function fechaDesdeTitulo(titulo: string, publicado: string): string | null {
  const publicada = fechaEnMontevideo(publicado);
  const anioPublicado = Number(publicada.slice(0, 4));
  const sinAnio = (mes: number, dia: number) => {
    const candidata = iso(anioPublicado, mes, dia);
    return candidata > publicada ? iso(anioPublicado - 1, mes, dia) : candidata;
  };

  let partes = titulo.match(FECHAS.completa);
  if (partes) return iso(Number(partes[3]), Number(partes[2]), Number(partes[1]));

  partes = titulo.match(FECHAS.corta);
  if (partes)
    return iso(2000 + Number(partes[3]), Number(partes[2]), Number(partes[1]));

  partes = titulo.match(FECHAS.enLetras);
  if (partes) {
    const nombre = partes[2].toLowerCase().replace('setiembre', 'septiembre');
    const mes = MESES.indexOf(nombre) + 1;
    return partes[3]
      ? iso(Number(partes[3]), mes, Number(partes[1]))
      : sinAnio(mes, Number(partes[1]));
  }

  partes = titulo.match(FECHAS.numerica);
  if (partes) return sinAnio(Number(partes[2]), Number(partes[1]));

  return null;
}

/**
 * Los títulos vienen muchas veces en mayúsculas de imprenta. Esto los pasa a
 * algo presentable sin romper comillas ni abreviaturas. Lo que salga mal
 * ("DE LIMA", tildes que el canal se come) se corrige en la curaduría.
 */
const MINUSCULAS = new Set(['de', 'del', 'la', 'las', 'los', 'y', 'e', 'en', 'el']);

export function aNombrePropio(texto: string): string {
  const limpio = texto.trim().replace(/\s+/g, ' ');
  if (limpio !== limpio.toUpperCase()) return limpio; // ya venía en mixto

  return limpio
    .toLowerCase()
    .split(' ')
    .map((palabra, indice) => {
      if (indice > 0 && MINUSCULAS.has(palabra)) return palabra;
      return palabra.replace(/(\p{L})/u, (letra) => letra.toUpperCase());
    })
    .join(' ');
}

const EMOJIS = /[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu;
const MARCA = /NOCHE\s*(?:DE\s*)?D?\s*10\b/gi;

/** Ruido que no es ni invitado ni título: marca, pase, año, rótulos. */
const RUIDO = [
  EMOJIS,
  /#\S+/g,
  /[¡!*]+/g,
  MARCA,
  /\(?\b20\d{2}\)?/g,
  new RegExp(FECHAS.completa.source, 'g'),
  new RegExp(FECHAS.corta.source, 'g'),
  new RegExp(FECHAS.enLetras.source, 'gi'),
  new RegExp(`\\b${DIAS}\\b`, 'gi'),
  /\b(?:EN VIVO|ESTRENO|Beta Contenidos|(?:Primera|Segunda)?\s*Edici[oó]n|Entrevista Completa|PROGRAMA COMPLETO|OK|PGM|EXPO PRADO|ESPECIAL|EXCLUSIVA)\b/gi,
  /\b(?:Las Humoradas de Luis Orpi|Segmento de Humor(?: con Luis Orpi)?)\b/gi,
  // "EN NOCHE D10 / OCTUBRE 2024": el mes suelto, una vez que se fue el año.
  new RegExp(`/\\s*${MES_EN_LETRAS}\\s*$`, 'i'),
];

/** Columnas fijas y rótulos que aparecen en la lista pero no son personas. */
const NO_ES_INVITADO =
  /columna|tenencia|milanesa|adn forense|detr[aá]s del like|humorada|lanzamiento|temporada|programa|invitados|apertura|world wellness|alas para respirar|\bcap\b|cap[ií]tulo|^ep\b|\d/i;

const TITULOS_PROFESIONALES = /^(?:(?:dra?|psic|abg|lic|licenciado|abogada)\.?\s+)+/i;
const SEPARADORES = /\s*(?:\/+|\||,|•|·|\s[-–—]+\s|\s-{2,}\s*|\s[lL]\s)\s*/;

function limpiarRuido(titulo: string): string {
  return RUIDO.reduce((texto, patron) => texto.replace(patron, ' '), titulo)
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(?:[lL|/\-–]\s+|[|/\-–]+)+|(?:\s+[lL|/\-–]|[|/\-–]+)+$/g, '') // separadores sueltos en los bordes
    .trim();
}

function nombreDeUnaParte(parte: string, tituloEnMixto: boolean): string | null {
  const conQuien = parte.match(/\bcon\s+(.+)$/i);
  const candidato = (conQuien ? conQuien[1] : parte)
    .replace(/\([^)]*\)?/g, ' ') // contexto: banda, obra, cargo
    .replace(TITULOS_PROFESIONALES, '')
    .replace(/(?<!jr)[.:;\s-]+$/i, '')
    .replace(/^[\s:;-]+/, '')
    .trim();

  if (candidato.length < 3 || NO_ES_INVITADO.test(candidato)) return null;
  if (candidato.split(' ').length > 5) return null;
  // En un título en mixto, lo que arranca en minúscula es un rol: "cantante".
  if (tituloEnMixto && /^\p{Ll}/u.test(candidato)) return null;
  // Un apodo que quedó sin la comilla de cierre.
  const comillas = candidato.match(/["“”]/g)?.length ?? 0;
  return aNombrePropio(comillas % 2 === 1 ? `${candidato}"` : candidato);
}

/** Invitados que nombra un título, en el orden en que aparecen. */
export function invitadosDelTitulo(titulo: string): string[] {
  const disertantes = titulo.match(/Disertantes?:(.+)$/i);
  if (disertantes) {
    return disertantes[1]
      .split(/[•·,]/)
      .map((parte) => parte.trim())
      .filter((parte) => parte.length > 2)
      .map(aNombrePropio);
  }

  // "X en Noche D10" y "X: en Noche D10", ya sin la marca.
  let texto = limpiarRuido(titulo).replace(/\s*:?\s+en$/i, '');
  const sinFiltros = texto.match(/^(.+?),?\s+SIN FILTROS?\b/i);
  if (sinFiltros) texto = sinFiltros[1];
  else if (texto.includes(':')) return []; // título editorial sin nombre claro

  const enMixto = texto !== texto.toUpperCase();
  const nombres = texto
    .split(SEPARADORES)
    .map((parte) => nombreDeUnaParte(parte, enMixto))
    .filter((nombre): nombre is string => nombre !== null);
  return [...new Set(nombres)];
}

/** Título presentable: sin emojis ni marca, y sin gritar. */
function tituloLimpio(titulo: string, invitados: string[]): string {
  const texto = titulo
    .replace(EMOJIS, '')
    .replace(/#\S+/g, '')
    .replace(MARCA, '')
    .replace(/\bD10\b/gi, '')
    .replace(/[!¡]+/g, '')
    .replace(/\(\s*20\d{2}\s*\)/g, '')
    .replace(new RegExp(`/\\s*(?:${MES_EN_LETRAS}\\s+)?20\\d{2}\\s*$`, 'i'), '') // "/ Octubre 2024"
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(?:[lL|/\-–]\s+|[|/\-–]+)+|(?:\s+[lL|/\-–]|[|/\-–]+)+$/g, '')
    .replace(/\s+en$/i, '') // "X en Noche D10" sin la marca
    .trim();
  if (texto !== texto.toUpperCase()) return texto;

  let oracion = texto.toLowerCase().replace(/\p{L}/u, (letra) => letra.toUpperCase());
  for (const nombre of invitados) {
    const escapado = nombre.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    oracion = oracion.replace(new RegExp(escapado, 'i'), nombre);
  }
  return oracion;
}

/** Por qué un video no entra al archivo, o null si entra. */
export function descartar(entrada: EntradaDeFeed): MotivoDeDescarte | null {
  // TODO: dato pendiente del cliente — ¿"TODO D10" (2020) es Noche D10 u otro programa?
  if (/^\s*TODO D10\b/i.test(entrada.titulo)) return 'todo-d10';
  if (entrada.segundos <= LARGO_DE_UN_SHORT) return 'short';
  return null;
}

function tipoDelRecorte(titulo: string): TipoDePieza {
  if (/Humoradas? de Luis Orpi|Segmento de Humor/i.test(titulo)) return 'humor';
  if (/Disertantes?:|\bcolumna\b/i.test(titulo)) return 'columna';
  return 'entrevista';
}

export function clasificar(entrada: EntradaDeFeed): PiezaClasificada {
  const titulo = entrada.titulo.replace(/\s+/g, ' ').trim();
  const invitados = invitadosDelTitulo(titulo);
  const base = {
    videoId: entrada.videoId,
    tituloOriginal: entrada.titulo,
    publicado: entrada.publicado,
    duracion: formatearDuracion(entrada.segundos),
    invitados,
  };

  if (entrada.segundos >= UNA_HORA) {
    const fecha = fechaDesdeTitulo(titulo, entrada.publicado);
    return {
      ...base,
      tipo: 'emision',
      pase: /EN VIVO/i.test(titulo)
        ? 'vivo'
        : /ESTRENO/i.test(titulo)
          ? 'estreno'
          : 'unico',
      fechaEmision: fecha ?? fechaEnMontevideo(entrada.publicado),
      fechaDeducida: fecha === null,
      titulo: invitados.length > 0 ? invitados.join(' / ') : 'Programa completo',
    };
  }

  const tipo = tipoDelRecorte(titulo);
  const rotulado =
    /Entrevista Completa|Humoradas? de Luis Orpi|Segmento de Humor/i.test(titulo);
  const disertantes = titulo.match(/^(.+?)\s*-?\s*Disertantes?:/i);
  return {
    ...base,
    tipo,
    pase: null,
    fechaEmision: null,
    fechaDeducida: false,
    titulo: disertantes
      ? disertantes[1].replace(/[“”"]/g, '').replace(/\s+/g, ' ').trim()
      : rotulado && invitados.length > 0
        ? invitados.join(' / ')
        : tituloLimpio(titulo, invitados),
  };
}
