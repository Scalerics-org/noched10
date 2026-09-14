/**
 * Dominio: interpretar los títulos del canal de YouTube.
 *
 * Todo lo de acá son funciones puras. No hay fetch, no hay archivos, no hay
 * red: se testea con `node --test` sin levantar nada. El que sale a buscar el
 * feed es `herramientas/traer-feed.mjs`, que es el adaptador.
 *
 * TRAMPA: el canal no usa un formato de título, usa cinco, y mezcla dos
 * separadores distintos — la barra `|` y una `l` minúscula, que a ojo son la
 * misma cosa y para una regex no. Los cinco formatos están abajo con un
 * ejemplo real cada uno. Si aparece un sexto, se agrega acá con su caso de
 * prueba, no se parchea en la página.
 */

export type TipoDePieza = 'emision' | 'entrevista' | 'humor' | 'columna' | 'musica';

export type EntradaDeFeed = {
  videoId: string;
  titulo: string;
  publicado: string; // ISO
  descripcion: string;
};

export type PiezaClasificada = {
  videoId: string;
  tipo: TipoDePieza;
  titulo: string;
  tituloOriginal: string;
  publicado: string;
  /** Fecha de la emisión a la que pertenece, si el título la trae. */
  fechaEmision: string | null;
  /** Si es una emisión: 'vivo' o 'estreno'. Si no, null. */
  pase: 'vivo' | 'estreno' | null;
  invitados: string[];
};

/** Los dos separadores que usa el canal para lo mismo. */
const SEPARADOR = /\s*(?:\||\bl\b|\bL\b)\s*/;

/**
 * `18-08-26` → `2026-08-18`.
 * El canal escribe el año con dos dígitos y siempre es 20xx.
 */
export function fechaDesdeTitulo(texto: string): string | null {
  const encontrado = texto.match(/(\d{2})-(\d{2})-(\d{2})\b/);
  if (!encontrado) return null;
  const [, dia, mes, anio] = encontrado;
  return `20${anio}-${mes}-${dia}`;
}

/**
 * Los títulos vienen en mayúsculas de imprenta. Esto los pasa a algo
 * presentable sin romper comillas ni abreviaturas.
 *
 * No es perfecto y no puede serlo: "JR." o "DE LIMA" no se resuelven con una
 * regla. Lo que salga mal se corrige a mano en `src/datos/curaduria.ts`, que
 * pisa a esta función.
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
      // Respeta comillas de apodo: "turco" → "Turco"
      return palabra.replace(/([\p{L}])/u, (letra) => letra.toUpperCase());
    })
    .join(' ');
}

/**
 * Separa la parte del título que lista invitados.
 * `A / B / C` y `A - B` son los dos separadores que usa el canal.
 * Lo que va entre paréntesis es contexto de la banda, no un invitado más.
 */
export function separarInvitados(texto: string): string[] {
  return texto
    .split(/\s*\/\s*|\s+-\s+/)
    .map((parte) => parte.replace(/\s*\([^)]*\)\s*/g, ' ').trim())
    .filter((parte) => parte.length > 1)
    .map(aNombrePropio);
}

/**
 * Le saca a un pedazo de título la marca del programa, que a veces va sola y
 * a veces pegada al nombre del invitado ("NOCHE D10 SERGIO SOSA").
 */
function sinMarca(parte: string): string {
  return parte.replace(/^\s*NOCHE\s*(?:DE\s*)?D?10\s*/i, '').trim();
}

/**
 * Clasifica una entrada del feed. Devuelve null si el título no encaja en
 * ningún formato conocido: eso es información, no un error. Queda listado en
 * la salida del script para que alguien lo mire.
 */
export function clasificar(entrada: EntradaDeFeed): PiezaClasificada | null {
  const titulo = entrada.titulo.replace(/\s+/g, ' ').trim();
  const base = {
    videoId: entrada.videoId,
    tituloOriginal: entrada.titulo,
    publicado: entrada.publicado,
  };

  // 1. Emisión en vivo — "NOCHE DE 10 | Edición - 13-08-26 - EN VIVO"
  if (/^NOCHE DE 10/i.test(titulo) && /EN VIVO/i.test(titulo)) {
    const fecha = fechaDesdeTitulo(titulo);
    return {
      ...base,
      tipo: 'emision',
      pase: 'vivo',
      fechaEmision: fecha,
      titulo: fecha ? `Emisión del ${fecha}` : 'Emisión en vivo',
      invitados: [],
    };
  }

  // 2. Estreno del programa completo —
  //    "NOCHE DE 10 | A / B / C l 18-08-26 - ESTRENO"
  if (/^NOCHE DE 10/i.test(titulo) && /ESTRENO/i.test(titulo)) {
    const fecha = fechaDesdeTitulo(titulo);
    const partes = titulo.split(SEPARADOR);
    const listado = partes
      .slice(1)
      .find((parte) => !/^\s*\d{2}-\d{2}-\d{2}/.test(parte));
    const invitados = listado ? separarInvitados(listado) : [];
    return {
      ...base,
      tipo: 'emision',
      pase: 'estreno',
      fechaEmision: fecha,
      titulo: invitados.length > 0 ? invitados.join(' / ') : 'Programa completo',
      invitados,
    };
  }

  // 3. Segmento de humor — "NOCHE D10 l EL GUAPO MALAVIA l Las Humoradas..."
  if (/Las Humoradas de Luis Orpi|Segmento de Humor/i.test(titulo)) {
    const partes = titulo.split(SEPARADOR).map((parte) => sinMarca(parte));
    const medio = partes.find(
      (parte) => parte.length > 1 && !/Humorada|Segmento de Humor/i.test(parte),
    );
    const invitados = medio ? separarInvitados(medio) : [];
    return {
      ...base,
      tipo: 'humor',
      pase: null,
      fechaEmision: null,
      titulo:
        invitados.length > 0 ? invitados.join(' / ') : 'Las Humoradas de Luis Orpi',
      invitados,
    };
  }

  // 4. Columna — '"Tenencia Compartida" 2 CAP - Disertantes: A • B'
  if (/Disertantes?:/i.test(titulo)) {
    const [tema, disertantes = ''] = titulo.split(/Disertantes?:/i);
    return {
      ...base,
      tipo: 'columna',
      pase: null,
      fechaEmision: null,
      titulo: tema
        .replace(/[“”"]/g, '')
        .replace(/\s*-\s*$/, '')
        .trim(),
      invitados: disertantes
        .split(/[•·,]/)
        .map((parte) => parte.trim())
        .filter((parte) => parte.length > 1)
        .map(aNombrePropio),
    };
  }

  // 5. Entrevista completa — "NOCHE D10 l ANITA VALIENTE l Entrevista Completa"
  if (/Entrevista Completa/i.test(titulo)) {
    const partes = titulo.split(SEPARADOR).map((parte) => sinMarca(parte));
    const medio = partes.find(
      (parte) => parte.length > 1 && !/Entrevista Completa/i.test(parte),
    );
    const invitados = medio ? separarInvitados(medio) : [];
    return {
      ...base,
      tipo: 'entrevista',
      pase: null,
      fechaEmision: null,
      titulo: invitados.length > 0 ? invitados.join(' / ') : titulo,
      invitados,
    };
  }

  // 6. Formato viejo — "Sonora Palacio en Noche D10"
  const viejo = titulo.match(/^(.+?)\s+en\s+Noche\s*D?\s*10\s*$/i);
  if (viejo) {
    return {
      ...base,
      tipo: 'entrevista',
      pase: null,
      fechaEmision: null,
      titulo: aNombrePropio(viejo[1]),
      invitados: separarInvitados(viejo[1]),
    };
  }

  // 7. Entrevista en formato editorial —
  //    "ROBERT SILVA, SIN FILTROS: Gobierno... l NOCHE D10"
  if (/NOCHE D10\s*$/i.test(titulo) || /SIN FILTROS/i.test(titulo)) {
    const sinMarca = titulo.replace(/\s*(?:\||\bl\b)\s*NOCHE D10\s*$/i, '').trim();
    // "ROBERT SILVA, SIN FILTROS:" y "SERGIO SECINARO SIN FILTROS:" — con coma
    // y sin coma. Se corta en el primero de los dos que aparezca.
    const nombre = sinMarca.split(/\s*,?\s*SIN FILTROS|\s*:\s*/i)[0];
    return {
      ...base,
      tipo: 'entrevista',
      pase: null,
      fechaEmision: null,
      titulo: sinMarca.trim(),
      invitados: nombre ? [aNombrePropio(nombre)] : [],
    };
  }

  return null;
}
