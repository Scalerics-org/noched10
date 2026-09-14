/**
 * Curaduría: lo que el parser no puede saber y una persona sí.
 *
 * El feed de YouTube da tipo, fecha, invitados y video. No da el tema, no
 * sabe escribir las tildes que el canal se come en los títulos, y no siempre
 * deja claro a qué emisión pertenece una entrevista suelta.
 *
 * Esto pisa lo que viene del feed. Es el único lugar donde se corrige a mano:
 * nunca editar `feed.json`, que lo regenera el script.
 */

/**
 * Nombres tal cual los escribe el canal → nombre correcto.
 * El canal titula en mayúsculas y sin tildes; acá se arregla una vez y vale
 * para la ficha del invitado, el buscador y el JSON-LD.
 */
export const nombres: Record<string, string> = {
  'Carlos Alberto Rodriguez': 'Carlos Alberto Rodríguez',
  'Maria De Lima': 'María de Lima',
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
 * Piezas que hay que reasignar a mano a una emisión.
 * Clave: videoId. Valor: fecha de la emisión (ISO).
 *
 * Solo hace falta cuando el agrupado automático se equivoca — ver la trampa
 * del agrupado en `emisiones.ts`.
 */
export const emisionPorVideo: Record<string, string> = {};

/** Piezas que no queremos mostrar (pruebas, duplicados, subidas por error). */
export const ocultas: string[] = [];
