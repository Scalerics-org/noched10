/**
 * Datos de contacto.
 *
 * TODO: dato pendiente del cliente — teléfono, correo y dirección reales.
 * Nada de esto se inventa: un teléfono equivocado publicado en un sitio con
 * 3.000 capítulos indexados se arrastra durante años en resultados de búsqueda
 * y en fichas de Google.
 */
export const contacto = {
  /** TODO: dato pendiente del cliente. */
  correoGeneral: null as string | null,
  /** TODO: dato pendiente del cliente. */
  correoPauta: null as string | null,
  /** TODO: dato pendiente del cliente. */
  telefono: null as string | null,
  /** TODO: dato pendiente del cliente — ¿estudio en Colonia o en Montevideo? */
  localidad: null as string | null,
  pais: 'Uruguay',
} as const;

/**
 * Mientras no haya backend ni correo confirmado, los formularios se envían a
 * un endpoint que todavía no existe. Se deja explícito y apagado: un form que
 * postea a un `action` inventado pierde consultas de pauta sin avisar.
 *
 * TODO: dato pendiente del cliente — definir si la consulta va por correo,
 * por Formspree o por un Worker propio.
 */
export const destinoDeFormularios = {
  action: null as string | null,
  method: 'post',
} as const;
