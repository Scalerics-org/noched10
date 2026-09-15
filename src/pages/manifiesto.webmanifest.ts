/** Manifiesto de la aplicación web, para que el sitio se pueda guardar en el inicio. */
import type { APIRoute } from 'astro';
import { sitio } from '../datos/sitio';

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify({
      name: sitio.nombre,
      short_name: 'Noche D10',
      description: sitio.bajada,
      lang: sitio.idioma,
      start_url: '/',
      display: 'standalone',
      background_color: '#0a0a0a',
      theme_color: '#0a0a0a',
      icons: [
        { src: '/icono-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icono-512.png', sizes: '512x512', type: 'image/png' },
      ],
    }),
    { headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' } },
  );
