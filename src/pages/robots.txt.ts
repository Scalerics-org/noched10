/**
 * robots.txt generado, no estático: así la URL del sitemap sale de
 * src/datos/sitio.ts y no queda apuntando a localhost cuando se publique.
 */
import type { APIRoute } from 'astro';
import { sitio } from '../datos/sitio';

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL(sitio.url);

  const cuerpo = `# ${sitio.nombre}
User-agent: *
Allow: /

# El buscador no tiene contenido propio: son resultados de lo que ya está
# indexado en las fichas.
Disallow: /buscar

Sitemap: ${new URL('/sitemap-index.xml', base).href}
`;

  return new Response(cuerpo, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
