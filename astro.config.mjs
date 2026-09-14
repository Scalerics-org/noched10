// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Sitio estático. `site` se usa para canonical y sitemap: cuando esté
// definido el dominio, se cambia acá y en ningún otro lado.
export default defineConfig({
  site: 'http://localhost:4321',
  integrations: [sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },
});
