/**
 * Fichas de invitados.
 *
 * El índice se DERIVA de las emisiones: un invitado existe porque aparece en
 * una pieza, nunca porque alguien lo escribió a mano en dos lugares. Lo único
 * que se carga acá es lo que no se puede derivar — bio, foto y rol —, y hoy
 * eso es material que el cliente todavía no nos pasó.
 *
 * TODO: dato pendiente del cliente — bios y fotos de los invitados.
 */
import { emisiones, type Pieza } from './emisiones';
import { aSlug } from './texto';

export type FichaManual = {
  /** Cómo se lo presenta: 'Senador', 'Cantante', 'Humorista'. */
  rol: string | null;
  bio: string | null;
  /** Ruta dentro de src/imagenes/invitados/ cuando exista el material. */
  foto: string | null;
};

/**
 * Datos que no se derivan. Mientras esté vacío, las fichas se publican con el
 * nombre y las apariciones, que es información real y suficiente para el SEO.
 * No se inventan bios: una bio equivocada de una persona pública es un
 * problema del cliente, no un detalle de maquetado.
 */
export const fichasManuales: Record<string, FichaManual> = {};

export type Invitado = {
  nombre: string;
  slug: string;
  rol: string | null;
  bio: string | null;
  foto: string | null;
  /** Temas en los que participó, derivados de sus piezas. */
  temas: string[];
  apariciones: (Pieza & { fecha: string; slug: string })[];
};

/**
 * Todas las piezas, aplanadas y con su fecha, su emisión y un slug propio.
 *
 * El slug sale del título, pero con 500 videos los títulos se repiten (el
 * mismo invitado vuelve, "Programa completo"): si dos piezas compartieran
 * slug, la content collection pisaría una con la otra en silencio. La primera
 * en salir se queda el slug limpio; las siguientes llevan la fecha.
 */
const usados = new Set<string>();
export const piezas = [...emisiones]
  .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.slug.localeCompare(b.slug))
  .flatMap((emision) =>
    emision.piezas.map((pieza) => {
      const base = aSlug(pieza.titulo) || 'pieza';
      let slug = usados.has(base) ? `${base}-${emision.slug}` : base;
      for (let n = 2; usados.has(slug); n++) slug = `${base}-${emision.slug}-${n}`;
      usados.add(slug);
      return { ...pieza, fecha: emision.fecha, emision: emision.slug, slug };
    }),
  );

/**
 * Índice de invitados con todas sus apariciones. Es el activo de SEO más
 * grande del sitio: 6.800 nombres propios que hoy no tienen dónde caer.
 */
// Los nombres salen de los recortes y también de los títulos de los programas:
// en el histórico viejo muchos invitados no tienen un recorte propio.
export const invitados: Invitado[] = [
  ...new Set([
    ...piezas.flatMap((p) => p.invitados),
    ...emisiones.flatMap((e) => e.invitados),
  ]),
]
  .sort((a, b) => a.localeCompare(b, 'es'))
  .map((nombre) => {
    const apariciones = piezas
      .filter((pieza) => pieza.invitados.includes(nombre))
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
    const ficha = fichasManuales[aSlug(nombre)];
    return {
      nombre,
      slug: aSlug(nombre),
      rol: ficha?.rol ?? null,
      bio: ficha?.bio ?? null,
      foto: ficha?.foto ?? null,
      temas: [...new Set(apariciones.flatMap((pieza) => pieza.temas))],
      apariciones,
    };
  });

export const invitadoPorSlug = (slug: string) =>
  invitados.find((invitado) => invitado.slug === slug);
