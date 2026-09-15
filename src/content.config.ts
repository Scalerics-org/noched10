/**
 * Colecciones de contenido.
 *
 * El dato sigue viviendo en src/datos/ (regla 3): estas colecciones no son una
 * segunda copia, son la misma fuente pasada por un schema de Zod. Lo que gana
 * el sitio con esto es que un dato mal cargado rompe el build con un mensaje
 * claro en vez de renderizar `undefined` en una página publicada, y que las
 * relaciones entre emisión, pieza e invitado las valida Astro con reference().
 *
 * Por eso el loader es propio y no `glob()`: no hay markdown que leer, hay un
 * módulo de TypeScript que ya es la verdad.
 */
import { defineCollection, reference } from 'astro:content';
import { z } from 'astro/zod';
import type { Loader } from 'astro/loaders';

import { emisionesOrdenadas } from './datos/archivo';
import { invitados, piezas } from './datos/invitados';
import { aSlug, enumerar, formatearFecha } from './datos/texto';

/** Loader genérico sobre un array ya armado en src/datos/. */
function desdeDatos<T extends { id: string }>(
  nombre: string,
  filas: () => T[],
): Loader {
  return {
    name: `d10-${nombre}`,
    load: async ({ store, parseData }) => {
      store.clear();
      for (const fila of filas()) {
        const { id, ...resto } = fila;
        store.set({ id, data: await parseData({ id, data: resto }) });
      }
    },
  };
}

/**
 * Descripciones y resúmenes: se arman con datos reales (fecha, invitados,
 * tipo de pieza) en vez de inventar bajadas editoriales. Cuando el cliente
 * mande los textos reales, se reemplaza esta función y nada más.
 *
 * TODO: dato pendiente del cliente — bajadas escritas de cada emisión y pieza.
 */
const nombreDePieza: Record<string, string> = {
  entrevista: 'Entrevista',
  humor: 'Segmento de humor',
  columna: 'Columna',
  musica: 'Música en vivo',
};

const emisionesCollection = defineCollection({
  loader: desdeDatos('emisiones', () =>
    emisionesOrdenadas.map((emision) => ({
      id: emision.slug,
      slug: emision.slug,
      fecha: emision.fecha,
      numero: emision.numero,
      titulo: emision.titulo,
      videoId: emision.videoId,
      duracion: emision.duracion,
      invitados: emision.invitados.map(aSlug),
      descripcion:
        `Programa completo de Noche D10 del ${formatearFecha(emision.fecha)}, ` +
        `de ${emision.duracion}` +
        (emision.invitados.length > 0 ? `, con ${enumerar(emision.invitados)}.` : '.'),
    })),
  ),
  schema: z.object({
    slug: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}(-\d+)?$/,
        'El slug es la fecha, con sufijo si se repite',
      ),
    fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha va en formato AAAA-MM-DD'),
    numero: z.number().int().positive().nullable(),
    titulo: z.string().min(1),
    videoId: z.string().nullable(),
    duracion: z.string().regex(/^\d{1,2}:\d{2}(:\d{2})?$/, 'Duración en h:mm:ss'),
    invitados: z.array(reference('invitados')),
    descripcion: z.string().min(1),
  }),
});

const piezasCollection = defineCollection({
  loader: desdeDatos('piezas', () =>
    piezas.map((pieza) => ({
      id: pieza.slug,
      tipo: pieza.tipo,
      titulo: pieza.titulo,
      videoId: pieza.videoId,
      duracion: pieza.duracion,
      emision: pieza.emision,
      fecha: pieza.fecha,
      invitados: pieza.invitados.map(aSlug),
      temas: pieza.temas,
      resumen:
        `${nombreDePieza[pieza.tipo]}` +
        (pieza.invitados.length > 0 ? ` con ${enumerar(pieza.invitados)}` : '') +
        ` en Noche D10, ` +
        `emitida el ${formatearFecha(pieza.fecha)}. Duración: ${pieza.duracion}.`,
    })),
  ),
  schema: z.object({
    tipo: z.enum(['entrevista', 'humor', 'columna', 'musica']),
    titulo: z.string().min(1),
    videoId: z.string().nullable(),
    duracion: z.string().regex(/^\d{1,2}:\d{2}(:\d{2})?$/, 'Duración en h:mm:ss'),
    emision: reference('emisiones'),
    fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha va en formato AAAA-MM-DD'),
    invitados: z.array(reference('invitados')),
    temas: z.array(z.string()),
    resumen: z.string().min(1),
  }),
});

const invitadosCollection = defineCollection({
  loader: desdeDatos('invitados', () =>
    invitados.map((invitado) => ({
      id: invitado.slug,
      nombre: invitado.nombre,
      slug: invitado.slug,
      bio: invitado.bio,
      foto: invitado.foto,
      temas: invitado.temas,
      rol: invitado.rol,
      apariciones: invitado.apariciones.length,
    })),
  ),
  schema: z.object({
    nombre: z.string().min(1),
    slug: z.string().min(1),
    bio: z.string().nullable(),
    foto: z.string().nullable(),
    temas: z.array(z.string()),
    rol: z.string().nullable(),
    apariciones: z.number().int().nonnegative(),
  }),
});

export const collections = {
  emisiones: emisionesCollection,
  piezas: piezasCollection,
  invitados: invitadosCollection,
};
