/**
 * Equipo del programa.
 *
 * CONDUCCIÓN: resuelta. Las descripciones de los videos del canal acreditan
 * "CONDUCEN: Charly Alvarez, Yessy López, Luis Orpi" en las emisiones de
 * agosto de 2026, y "Conducción: Yessy López y Charly Álvarez" en las
 * entrevistas. Coincide con la bio de Instagram.
 *
 * La nota de aniversario de Crónicas del Este menciona a Robert Moré y Sabrina
 * Floras como conductores 2026: es información vieja o de otro tramo del año.
 * Gana el canal, que es la fuente más reciente y más específica.
 */
export type Persona = {
  nombre: string;
  rol: string;
  instagram: string | null;
  bio: string | null;
  foto: string | null;
};

export const direccion: Persona[] = [
  {
    nombre: 'Luis Betarte',
    rol: 'Dirección general',
    instagram: null,
    bio:
      'Comunicador rosarino radicado en Colonia, egresado de Comunicación. ' +
      'Más de 1.800 producciones artísticas y eventos.',
    foto: null,
  },
  {
    nombre: 'Matías Bidegaray',
    rol: 'Producción general',
    instagram: null,
    bio: null,
    foto: null,
  },
];

export const conduccion: Persona[] = [
  {
    nombre: 'Yessy López',
    rol: 'Conducción',
    instagram: 'yessylopez37',
    bio: null,
    foto: null,
  },
  {
    nombre: 'Charly Álvarez',
    rol: 'Conducción',
    instagram: 'charlyalvarez_actor',
    bio: null,
    foto: null,
  },
  {
    nombre: 'Luis Orpi',
    rol: 'Humor',
    instagram: 'luisorpi.humor',
    bio: null,
    foto: null,
  },
];

export const columnistas: Persona[] = [
  {
    nombre: 'Gustavo Álvarez',
    rol: 'Psicología forense',
    instagram: null,
    bio: null,
    foto: null,
  },
  {
    nombre: 'Raúl Menéndez',
    rol: 'Tenencia compartida',
    instagram: null,
    bio: null,
    foto: null,
  },
  {
    nombre: 'Marcel Mantero',
    rol: 'Tenencia compartida',
    instagram: null,
    bio: null,
    foto: null,
  },
  { nombre: 'Luis Silvera', rol: 'Deporte', instagram: null, bio: null, foto: null },
  {
    // Aparece en las descripciones del canal conduciendo junto a Luis Betarte.
    // TODO: confirmar en qué segmento o programa participa.
    nombre: 'Dra. Andrea Ramírez Ponzo',
    rol: 'Columnista',
    instagram: null,
    bio: null,
    foto: null,
  },
];

/** Pasaron por la conducción en estos 16 años. Material para /16-anos. */
export const conductoresHistoricos = [
  'Fernando Vilar',
  'Marcelo Fernández',
  'Elsa Levrero',
  'Bananita González',
  'Karina Vignola',
  'Cinthia Caballero',
  'Gaspar Valverde',
] as const;
