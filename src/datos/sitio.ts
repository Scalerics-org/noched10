/**
 * Metadatos del sitio y navegación.
 * Fuente de verdad única: si un texto aparece en dos lugares, en algún
 * momento van a discrepar.
 */
export const sitio = {
  nombre: 'Noche D10',
  // Dirección provisoria de Cloudflare hasta que el cliente defina el dominio.
  // TODO: dato pendiente del cliente — el dominio definitivo.
  url: 'https://noched10.scalerics.workers.dev',
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

/**
 * Navegación principal.
 *
 * /16-anos quedó afuera a propósito: la página no existe todavía y un link
 * roto en la barra principal de todas las páginas es peor que una sección de
 * menos. Entra cuando el cliente pase el material del aniversario.
 * TODO: dato pendiente del cliente — material de los 16 años.
 */
export const navegacion = [
  { texto: 'Programas', href: '/programas' },
  { texto: 'Entrevistas', href: '/entrevistas' },
  { texto: 'Invitados', href: '/invitados' },
  { texto: 'Equipo', href: '/equipo' },
  { texto: 'Dónde vernos', href: '/donde-vernos' },
  { texto: 'Anunciantes', href: '/anunciantes' },
] as const;

export const redes = [
  { nombre: 'YouTube', href: 'https://www.youtube.com/@produccionesD10' },
  { nombre: 'Instagram', href: 'https://www.instagram.com/producciones.d10/' },
  { nombre: 'Facebook', href: 'https://www.facebook.com/noched10/' },
  { nombre: 'Spotify', href: 'https://open.spotify.com/show/1WFY043VAfTkKc1OpxVIuD' },
] as const;
