/**
 * Equipo del programa.
 *
 * TRAMPA: hay dos versiones de la conducción actual y no están resueltas.
 * - El Instagram (relevado 14/09/2026) acredita a Yessy López, Charly Álvarez
 *   y Luis Orpi.
 * - La nota de aniversario de Crónicas del Este menciona como conductores 2026
 *   a Robert Moré, Charly Álvarez y Sabrina Floras.
 * El único nombre que coincide es Charly Álvarez.
 * TODO: preguntarle al cliente quién conduce hoy antes de publicar esta página.
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

/** TODO: confirmar con el cliente. Ver la trampa de arriba. */
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
