/**
 * Datos duros del programa. Relevados el 14/09/2026 de fuentes públicas
 * (nota de Crónicas del Este, canal de YouTube, Instagram).
 * Lo marcado TODO hay que confirmarlo con el cliente antes de publicarlo.
 */
export const programa = {
  aniosAlAire: 16,
  capitulosAprox: 3000,
  invitadosAprox: 6800,
  videosEnYoutube: 496,
  canalYoutube: 'UCRIusH-9eFX3LztaqSRMtXQ',
} as const;

/** Los números que van en la franja del home, ya redondeados para mostrar. */
export const trayectoria = [
  { valor: '16', unidad: 'años', detalle: 'al aire, ininterrumpidos' },
  { valor: '3.000', unidad: 'programas', detalle: 'emitidos desde 2010' },
  { valor: '6.800', unidad: 'invitados', detalle: 'pasaron por el estudio' },
] as const;

/** Dónde se emite. Es el diferencial vendible para la pauta. */
export const plataformas = [
  {
    nombre: 'CX30 Radio Nacional',
    tipo: 'radio',
    detalle: 'AM 1130, Montevideo',
    href: 'https://x.com/lanacional1130',
  },
  {
    // El canal firma "VIVO TV — LA TREINTA" en las descripciones de sus
    // videos. "La Treinta" es como se conoce a CX30.
    nombre: 'VIVO TV La Treinta',
    tipo: 'television',
    detalle: 'señal de televisión',
    href: null,
  },
  {
    nombre: 'Canales de cable del interior',
    tipo: 'television',
    // TODO: pedirle al cliente la lista de canales y localidades.
    detalle: 'red de canales del interior del país',
    href: null,
  },
  {
    nombre: 'YouTube',
    tipo: 'streaming',
    detalle: 'programas completos y entrevistas',
    href: 'https://www.youtube.com/@produccionesD10',
  },
] as const;

/**
 * Cómo y cuándo sale el programa.
 *
 * Sale DOS VECES: en vivo los jueves, y en estreno diferido el martes
 * siguiente. Eso se ve en los títulos del canal: las "Edición - DD-MM-AA -
 * EN VIVO" caen jueves (06-08-26 y 13-08-26) y las "- ESTRENO" caen martes
 * (11-08-26 y 18-08-26), con los mismos invitados.
 *
 * El horario de las 22:00 sale de la descripción de una entrevista del canal:
 * "Entrevista en vivo: jueves 13 de agosto de 2026, 22:00 horas".
 *
 * OJO: las descripciones del canal se contradicen entre sí. Varias arrastran
 * un texto pegado que dice "Lunes a viernes 19 hs", que parece ser de otro
 * programa de la casa y no de éste. No inventamos: hay que preguntárselo al
 * cliente y recién ahí publicar un horario.
 */
export const emision = {
  dia: 'jueves',
  hora: '22:00',
  frecuencia: 'semanal',
  duracionAprox: '2 horas',
  reestreno: 'martes',
  horarioConfirmado: false,
} as const;

/** El canal rotula la temporada en curso como "Temporada 16". */
export const temporada = 16;

/** Causas con las que el programa trabaja. Es parte de su posicionamiento. */
export const alianzas = [
  { nombre: 'Manantiales', detalle: 'tratamiento de adicciones' },
  { nombre: 'Fundación Peluffo Giguens', detalle: null },
] as const;
