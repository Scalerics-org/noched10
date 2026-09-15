// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

import { sitio } from './src/datos/sitio';

// Sitio estático. `site` sale de src/datos/sitio.ts y no se escribe acá:
// cuando esté definido el dominio se cambia en un solo lugar y de ahí lo
// toman el canonical, el sitemap, el robots.txt y el JSON-LD.
export default defineConfig({
  site: sitio.url,
  trailingSlash: 'never',

  integrations: [
    sitemap({
      // El buscador y el 404 no aportan nada en el sitemap.
      filter: (pagina) => !pagina.includes('/buscar'),
    }),
  ],

  image: {
    // astro:assets con sharp: de acá salen los AVIF de las miniaturas.
    service: { entrypoint: 'astro/assets/services/sharp' },
  },

  build: {
    // Hoja de estilos chica va inline; eso saca un request del camino crítico.
    inlineStylesheets: 'auto',
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
