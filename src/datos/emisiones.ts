/**
 * Emisiones y piezas, armadas a partir de lo que trajo el feed del canal
 * (`feed.json`) y corregidas con `curaduria.ts`.
 *
 * Esto es dominio: no sale a buscar nada. El que habla con YouTube es
 * `herramientas/traer-feed.ts`, y corre aparte del build.
 *
 * TRAMPA DEL DOBLE PASE: cada programa se publica dos veces — en vivo un
 * jueves y en estreno diferido el martes siguiente — con dos videos y dos
 * fechas distintas en el título. Es una sola emisión y acá se fusionan; la
 * fecha que queda es la del vivo. Si se saca esta fusión, el archivo muestra
 * todo duplicado.
 *
 * TRAMPA DEL AGRUPADO: las entrevistas sueltas no dicen en el título a qué
 * emisión pertenecen — solo tienen fecha de publicación, que además suele ser
 * anterior al estreno del programa completo. Así que cada pieza se cuelga de
 * la emisión más cercana dentro de una ventana de 10 días. Es una heurística,
 * no un dato: cuando se equivoca, se corrige en `curaduria.emisionPorVideo`,
 * y esa corrección gana siempre.
 */
import feed from './feed.json' with { type: 'json' };
import { emisionPorVideo, nombres, ocultas, temaPorInvitado } from './curaduria';
import type { PiezaClasificada, TipoDePieza } from '../dominio/feed';

export type { TipoDePieza };

export type Pieza = {
  videoId: string;
  tipo: TipoDePieza;
  titulo: string;
  publicado: string;
  invitados: string[];
  temas: string[];
};

export type Emision = {
  fecha: string;
  titulo: string;
  videoEnVivo: string | null;
  videoEstreno: string | null;
  invitados: string[];
  piezas: Pieza[];
};

const VENTANA_EN_DIAS = 10;
const UN_DIA = 86_400_000;

const corregirNombre = (nombre: string) => nombres[nombre] ?? nombre;

const crudas = (feed.piezas as PiezaClasificada[])
  .filter((pieza) => !ocultas.includes(pieza.videoId))
  .map((pieza) => ({ ...pieza, invitados: pieza.invitados.map(corregirNombre) }));

const aPieza = (pieza: (typeof crudas)[number]): Pieza => ({
  videoId: pieza.videoId,
  tipo: pieza.tipo,
  titulo: pieza.titulo,
  publicado: pieza.publicado,
  invitados: pieza.invitados,
  temas: [
    ...new Set(
      pieza.invitados
        .map((invitado) => temaPorInvitado[invitado])
        .filter((t): t is string => !!t),
    ),
  ],
});

// Una emisión puede tener dos videos: el vivo y el estreno diferido.
const porFecha = new Map<string, Emision>();
for (const pieza of crudas) {
  if (pieza.tipo !== 'emision' || !pieza.fechaEmision) continue;
  const emision = porFecha.get(pieza.fechaEmision) ?? {
    fecha: pieza.fechaEmision,
    titulo: '',
    videoEnVivo: null,
    videoEstreno: null,
    invitados: [],
    piezas: [],
  };
  if (pieza.pase === 'vivo') emision.videoEnVivo = pieza.videoId;
  if (pieza.pase === 'estreno') emision.videoEstreno = pieza.videoId;
  if (pieza.invitados.length > 0) {
    emision.invitados = [...new Set([...emision.invitados, ...pieza.invitados])];
  }
  porFecha.set(pieza.fechaEmision, emision);
}

// El programa sale dos veces: en vivo un jueves y en estreno diferido el martes
// siguiente, cada uno con su video y su fecha en el título. Son la MISMA
// emisión. Sin esto, el archivo muestra cada programa duplicado y las
// entrevistas se cuelgan del pase equivocado.
// La fecha que queda es la del vivo, que es cuando realmente salió al aire.
const VENTANA_DEL_REESTRENO_EN_DIAS = 7;

for (const [fecha, emision] of [...porFecha.entries()].sort()) {
  if (!emision.videoEstreno || emision.videoEnVivo) continue;
  const estreno = new Date(`${fecha}T00:00:00Z`).getTime();

  const vivo = [...porFecha.entries()]
    .filter(([otraFecha, otra]) => {
      if (otraFecha === fecha || !otra.videoEnVivo) return false;
      const dias = (estreno - new Date(`${otraFecha}T00:00:00Z`).getTime()) / UN_DIA;
      return dias > 0 && dias <= VENTANA_DEL_REESTRENO_EN_DIAS;
    })
    .sort(([a], [b]) => b.localeCompare(a))[0];

  if (!vivo) continue;
  const [, emisionEnVivo] = vivo;
  emisionEnVivo.videoEstreno = emision.videoEstreno;
  emisionEnVivo.invitados = [
    ...new Set([...emisionEnVivo.invitados, ...emision.invitados]),
  ];
  emisionEnVivo.piezas.push(...emision.piezas);
  porFecha.delete(fecha);
}

const fechasDeEmision = [...porFecha.keys()].sort();

function emisionDe(pieza: (typeof crudas)[number]): string | null {
  const forzada = emisionPorVideo[pieza.videoId];
  if (forzada) return forzada;

  const publicado = new Date(pieza.publicado).getTime();
  let mejor: string | null = null;
  let distanciaMinima = Infinity;
  for (const fecha of fechasDeEmision) {
    const distancia =
      Math.abs(publicado - new Date(`${fecha}T00:00:00Z`).getTime()) / UN_DIA;
    if (distancia < distanciaMinima && distancia <= VENTANA_EN_DIAS) {
      distanciaMinima = distancia;
      mejor = fecha;
    }
  }
  return mejor;
}

for (const pieza of crudas) {
  if (pieza.tipo === 'emision') continue;
  const fecha = emisionDe(pieza);
  if (!fecha) continue;
  porFecha.get(fecha)?.piezas.push(aPieza(pieza));
}

for (const emision of porFecha.values()) {
  emision.invitados = [
    ...new Set([
      ...emision.invitados,
      ...emision.piezas.flatMap((pieza) => pieza.invitados),
    ]),
  ];
  emision.titulo =
    emision.invitados.length > 0
      ? emision.invitados.join(' / ')
      : `Emisión del ${emision.fecha}`;
}

/** Emisiones de la más nueva a la más vieja. */
export const emisiones: Emision[] = [...porFecha.values()].sort((a, b) =>
  b.fecha.localeCompare(a.fecha),
);

/** Todas las piezas sueltas, para listados y buscador. */
export const piezas: Pieza[] = crudas.filter((p) => p.tipo !== 'emision').map(aPieza);

/** Piezas que quedaron sin emisión: se ven igual, pero conviene revisarlas. */
export const huerfanas: Pieza[] = crudas
  .filter((pieza) => pieza.tipo !== 'emision' && !emisionDe(pieza))
  .map(aPieza);

export const temas = [
  'política',
  'música',
  'deporte',
  'espectáculos',
  'sociedad',
  'humor',
] as const;

/** Índice de invitados con todas sus apariciones. Es el oro para SEO. */
export const invitados = [...new Set(piezas.flatMap((pieza) => pieza.invitados))]
  .sort((a, b) => a.localeCompare(b, 'es'))
  .map((nombre) => ({
    nombre,
    tema: temaPorInvitado[nombre] ?? null,
    apariciones: piezas.filter((pieza) => pieza.invitados.includes(nombre)),
  }));
