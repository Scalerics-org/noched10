# Changelog

Todos los cambios notables de Noche D10.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [No publicado]

### Agregado

- Andamiaje inicial: Astro 7 estático, Tailwind 4, TypeScript, sitemap.
- Piso mínimo de archivos según el manual de arranque de Scalerics.
- Datos del cliente relevados en `src/datos/`.
- Ingesta automática del canal de YouTube: parser de títulos en `src/dominio/`
  con 19 tests, script `traer-feed.ts` y workflow que corre miércoles y viernes.
- Curaduría a mano en `src/datos/curaduria.ts`, que pisa lo que trae el feed.

### Corregido

- El horario de emisión: el programa sale en vivo los jueves y se reestrena los
  martes, no al revés. Las dos publicaciones son una sola emisión.
- La conducción: Yessy López, Charly Álvarez y Luis Orpi, confirmado contra las
  descripciones del canal.
