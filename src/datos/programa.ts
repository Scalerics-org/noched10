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
    nombre: 'VIVO TV',
    tipo: 'television',
    // TODO: confirmar el nombre exacto de la señal. La nota de prensa dice
    // "Radio Nacional TV" y el Instagram acredita a @vivotvuy.
    detalle: 'señal abierta',
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
 * Horario de emisión.
 * Los estrenos publicados en YouTube (04/08, 11/08 y 18/08 de 2026) caen los
 * tres martes, así que el programa es semanal y va los martes.
 * TODO: falta el horario exacto, y si radio y TV coinciden.
 */
export const emision = {
  dia: 'martes',
  hora: null,
  frecuencia: 'semanal',
  duracionAprox: '2 horas',
} as const;

/** Causas con las que el programa trabaja. Es parte de su posicionamiento. */
export const alianzas = [
  { nombre: 'Manantiales', detalle: 'tratamiento de adicciones' },
  { nombre: 'Fundación Peluffo Giguens', detalle: null },
] as const;
