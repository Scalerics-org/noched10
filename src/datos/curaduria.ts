/**
 * Curaduría: lo que el parser no puede saber y una persona sí.
 *
 * El canal da tipo, duración, invitados y video. No da el tema, no sabe
 * escribir las tildes que el canal se come en los títulos, muchos programas
 * viejos no traen la fecha de emisión y no siempre queda claro a qué emisión
 * pertenece un recorte.
 *
 * Esto pisa lo que viene del feed. Es el único lugar donde se corrige a mano:
 * nunca editar `feed.json`, que lo regenera el script. Cada corrida de
 * `npm run feed` lista lo que conviene mirar y a qué constante de acá va.
 */

/**
 * Nombres tal cual los escribe el canal → nombre correcto.
 * El canal titula en mayúsculas y sin tildes; acá se arregla una vez y vale
 * para la ficha del invitado, el buscador y el JSON-LD.
 */
export const nombres: Record<string, string> = {
  'Carlos Alberto Rodriguez': 'Carlos Alberto Rodríguez',
  'Maria de Lima': 'María de Lima',
};

/** Tema de cada invitado. Define los filtros del archivo. */
export const temaPorInvitado: Record<string, string> = {
  'Sergio Secinaro': 'política',
  'Robert Silva': 'política',
  'Alejandro Quintino': 'espectáculos',
  'Eduardo Acevedo': 'deporte',
  'María de Lima': 'política',
  'Washington "Turco" Abdala': 'política',
  'Anita Valiente': 'música',
  'Carlos Alberto Rodríguez': 'música',
  'Carlos Goberna Jr.': 'música',
  'Marcel Goberna': 'música',
  'Sergio Sosa': 'humor',
  'El Guapo Malavia': 'humor',
};

/**
 * Recortes que hay que reasignar a mano a una emisión.
 * Clave: videoId del recorte. Valor: videoId del programa completo.
 *
 * Sólo hace falta cuando el agrupado automático se equivoca — ver la trampa
 * del agrupado en `src/dominio/emisiones.ts`.
 */
export const emisionPorVideo: Record<string, string> = {};

/**
 * Fecha de emisión correcta de un programa. Clave: videoId. Valor: AAAA-MM-DD.
 *
 * Hace falta cuando el título no trae la fecha y el ingestor usó la de
 * publicación, que en las tandas subidas con atraso (2022) no es la del aire.
 */
export const fechaPorVideo: Record<string, string> = {};

/** Piezas que no queremos mostrar (pruebas, duplicados, subidas por error). */
export const ocultas: string[] = [];
