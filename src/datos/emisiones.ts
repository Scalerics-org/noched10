/**
 * Emisiones y piezas.
 *
 * Cada emisión genera cuatro tipos de pieza y ése es el modelo que importa:
 * el programa completo (~2 h), una entrevista por invitado, el segmento de
 * humor y, a veces, una columna. Si esto se modela como "una lista de videos"
 * se pierde toda la navegación interesante.
 *
 * Los datos de abajo son reales, sacados del canal @produccionesD10 el
 * 14/09/2026, para poder maquetar contra contenido de verdad.
 */
export type TipoDePieza = 'entrevista' | 'humor' | 'columna' | 'musica';

export type Pieza = {
  titulo: string;
  tipo: TipoDePieza;
  videoId: string | null;
  duracion: string;
  invitados: string[];
  temas: string[];
};

export type Emision = {
  fecha: string; // ISO
  titulo: string;
  videoId: string | null;
  duracion: string;
  invitados: string[];
  piezas: Pieza[];
};

// TODO: los videoId reales se completan cuando se arme el ingestor del canal.
export const emisiones: Emision[] = [
  {
    fecha: '2026-08-18',
    titulo: 'Sergio Secinaro / Robert Silva / Alejandro Quintino',
    videoId: null,
    duracion: '2:02:31',
    invitados: ['Sergio Secinaro', 'Robert Silva', 'Alejandro Quintino'],
    piezas: [
      {
        titulo:
          'Sergio Secinaro sin filtros: “Hay cosas que muchos no se animan a decir”',
        tipo: 'entrevista',
        videoId: null,
        duracion: '39:19',
        invitados: ['Sergio Secinaro'],
        temas: ['política'],
      },
      {
        titulo:
          'Robert Silva, sin filtros: gobierno, oposición, Partido Colorado y lo que viene',
        tipo: 'entrevista',
        videoId: null,
        duracion: '38:58',
        invitados: ['Robert Silva'],
        temas: ['política'],
      },
      {
        titulo: 'Alejandro Quintino',
        tipo: 'entrevista',
        videoId: null,
        duracion: '16:20',
        invitados: ['Alejandro Quintino'],
        temas: ['política'],
      },
      {
        titulo: 'Sergio Sosa — Las Humoradas de Luis Orpi',
        tipo: 'humor',
        videoId: null,
        duracion: '13:03',
        invitados: ['Sergio Sosa'],
        temas: ['humor'],
      },
    ],
  },
  {
    fecha: '2026-08-11',
    titulo: 'Carlos Alberto Rodríguez / Eduardo Acevedo / Alejandro Quintino',
    videoId: null,
    duracion: '2:04:23',
    invitados: ['Carlos Alberto Rodríguez', 'Eduardo Acevedo', 'Alejandro Quintino'],
    piezas: [
      {
        titulo: 'Eduardo Acevedo',
        tipo: 'entrevista',
        videoId: null,
        duracion: '25:59',
        invitados: ['Eduardo Acevedo'],
        temas: ['política'],
      },
      {
        titulo: 'Carlos Alberto Rodríguez',
        tipo: 'entrevista',
        videoId: null,
        duracion: '27:22',
        invitados: ['Carlos Alberto Rodríguez'],
        temas: ['sociedad'],
      },
      {
        titulo: 'Washington “Turco” Abdala',
        tipo: 'entrevista',
        videoId: null,
        duracion: '33:42',
        invitados: ['Washington “Turco” Abdala'],
        temas: ['política'],
      },
      {
        titulo: 'Anita Valiente',
        tipo: 'entrevista',
        videoId: null,
        duracion: '27:11',
        invitados: ['Anita Valiente'],
        temas: ['música'],
      },
    ],
  },
  {
    fecha: '2026-08-04',
    titulo: 'Mae Susana Andrade / Dito Galeano / Las Humoradas de Luis Orpi',
    videoId: null,
    duracion: '1:41:26',
    invitados: ['Mae Susana Andrade', 'Dito Galeano'],
    piezas: [
      {
        titulo: 'Mae Susana Andrade',
        tipo: 'entrevista',
        videoId: null,
        duracion: '29:25',
        invitados: ['Mae Susana Andrade'],
        temas: ['sociedad'],
      },
      {
        titulo: 'Dito Galeano',
        tipo: 'entrevista',
        videoId: null,
        duracion: '25:13',
        invitados: ['Dito Galeano'],
        temas: ['música'],
      },
      {
        titulo: 'María de Lima — 190 años del Partido Nacional',
        tipo: 'entrevista',
        videoId: null,
        duracion: '23:19',
        invitados: ['María de Lima'],
        temas: ['política'],
      },
      {
        titulo: 'El Guapo Malavia — Las Humoradas de Luis Orpi',
        tipo: 'humor',
        videoId: null,
        duracion: '15:17',
        invitados: ['El Guapo Malavia'],
        temas: ['humor'],
      },
      {
        titulo: 'Carlos Goberna Jr. y Marcel Goberna (Orquesta La Decana)',
        tipo: 'musica',
        videoId: null,
        duracion: '19:48',
        invitados: ['Carlos Goberna Jr.', 'Marcel Goberna'],
        temas: ['música'],
      },
    ],
  },
  {
    fecha: '2026-07-28',
    titulo: 'Fabricio Speranza / Luis “Ronco” López / Gonzalo “El Pela” Romero',
    videoId: null,
    duracion: '1:50:00',
    invitados: ['Fabricio Speranza', 'Luis “Ronco” López', 'Gonzalo “El Pela” Romero'],
    piezas: [
      {
        titulo: 'Fabricio Speranza',
        tipo: 'entrevista',
        videoId: null,
        duracion: '26:27',
        invitados: ['Fabricio Speranza'],
        temas: ['espectáculos'],
      },
      {
        titulo: 'Luis “Ronco” López',
        tipo: 'entrevista',
        videoId: null,
        duracion: '37:03',
        invitados: ['Luis “Ronco” López'],
        temas: ['espectáculos'],
      },
      {
        titulo: 'Gonzalo “El Pela” Romero',
        tipo: 'entrevista',
        videoId: null,
        duracion: '16:07',
        invitados: ['Gonzalo “El Pela” Romero'],
        temas: ['deporte'],
      },
      {
        titulo: 'Tomás Pedetti — Las Humoradas de Luis Orpi',
        tipo: 'humor',
        videoId: null,
        duracion: '16:57',
        invitados: ['Tomás Pedetti'],
        temas: ['humor'],
      },
    ],
  },
  {
    fecha: '2026-07-21',
    titulo: 'Niusa Samba / Fernando Tetes / Luigi Mega',
    videoId: null,
    duracion: '1:45:00',
    invitados: ['Niusa Samba', 'Fernando Tetes', 'Luigi Mega'],
    piezas: [
      {
        titulo: 'Niusa Samba',
        tipo: 'entrevista',
        videoId: null,
        duracion: '28:18',
        invitados: ['Niusa Samba'],
        temas: ['música'],
      },
      {
        titulo: 'Fernando Tetes',
        tipo: 'entrevista',
        videoId: null,
        duracion: '27:47',
        invitados: ['Fernando Tetes'],
        temas: ['espectáculos'],
      },
      {
        titulo: 'Luigi Mega (Los Iracundos)',
        tipo: 'entrevista',
        videoId: null,
        duracion: '20:22',
        invitados: ['Luigi Mega'],
        temas: ['música'],
      },
    ],
  },
  {
    fecha: '2026-07-14',
    titulo: 'Jorge “Superman” Seré / Jorge Bonica',
    videoId: null,
    duracion: '1:40:00',
    invitados: ['Jorge “Superman” Seré', 'Jorge Bonica'],
    piezas: [
      {
        titulo: 'Jorge “Superman” Seré',
        tipo: 'entrevista',
        videoId: null,
        duracion: '29:05',
        invitados: ['Jorge “Superman” Seré'],
        temas: ['deporte'],
      },
      {
        titulo: 'Jorge Bonica sin filtros',
        tipo: 'entrevista',
        videoId: null,
        duracion: '18:48',
        invitados: ['Jorge Bonica'],
        temas: ['espectáculos'],
      },
    ],
  },
  {
    fecha: '2026-07-07',
    titulo: 'Sonora Palacio / María Julia Muñoz',
    videoId: null,
    duracion: '1:45:00',
    invitados: ['Sonora Palacio', 'María Julia Muñoz'],
    piezas: [
      {
        titulo: 'Sonora Palacio en Noche D10',
        tipo: 'musica',
        videoId: null,
        duracion: '36:06',
        invitados: ['Sonora Palacio'],
        temas: ['música'],
      },
      {
        titulo: 'María Julia Muñoz en Noche D10',
        tipo: 'entrevista',
        videoId: null,
        duracion: '29:32',
        invitados: ['María Julia Muñoz'],
        temas: ['política'],
      },
    ],
  },
  {
    fecha: '2026-06-30',
    titulo: 'Nelson Pino / Tenencia compartida',
    videoId: null,
    duracion: '1:40:00',
    invitados: ['Nelson Pino'],
    piezas: [
      {
        titulo: 'Nelson Pino en Noche D10',
        tipo: 'entrevista',
        videoId: null,
        duracion: '36:10',
        invitados: ['Nelson Pino'],
        temas: ['música'],
      },
      {
        titulo: 'Tenencia compartida — capítulo 2',
        tipo: 'columna',
        videoId: null,
        duracion: '30:05',
        invitados: ['Raúl Menéndez', 'Marcel Mantero'],
        temas: ['sociedad'],
      },
    ],
  },
];

/** Categorías del archivo, derivadas de los invitados que recibe el programa. */
export const temas = [
  'política',
  'música',
  'deporte',
  'espectáculos',
  'sociedad',
  'humor',
] as const;

/** Todas las piezas, aplanadas, para las listas y el buscador. */
export const piezas = emisiones.flatMap((emision) =>
  emision.piezas.map((pieza) => ({ ...pieza, fecha: emision.fecha })),
);

/** Índice de invitados con todas sus apariciones. Es el oro para SEO. */
export const invitados = [...new Set(piezas.flatMap((pieza) => pieza.invitados))]
  .sort((a, b) => a.localeCompare(b, 'es'))
  .map((nombre) => ({
    nombre,
    apariciones: piezas.filter((pieza) => pieza.invitados.includes(nombre)),
  }));
