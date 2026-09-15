/**
 * TEXTO DE MAQUETA — NO ES DATO DEL CLIENTE.
 *
 * Todo lo que hay en este archivo sale tal cual del diseño de Claude Design
 * (canvas "Noche D10", pantallas 1a–2c) y se usa como placeholder visible por
 * decisión de Scalerics (14/09/2026), para mostrar el diseño con su densidad
 * real mientras el cliente no manda el material.
 *
 * Reglas para no romper nada:
 * - Nada de acá entra al JSON-LD, al sitemap ni a llms.txt. Google lo tomaría
 *   como dato verificado sobre personas reales.
 * - Cada bloque se reemplaza por el dato real y se borra de este archivo. El
 *   día que este archivo quede vacío, se borra entero.
 *
 * TODO: dato pendiente del cliente — reemplazar TODO el contenido de este archivo.
 */

/**
 * Próxima emisión según el diseño: martes 21:00, hora de Montevideo.
 * OJO: contradice lo relevado en programa.ts (vivo los jueves, 22:00, sin
 * confirmar). La cuenta regresiva usa esto hasta que el cliente confirme.
 */
export const proximaEmision = {
  /** 0 = domingo … 2 = martes. */
  diaDeLaSemana: 2,
  hora: 21,
  minuto: 0,
  etiqueta: 'Martes 21:00',
  /** Montevideo no tiene horario de verano desde 2015: UTC-3 fijo. */
  desfaseUtcEnHoras: -3,
  // TODO: URL real de la transmisión en vivo.
  urlEnVivo: 'https://www.youtube.com/@produccionesD10/live',
} as const;

/** "Emisión 2.987" del hero 1d, para la última emisión cargada. */
export const numeroDeLaUltimaEmision = 2987;

export const franjaDeNumeros = [
  {
    valor: '16',
    unidad: 'Años al aire',
    detalle: 'Ininterrumpidos desde 2010. Ningún año sin salir.',
    corto: 'Ininterrumpidos desde 2010.',
  },
  {
    valor: '3.000',
    unidad: 'Programas emitidos',
    detalle: 'Dos horas cada martes, por radio, TV y streaming.',
    corto: 'Dos horas cada martes.',
  },
  {
    valor: '6.800',
    unidad: 'Invitados',
    detalle: 'Media cultura uruguaya pasó por este estudio.',
    corto: 'Media cultura uruguaya.',
  },
] as const;

/** Barras de la trayectoria: una por año, 2010–2026. Alturas del diseño. */
export const barrasDeTrayectoria = [
  22, 27, 32, 38, 43, 48, 54, 59, 64, 70, 75, 80, 86, 91, 96, 100,
] as const;

export const humoradas = {
  bajada:
    'El bloque de humor del programa. Personajes, cuentos y visitas que se ' +
    'quedan más de lo previsto. Sale todos los martes, cerrando la segunda hora.',
  bajadaCorta: 'El bloque de humor, todos los martes al cierre.',
};

export const buscadosEstaSemana = [
  'Robert Silva',
  'Sonora Palacio',
  'Nelson Pino',
  'Jorge “Superman” Seré',
  'María Julia Muñoz',
] as const;

/** Detalle de cada plataforma en la home (1e). La clave es el tipo/nombre. */
export const accionesDePlataforma: Record<string, string> = {
  'CX30 Radio Nacional': 'Escuchar en vivo →',
  'VIVO TV La Treinta': 'Cómo sintonizar →',
  'Canales de cable del interior': 'Ver localidades →',
  YouTube: 'Ir al canal →',
};

export type MomentoDeMaqueta = { tiempo: string; texto: string };

export type EntrevistaDeMaqueta = {
  deQueSeHablo: string[];
  momentos: MomentoDeMaqueta[];
  temas: string[];
};

/** Ficha de entrevista 2a. Clave: slug de la pieza. */
export const entrevistas: Record<string, EntrevistaDeMaqueta> = {
  'robert-silva-sin-filtros-gobierno-oposicion-partido-colorado-y-lo-que-viene': {
    deQueSeHablo: [
      'El exvicepresidente y actual senador pasó por el estudio para hablar del ' +
        'momento del Partido Colorado, la relación con el resto de la coalición y ' +
        'su lectura de la agenda educativa que dejó como ministro.',
      'La charla arranca por la interna partidaria, sigue por la discusión ' +
        'presupuestal y cierra con un tramo sobre educación media y el rol de la ' +
        'UTU. Sobre el final, una pregunta de las que el programa hace desde hace ' +
        'dieciséis años: qué haría distinto.',
    ],
    momentos: [
      { tiempo: '00:00', texto: 'Presentación y el estado de la interna colorada' },
      {
        tiempo: '06:42',
        texto: '“La coalición se rompió antes de perder la elección”',
      },
      { tiempo: '14:18', texto: 'Presupuesto y prioridades para 2027' },
      { tiempo: '23:05', texto: 'Educación media, UTU y lo que quedó a medio camino' },
      { tiempo: '33:40', texto: 'Qué haría distinto' },
    ],
    temas: ['Política', 'Educación', 'Partido Colorado', 'Presupuesto'],
  },
};

export type AparicionHistorica = {
  fecha: string;
  titulo: string;
  tipo: string;
  tema: string;
  duracion: string;
};

export type InvitadoDeMaqueta = {
  rol: string;
  bio: string[];
  datos: { valor: string; etiqueta: string }[];
  /** Apariciones anteriores al archivo cargado. No tienen página propia. */
  historicas?: AparicionHistorica[];
};

/** Fichas de invitado 2a/2c y tarjetas 1a. Clave: slug del invitado. */
export const invitados: Record<string, InvitadoDeMaqueta> = {
  'robert-silva': {
    rol: 'Senador · Partido Colorado',
    bio: [
      'Abogado y docente. Fue presidente del CODICEN y vicepresidente de la ' +
        'República. Vino al programa dos veces desde 2019.',
    ],
    datos: [
      { valor: '2', etiqueta: 'Apariciones' },
      { valor: '2019', etiqueta: 'Primera vez' },
    ],
  },
  'nelson-pino': {
    rol: 'Cantante · tango y canción rioplatense',
    bio: [
      'Una de las voces más reconocibles del tango uruguayo. Grabó más de veinte ' +
        'discos, giró por Japón y España, y sigue cantando en salas de Montevideo ' +
        'y del interior.',
      'Pasó cuatro veces por el estudio: la primera en 2012, hablando del centenario ' +
        'de un clásico; la última en 2026, para presentar disco nuevo y cantar en vivo.',
    ],
    datos: [
      { valor: '4', etiqueta: 'Apariciones' },
      { valor: '2012', etiqueta: 'Primera vez' },
      { valor: '2', etiqueta: 'Temas en vivo' },
      { valor: '1:56', etiqueta: 'Horas de aire' },
    ],
    historicas: [
      {
        fecha: '2024-11-12',
        titulo: 'Dos tangos en el estudio',
        tipo: 'Música en vivo',
        tema: 'Música',
        duracion: '18:04',
      },
      {
        fecha: '2023-04-04',
        titulo: 'Sesenta años de escenario',
        tipo: 'Entrevista',
        tema: 'Música',
        duracion: '41:22',
      },
      {
        fecha: '2012-10-02',
        titulo: 'Primera visita: el centenario de un clásico',
        tipo: 'Entrevista',
        tema: 'Música',
        duracion: '20:12',
      },
    ],
  },
  'sonora-palacio': {
    rol: 'Cumbia · Montevideo',
    bio: [],
    datos: [{ valor: '5', etiqueta: 'Apariciones' }],
  },
  'luigi-mega': {
    rol: 'Los Iracundos',
    bio: [],
    datos: [{ valor: '1', etiqueta: 'Apariciones' }],
  },
  'anita-valiente': {
    rol: 'Cantante',
    bio: [],
    datos: [{ valor: '1', etiqueta: 'Apariciones' }],
  },
  'dito-galeano': {
    rol: 'Música tropical · también como Fernando Dito Galeano',
    bio: [],
    datos: [{ valor: '4', etiqueta: 'Apariciones' }],
  },
};

/**
 * Minutos al aire por año de un invitado (2c), 2010–2026. Alturas en % y color
 * del diseño: 'piso' es un año sin aparición.
 */
export const minutosPorAnio: readonly (readonly [
  number,
  'piso' | 'rojo' | 'vivo' | 'brasa',
])[] = [
  [26, 'piso'],
  [8, 'piso'],
  [34, 'rojo'],
  [8, 'piso'],
  [8, 'piso'],
  [44, 'rojo'],
  [8, 'piso'],
  [8, 'piso'],
  [8, 'piso'],
  [8, 'piso'],
  [8, 'piso'],
  [8, 'piso'],
  [68, 'vivo'],
  [8, 'piso'],
  [30, 'vivo'],
  [60, 'brasa'],
];
