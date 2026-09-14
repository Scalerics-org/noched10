# Changelog

Todos los cambios notables de Noche D10.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [No publicado]

### Agregado

- Andamiaje inicial: Astro 7 estático, Tailwind 4, TypeScript, sitemap.
- Piso mínimo de archivos según el manual de arranque de Scalerics.
- Datos del cliente relevados en `src/datos/`.
- Modelo de contenido con content collections y schema de Zod: `emisiones`,
  `piezas` e `invitados`, cargadas desde `src/datos/`.
- Sistema de tokens de marca con tema claro y oscuro, toggle `data-theme`
  persistido y escala tipográfica fluida.
- Home completa, archivo de programas con paginación real y filtros por año y
  tema que funcionan sin JavaScript.
- Páginas de emisión, pieza e invitado, con navegación cruzada.
- Fachada de YouTube: el iframe se inyecta recién al click.
- Buscador con Pagefind, indexado en el build.
- SEO: JSON-LD de serie, episodio, video, persona y migas; sitemap, robots,
  RSS, `llms.txt`, canonical, OG por página y favicons.
- Páginas `/equipo`, `/donde-vernos`, `/anunciantes`, `/contacto` y 404.
- README con la estructura real de archivos y la lista de datos pendientes.

### Pendiente de confirmar con el cliente

Ver la lista completa al final del README. Lo más urgente: quién conduce hoy
—hay dos versiones que no coinciden—, los `videoId` de YouTube y a dónde se
envían las consultas de pauta.
