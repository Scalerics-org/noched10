/**
 * Reglas del archivo: paginación, filtros y las URLs que generan.
 *
 * Todo esto vive acá y no en las páginas por la regla 4: si una página decide
 * cuántas emisiones entran por pantalla o cómo se arma el link de un filtro,
 * en dos semanas hay tres respuestas distintas repartidas por src/pages/.
 *
 * Por qué los filtros son links y no un <select> con query params: el sitio es
 * estático. Un `?anio=2026` no puede cambiar lo que devuelve el servidor
 * porque no hay servidor, así que sin JS un form GET recargaría exactamente el
 * mismo HTML sin filtrar. Con rutas reales pre-renderizadas el filtro funciona
 * con JS apagado, es enlazable, es cacheable y además Google las indexa — cosa
 * que con query params no hace.
 */
import { emisiones, temas, type Emision } from './emisiones';
import { aSlug, anioDe } from './texto';

/** Cuántas emisiones por página. Con 3.000 capítulos esto define el sitemap. */
export const POR_PAGINA = 12;

/** Emisiones de la más nueva a la más vieja. El orden del archivo. */
export const emisionesOrdenadas: Emision[] = [...emisiones].sort((a, b) =>
  b.fecha.localeCompare(a.fecha),
);

export const ultimaEmision = emisionesOrdenadas[0];

/** Años con emisiones, del más nuevo al más viejo. */
export const anios = [...new Set(emisiones.map((e) => anioDe(e.fecha)))].sort(
  (a, b) => b - a,
);

/** Temas que efectivamente tienen piezas. No se ofrece un filtro vacío. */
export const temasConPiezas = temas.filter((tema) =>
  emisiones.some((e) => e.piezas.some((p) => p.temas.includes(tema))),
);

export const slugDeTema = (tema: string) => aSlug(tema);
export const temaPorSlug = (slug: string) =>
  temasConPiezas.find((tema) => aSlug(tema) === slug);

export type Filtro = { anio?: number; tema?: string };

export function filtrar(filtro: Filtro): Emision[] {
  return emisionesOrdenadas.filter((emision) => {
    if (filtro.anio && anioDe(emision.fecha) !== filtro.anio) return false;
    if (filtro.tema && !emision.piezas.some((p) => p.temas.includes(filtro.tema!)))
      return false;
    return true;
  });
}

/**
 * URL de una vista del archivo. Es la única función que sabe cómo se escriben
 * estas rutas: si mañana cambian, cambian acá.
 */
export function urlDelArchivo(filtro: Filtro = {}, pagina = 1): string {
  let ruta = '/programas';
  if (filtro.anio) ruta += `/ano/${filtro.anio}`;
  if (filtro.tema) ruta += `/tema/${slugDeTema(filtro.tema)}`;
  if (pagina > 1) ruta += `/pagina/${pagina}`;
  return ruta;
}

export const urlDeEmision = (emision: Pick<Emision, 'fecha'>) =>
  `/programas/${emision.fecha}`;
export const urlDePieza = (titulo: string) => `/entrevistas/${aSlug(titulo)}`;
export const urlDeInvitado = (nombre: string) => `/invitados/${aSlug(nombre)}`;

export type Pagina<T> = {
  items: T[];
  pagina: number;
  totalPaginas: number;
  total: number;
  urlAnterior: string | null;
  urlSiguiente: string | null;
};

export function paginar<T>(items: T[], pagina: number, filtro: Filtro = {}): Pagina<T> {
  const totalPaginas = Math.max(1, Math.ceil(items.length / POR_PAGINA));
  const actual = Math.min(Math.max(1, pagina), totalPaginas);
  return {
    items: items.slice((actual - 1) * POR_PAGINA, actual * POR_PAGINA),
    pagina: actual,
    totalPaginas,
    total: items.length,
    urlAnterior: actual > 1 ? urlDelArchivo(filtro, actual - 1) : null,
    urlSiguiente: actual < totalPaginas ? urlDelArchivo(filtro, actual + 1) : null,
  };
}

/**
 * Todas las combinaciones de filtro que se pre-renderizan, con sus páginas.
 * De acá salen los getStaticPaths del archivo: la página no arma rutas, las
 * consume.
 */
export function vistasDelArchivo(): { filtro: Filtro; pagina: number }[] {
  const combinaciones: Filtro[] = [
    {},
    ...anios.map((anio) => ({ anio })),
    ...temasConPiezas.map((tema) => ({ tema })),
    ...anios.flatMap((anio) => temasConPiezas.map((tema) => ({ anio, tema }))),
  ];

  return combinaciones.flatMap((filtro) => {
    const total = filtrar(filtro).length;
    if (total === 0) return [];
    const totalPaginas = Math.ceil(total / POR_PAGINA);
    return Array.from({ length: totalPaginas }, (_, i) => ({ filtro, pagina: i + 1 }));
  });
}

/** Título humano de una vista del archivo, para el <h1> y el <title>. */
export function tituloDelArchivo(filtro: Filtro): string {
  if (filtro.anio && filtro.tema)
    return `Programas de ${filtro.anio} sobre ${filtro.tema}`;
  if (filtro.anio) return `Programas de ${filtro.anio}`;
  if (filtro.tema) return `Programas sobre ${filtro.tema}`;
  return 'Todos los programas';
}
