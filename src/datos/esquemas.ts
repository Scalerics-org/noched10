/**
 * JSON-LD.
 *
 * Esto no es decoración: es la mitad del valor del sitio. Un archivo de 3.000
 * capítulos con 6.800 nombres propios sin datos estructurados es invisible
 * para Google más allá del título de la página. Con TVEpisode y Person bien
 * puestos, cada invitado se vuelve una entidad y el archivo empieza a traer
 * tráfico de cola larga solo.
 *
 * El programa va por radio Y por televisión, así que la serie se declara dos
 * veces —TVSeries y RadioSeries— sobre el mismo @id, que es la forma correcta
 * de decir "es la misma obra en dos medios".
 */
import { programa, plataformas, emision as emisionEnVivo } from './programa';
import { sitio } from './sitio';
import { direccion } from './equipo';
import { duracionISO, formatearFecha } from './texto';
import { urlDeEmision, urlDeInvitado, urlDePieza } from './archivo';

type Json = Record<string, unknown>;

/** Convierte una ruta del sitio en URL absoluta. schema.org las quiere así. */
const absoluta = (ruta: string, base: URL | string) => new URL(ruta, base).href;

/** @id estables: así los distintos bloques hablan de la misma entidad. */
export const idDe = {
  sitio: (base: URL | string) => `${absoluta('/', base)}#sitio`,
  productora: (base: URL | string) => `${absoluta('/', base)}#productora`,
  serie: (base: URL | string) => `${absoluta('/', base)}#serie`,
};

export function organizacion(base: URL | string): Json {
  return {
    '@type': 'Organization',
    '@id': idDe.productora(base),
    name: 'Producciones D10',
    url: absoluta('/', base),
    founder: direccion.map((persona) => ({
      '@type': 'Person',
      name: persona.nombre,
      jobTitle: persona.rol,
    })),
    // TODO: dato pendiente del cliente — logo en vectorial, dirección y teléfono.
  };
}

export function paginaWeb(base: URL | string): Json {
  return {
    '@type': 'WebSite',
    '@id': idDe.sitio(base),
    name: sitio.nombre,
    url: absoluta('/', base),
    inLanguage: sitio.idioma,
    publisher: { '@id': idDe.productora(base) },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: absoluta('/buscar?q={search_term_string}', base),
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** Datos comunes a las dos declaraciones de la serie. */
function serieBase(base: URL | string): Json {
  return {
    '@id': idDe.serie(base),
    name: sitio.nombre,
    alternateName: 'Noche D10 — Producciones D10',
    url: absoluta('/', base),
    description: sitio.descripcion,
    inLanguage: sitio.idioma,
    countryOfOrigin: { '@type': 'Country', name: 'Uruguay' },
    productionCompany: { '@id': idDe.productora(base) },
    numberOfEpisodes: programa.capitulosAprox,
    genre: ['Magazine', 'Entrevistas', 'Música', 'Humor'],
    sameAs: plataformas.filter((p) => p.href).map((p) => p.href),
  };
}

/** La serie en sus dos medios. Mismo @id, dos tipos. */
export function serie(base: URL | string): Json[] {
  return [
    { '@type': 'TVSeries', ...serieBase(base) },
    { '@type': 'RadioSeries', ...serieBase(base) },
  ];
}

type DatosDeEmision = {
  fecha: string;
  numero: number | null;
  titulo: string;
  duracion: string;
  descripcion: string;
  videoId: string | null;
  invitados: string[];
};

export function episodio(emision: DatosDeEmision, base: URL | string): Json {
  return {
    '@type': 'TVEpisode',
    '@id': `${absoluta(urlDeEmision(emision), base)}#episodio`,
    name: emision.titulo,
    description: emision.descripcion,
    url: absoluta(urlDeEmision(emision), base),
    datePublished: emision.fecha,
    timeRequired: duracionISO(emision.duracion),
    inLanguage: sitio.idioma,
    // Sin numeración confirmada no se inventa un episodeNumber: un número
    // equivocado le dice a Google que dos capítulos distintos son el mismo.
    ...(emision.numero !== null ? { episodeNumber: emision.numero } : {}),
    partOfSeries: { '@type': 'TVSeries', '@id': idDe.serie(base) },
    actor: emision.invitados.map((nombre) => ({
      '@type': 'Person',
      name: nombre,
      url: absoluta(urlDeInvitado(nombre), base),
    })),
    productionCompany: { '@id': idDe.productora(base) },
  };
}

type DatosDePieza = {
  titulo: string;
  resumen: string;
  duracion: string;
  videoId: string | null;
  fecha: string;
  invitados: string[];
};

export function video(pieza: DatosDePieza, base: URL | string, portada: string): Json {
  return {
    '@type': 'VideoObject',
    '@id': `${absoluta(urlDePieza(pieza.titulo), base)}#video`,
    name: pieza.titulo,
    description: pieza.resumen,
    url: absoluta(urlDePieza(pieza.titulo), base),
    // uploadDate es obligatorio para VideoObject. Usamos la fecha de emisión,
    // que es el dato real que tenemos.
    uploadDate: pieza.fecha,
    duration: duracionISO(pieza.duracion),
    inLanguage: sitio.idioma,
    thumbnailUrl: pieza.videoId
      ? `https://i.ytimg.com/vi/${pieza.videoId}/maxresdefault.jpg`
      : absoluta(portada, base),
    ...(pieza.videoId
      ? {
          embedUrl: `https://www.youtube-nocookie.com/embed/${pieza.videoId}`,
          contentUrl: `https://www.youtube.com/watch?v=${pieza.videoId}`,
        }
      : {}),
    isPartOf: { '@id': idDe.serie(base) },
    publisher: { '@id': idDe.productora(base) },
    actor: pieza.invitados.map((nombre) => ({
      '@type': 'Person',
      name: nombre,
      url: absoluta(urlDeInvitado(nombre), base),
    })),
  };
}

type DatosDeInvitado = {
  nombre: string;
  slug: string;
  rol: string | null;
  bio: string | null;
  apariciones: { titulo: string; fecha: string }[];
};

export function persona(invitado: DatosDeInvitado, base: URL | string): Json {
  const ultima = invitado.apariciones[0];
  return {
    '@type': 'Person',
    '@id': `${absoluta(urlDeInvitado(invitado.nombre), base)}#persona`,
    name: invitado.nombre,
    url: absoluta(urlDeInvitado(invitado.nombre), base),
    ...(invitado.rol ? { jobTitle: invitado.rol } : {}),
    ...(invitado.bio ? { description: invitado.bio } : {}),
    subjectOf: invitado.apariciones.map((aparicion) => ({
      '@type': 'TVEpisode',
      name: aparicion.titulo,
      datePublished: aparicion.fecha,
      url: absoluta(urlDePieza(aparicion.titulo), base),
      partOfSeries: { '@type': 'TVSeries', '@id': idDe.serie(base) },
    })),
    ...(ultima
      ? {
          performerIn: {
            '@type': 'TVEpisode',
            name: ultima.titulo,
            datePublished: ultima.fecha,
          },
        }
      : {}),
  };
}

export function migas(
  items: { nombre: string; ruta: string }[],
  base: URL | string,
): Json {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, indice) => ({
      '@type': 'ListItem',
      position: indice + 1,
      name: item.nombre,
      item: absoluta(item.ruta, base),
    })),
  };
}

/**
 * La emisión en vivo como evento recurrente. Sin hora confirmada no se
 * publica: un horario inventado en un BroadcastEvent es peor que no tenerlo.
 * TODO: dato pendiente del cliente — hora exacta de emisión.
 */
export function emisionEnVivoDeclarable(): boolean {
  return horaConfirmada() !== null;
}

/**
 * La hora que sale de las descripciones del canal no es un dato hasta que el
 * cliente la confirme: mientras tanto se trata como si no existiera.
 */
export function horaConfirmada(): string | null {
  return emisionEnVivo.horarioConfirmado ? emisionEnVivo.hora : null;
}

/** Texto plano del horario, reutilizado por la barra fija y por el JSON-LD. */
export function textoDeEmision(): string {
  const { dia, frecuencia, reestreno } = emisionEnVivo;
  const hora = horaConfirmada();
  const cuando = hora ? `los ${dia} a las ${hora}` : `todos los ${dia}`;
  return `Programa ${frecuencia}, ${cuando}, con reestreno los ${reestreno}`;
}

export const ultimaActualizacion = (iso: string) => formatearFecha(iso);
