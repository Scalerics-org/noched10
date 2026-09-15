/**
 * Helpers de texto compartidos.
 *
 * Acá vive la ÚNICA forma de generar un slug. Si cada página lo calculara a su
 * manera, el link a /invitados/luis-ronco-lopez y la página que se genera en
 * /invitados/luís-“ronco”-lópez dejarían de coincidir y el archivo se rompe en
 * silencio: la página existe, el link tira 404 y nadie se entera hasta que lo
 * reporta Search Console.
 */

/** Slug estable: sin tildes, sin comillas de apodo, sin signos. */
export function aSlug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[“”"'’`´]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const fechaLarga = new Intl.DateTimeFormat('es-UY', { dateStyle: 'long' });
const fechaCorta = new Intl.DateTimeFormat('es-UY', { dateStyle: 'short' });
const diaYMes = new Intl.DateTimeFormat('es-UY', { day: 'numeric', month: 'long' });

/**
 * Las fechas del archivo son 'AAAA-MM-DD' sin hora. `new Date('2026-08-18')`
 * las interpreta en UTC y, al formatearlas en Montevideo (UTC-3), retrocede un
 * día: el programa del martes 18 aparecería como lunes 17. Por eso se arma la
 * fecha a mano en horario local.
 */
export function comoFecha(iso: string): Date {
  const [anio, mes, dia] = iso.split('-').map(Number);
  return new Date(anio, mes - 1, dia);
}

export const formatearFecha = (iso: string) => fechaLarga.format(comoFecha(iso));
export const formatearFechaCorta = (iso: string) => fechaCorta.format(comoFecha(iso));
export const formatearDiaYMes = (iso: string) => diaYMes.format(comoFecha(iso));

export const anioDe = (iso: string) => Number(iso.slice(0, 4));

/** 'h:mm:ss' o 'mm:ss' a segundos. */
export function duracionEnSegundos(duracion: string): number {
  const partes = duracion.split(':').map(Number);
  if (partes.some(Number.isNaN)) return 0;
  return partes.reduce((total, parte) => total * 60 + parte, 0);
}

/**
 * Duración en ISO 8601, que es lo único que entiende schema.org.
 * '2:02:31' se convierte en 'PT2H2M31S'.
 */
export function duracionISO(duracion: string): string {
  const total = duracionEnSegundos(duracion);
  const horas = Math.floor(total / 3600);
  const minutos = Math.floor((total % 3600) / 60);
  const segundos = total % 60;
  const cuerpo =
    `${horas ? `${horas}H` : ''}${minutos ? `${minutos}M` : ''}` +
    `${segundos ? `${segundos}S` : ''}`;
  return `PT${cuerpo || '0S'}`;
}

/** 'Lista, de, nombres' en castellano: 'a, b y c'. */
export function enumerar(items: readonly string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
}
