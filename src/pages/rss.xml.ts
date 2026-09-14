/**
 * Feed de emisiones. Sirve para lectores de RSS y, sobre todo, para que
 * cualquier agregador que siga al programa se entere de los capítulos nuevos
 * sin depender del RSS de YouTube.
 */
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

import { sitio } from '../datos/sitio';
import { urlDeEmision } from '../datos/archivo';
import { comoFecha } from '../datos/texto';

const escapar = (texto: string) =>
  texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL(sitio.url);

  const emisiones = (await getCollection('emisiones'))
    .sort((a, b) => b.data.fecha.localeCompare(a.data.fecha))
    .slice(0, 50);

  const items = emisiones
    .map((emision) => {
      const enlace = new URL(urlDeEmision(emision.data), base).href;
      return `    <item>
      <title>${escapar(emision.data.titulo)}</title>
      <link>${enlace}</link>
      <guid isPermaLink="true">${enlace}</guid>
      <pubDate>${comoFecha(emision.data.fecha).toUTCString()}</pubDate>
      <description>${escapar(emision.data.descripcion)}</description>
    </item>`;
    })
    .join('\n');

  const cuerpo = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapar(sitio.nombre)}</title>
    <link>${new URL('/', base).href}</link>
    <description>${escapar(sitio.descripcion)}</description>
    <language>${sitio.idioma}</language>
${items}
  </channel>
</rss>
`;

  return new Response(cuerpo, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};
