/**
 * Consultas sobre las colecciones.
 *
 * Están acá y no repetidas en cada página por la regla 4: "la última emisión",
 * "las piezas de esta emisión" o "el nombre real de este invitado" son
 * decisiones del dominio. Si cada página las resuelve a su manera, alcanza con
 * que una ordene distinto para que el sitio se contradiga a sí mismo.
 */
import { getCollection, type CollectionEntry } from 'astro:content';

export type Emision = CollectionEntry<'emisiones'>;
export type Pieza = CollectionEntry<'piezas'>;
export type Invitado = CollectionEntry<'invitados'>;

/** Emisiones de la más nueva a la más vieja: el orden del archivo. */
export async function emisionesOrdenadas(): Promise<Emision[]> {
  const emisiones = await getCollection('emisiones');
  return emisiones.sort((a, b) => b.data.fecha.localeCompare(a.data.fecha));
}

export async function ultimaEmision(): Promise<Emision> {
  return (await emisionesOrdenadas())[0];
}

/** Piezas de la más nueva a la más vieja, según la fecha de su emisión. */
export async function piezasOrdenadas(): Promise<Pieza[]> {
  const piezas = await getCollection('piezas');
  return piezas.sort((a, b) => b.data.emision.id.localeCompare(a.data.emision.id));
}

export async function piezasDe(emision: Emision | string): Promise<Pieza[]> {
  const id = typeof emision === 'string' ? emision : emision.id;
  return (await piezasOrdenadas()).filter((pieza) => pieza.data.emision.id === id);
}

/**
 * Nombre real de cada invitado, por id.
 *
 * Hace falta porque el slug es de ida y no de vuelta: des-sluguear
 * 'luis-ronco-lopez' daría 'luis ronco lopez', no 'Luis “Ronco” López'.
 */
export async function nombresDeInvitados(): Promise<
  (refs: { id: string }[]) => string[]
> {
  const invitados = await getCollection('invitados');
  const porId = new Map(invitados.map((i) => [i.id, i.data.nombre]));
  return (refs) => refs.map((ref) => porId.get(ref.id) ?? ref.id);
}

/** Invitados con al menos una aparición, ordenados alfabéticamente en español. */
export async function invitadosOrdenados(): Promise<Invitado[]> {
  const invitados = await getCollection('invitados');
  return invitados
    .filter((invitado) => invitado.data.apariciones > 0)
    .sort((a, b) => a.data.nombre.localeCompare(b.data.nombre, 'es'));
}
