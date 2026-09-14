/**
 * Metadatos del sitio y navegación.
 * Fuente de verdad única: si un texto aparece en dos lugares, en algún
 * momento van a discrepar.
 */
export const sitio = {
  nombre: 'Noche D10',
  // TODO: dominio pendiente de definir y comprar con el cliente.
  url: 'http://localhost:4321',
  /** Bajada corta: va en el <title> de la home y en el manifiesto. */
  bajada: 'Magazine uruguayo de entrevistas, música en vivo y humor',
  descripcion:
    'Tu punto de encuentro con la cultura, el análisis y el entretenimiento. ' +
    'Entrevistas sobre la realidad nacional, momentos musicales exclusivos y ' +
    'charlas sobre bienestar, hace 16 años.',
  idioma: 'es-UY',
  /**
   * Imagen para compartir. Es una placa provisoria armada con los tokens de
   * marca, sin el escudo, porque todavía no tenemos el logo en vectorial.
   * TODO: dato pendiente del cliente — escudo de Noche D10 en SVG.
   */
  imagenOg: '/og-noche-d10.png',
} as const;

export const navegacion = [
  { texto: 'Programas', href: '/programas' },
  { texto: 'Entrevistas', href: '/entrevistas' },
  { texto: 'Invitados', href: '/invitados' },
  { texto: 'Equipo', href: '/equipo' },
  { texto: '16 años', href: '/16-anos' },
  { texto: 'Dónde vernos', href: '/donde-vernos' },
  { texto: 'Anunciantes', href: '/anunciantes' },
] as const;

export const redes = [
  { nombre: 'YouTube', href: 'https://www.youtube.com/@produccionesD10' },
  { nombre: 'Instagram', href: 'https://www.instagram.com/producciones.d10/' },
  { nombre: 'Facebook', href: 'https://www.facebook.com/noched10/' },
  { nombre: 'Spotify', href: 'https://open.spotify.com/show/1WFY043VAfTkKc1OpxVIuD' },
] as const;
