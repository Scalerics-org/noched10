# Noche D10

Sitio del programa **Noche D10**, magazine uruguayo de entrevistas, música en vivo y
humor, al aire hace 16 años por CX30 Radio Nacional AM 1130, VIVO TV, la red de cables
del interior y YouTube. Lo hace Producciones D10. Cliente de Scalerics.

El sitio tiene dos trabajos y ninguno es ser un folleto institucional: hacer encontrable
un archivo de ~3.000 capítulos y captar pauta publicitaria.

> **Estado: demo previa a reunión.** No hay dominio, ni contrato firmado, ni material
> gráfico del cliente. Los datos que faltan están marcados con `TODO: dato pendiente del
cliente` — la lista está al final de este archivo.

## Stack

Astro 7 estático, TypeScript, Tailwind 4 y Pagefind. Sin framework de UI, sin CMS, sin
WebGL, sin GSAP. Las animaciones van con `animation-timeline: view()` de CSS y las
transiciones de página con `@view-transition` nativo. Se despliega en Cloudflare.

## Comandos

```bash
npm install
npm run dev        # http://localhost:4321
npm run verify     # format:check + lint + astro check + build — lo mismo que corre CI
npm run build      # genera dist/ e indexa el buscador con Pagefind
npm run preview    # sirve dist/ — es la única forma de probar el buscador
npx wrangler deploy
```

El buscador **no funciona en `npm run dev`**: Pagefind indexa el sitio ya construido,
así que el índice recién existe después de `npm run build`. En dev la página avisa en
vez de romperse.

## Estructura

### Configuración

| Archivo                                                                            | Qué hace                                                                         |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `astro.config.ts`                                                                  | Config de Astro. Toma `site` de `src/datos/sitio.ts` para no repetir el dominio. |
| `wrangler.jsonc`                                                                   | Deploy en Cloudflare. **Falta pegar el `account_id` de Scalerics.**              |
| `tsconfig.json`                                                                    | Extiende `astro/tsconfigs/strict`.                                               |
| `package.json`                                                                     | Scripts. `verify` corre lo mismo que CI.                                         |
| `.editorconfig`, `.gitattributes`, `.nvmrc`, `.prettierrc.json`, `.prettierignore` | Formato, fin de línea LF y versión de Node.                                      |
| `CHANGELOG.md`                                                                     | Formato Keep a Changelog.                                                        |
| `CLAUDE.md`                                                                        | Contexto del proyecto y reglas que no se negocian.                               |

### `src/datos/` — el dominio

Fuente de verdad única. Todo texto, dato y regla del negocio vive acá; ningún componente
ni página decide nada por su cuenta.

| Archivo          | Qué contiene                                                                     |
| ---------------- | -------------------------------------------------------------------------------- |
| `sitio.ts`       | Nombre, dominio, descripción, navegación y redes.                                |
| `programa.ts`    | Números del programa, plataformas de emisión, horario y alianzas.                |
| `emisiones.ts`   | Las 8 emisiones de ejemplo con sus piezas. Dato crudo, nada derivado.            |
| `equipo.ts`      | Dirección, conducción, columnistas y conductores históricos.                     |
| `invitados.ts`   | Índice de invitados derivado de las emisiones, más las fichas manuales.          |
| `archivo.ts`     | Paginación, filtros, armado de URLs y qué rutas se pre-renderizan.               |
| `consultas.ts`   | Consultas sobre las colecciones: última emisión, piezas de una emisión, nombres. |
| `esquemas.ts`    | Constructores de JSON-LD.                                                        |
| `texto.ts`       | Slug, formato de fechas y duraciones ISO 8601.                                   |
| `anunciantes.ts` | Formatos de pauta, argumentos de venta y campos del formulario.                  |
| `contacto.ts`    | Datos de contacto y destino de los formularios.                                  |

### `src/content.config.ts`

Tres colecciones con schema de Zod — `emisiones`, `piezas` e `invitados`— cargadas desde
`src/datos/` con un loader propio. No son una segunda copia del dato: son el mismo dato
validado. Un campo mal cargado rompe el build con un mensaje claro en vez de renderizar
`undefined` en una página publicada, y las relaciones emisión ↔ pieza ↔ invitado las
valida Astro con `reference()`.

### `src/componentes/`

| Archivo                    | Qué hace                                                |
| -------------------------- | ------------------------------------------------------- |
| `Cabezal.astro`            | Barra fija de próxima emisión y navegación.             |
| `PieDePagina.astro`        | Pie con el llamado a pauta.                             |
| `FachadaYoutube.astro`     | Miniatura + play que inyecta el iframe recién al click. |
| `TarjetaPieza.astro`       | Tarjeta de entrevista, humor, columna o música.         |
| `TarjetaEmision.astro`     | Emisión en el archivo, en grilla o en lista.            |
| `ListadoDelArchivo.astro`  | Cuerpo del archivo, compartido por las cuatro rutas.    |
| `FiltrosDelArchivo.astro`  | Filtros por año y tema, como links a rutas reales.      |
| `VistaDelArchivo.astro`    | Toggle grilla ↔ lista, persistido en localStorage.      |
| `Paginador.astro`          | Paginación con URLs propias.                            |
| `DatosEstructurados.astro` | Serializa el `@graph` de JSON-LD.                       |
| `CambioDeTema.astro`       | Toggle de tema claro/oscuro.                            |

### `src/pages/` — las rutas

| Archivo                           | URL                                                         |
| --------------------------------- | ----------------------------------------------------------- |
| `index.astro`                     | `/`                                                         |
| `programas/index.astro`           | `/programas`                                                |
| `programas/pagina/[pagina].astro` | `/programas/pagina/2`…                                      |
| `programas/ano/[...ruta].astro`   | `/programas/ano/2026`, `/programas/ano/2026/tema/politica`… |
| `programas/tema/[...ruta].astro`  | `/programas/tema/politica`…                                 |
| `programas/[fecha].astro`         | `/programas/2026-08-18`                                     |
| `entrevistas/index.astro`         | `/entrevistas`                                              |
| `entrevistas/[slug].astro`        | `/entrevistas/robert-silva-sin-filtros…`                    |
| `invitados/index.astro`           | `/invitados`                                                |
| `invitados/[slug].astro`          | `/invitados/robert-silva`                                   |
| `equipo.astro`                    | `/equipo`                                                   |
| `donde-vernos.astro`              | `/donde-vernos`                                             |
| `anunciantes.astro`               | `/anunciantes`                                              |
| `contacto.astro`                  | `/contacto`                                                 |
| `buscar.astro`                    | `/buscar`                                                   |
| `404.astro`                       | `/404`                                                      |
| `robots.txt.ts`                   | `/robots.txt`                                               |
| `rss.xml.ts`                      | `/rss.xml`                                                  |
| `llms.txt.ts`                     | `/llms.txt`                                                 |
| `manifiesto.webmanifest.ts`       | `/manifiesto.webmanifest`                                   |

El sitemap lo genera `@astrojs/sitemap` en `/sitemap-index.xml`.

### Otros

| Archivo                                                                                                    | Qué hace                                              |
| ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `src/layouts/Base.astro`                                                                                   | Layout único: `<head>` completo, SEO, JSON-LD y tema. |
| `src/estilos/global.css`                                                                                   | Tokens de marca, temas, grilla y animaciones.         |
| `scripts/generar-iconos.mjs`                                                                               | Genera favicons y placa OG. Se corre a mano.          |
| `scripts/bootstrap-repo.sh`, `.ps1`                                                                        | Arranque del repo según el manual de Scalerics.       |
| `public/favicon.ico`, `favicon.svg`, `icono-180.png`, `icono-192.png`, `icono-512.png`, `og-noche-d10.png` | Íconos y placa para compartir. **Provisorios.**       |

## Decisiones que conviene no revertir sin leer esto

**El iframe de YouTube nunca va directo.** Son ~900 KB y decenas de requests a terceros
antes de que nadie apriete play. Siempre por `FachadaYoutube.astro`.

**El archivo no usa scroll infinito.** Mata el pie de página, que es donde está el
contacto de pauta, y rompe el deep-linking y el SEO.

**Los filtros son links a rutas pre-renderizadas, no query params.** El sitio es
estático: sin servidor, un `?anio=2026` no puede cambiar lo que se devuelve, así que con
JavaScript apagado un `<form method="get">` recargaría el mismo HTML sin filtrar. Con
rutas reales el filtro funciona sin JS, se comparte, se cachea y Google lo indexa.

**Una emisión no es un video, son varias piezas.** El programa completo, una entrevista
por invitado, el humor y a veces una columna. Modelarlo como "lista de videos" pierde
toda la navegación.

**Ningún color se define únicamente adentro de un `@media`.** Todos viven en `:root`; el
media query y el `[data-theme]` sólo reasignan tokens que ya existen.

## Deploy

Es un sitio estático: el build produce `dist/` y eso es todo lo que se sirve.

1. Completar `account_id` en `wrangler.jsonc` con la cuenta de Cloudflare de Scalerics.
   Sin eso, si `wrangler` está logueado con una cuenta personal, el sitio del cliente
   queda fuera del control de la agencia.
2. Cuando esté el dominio, cambiar `url` en `src/datos/sitio.ts`. De ahí lo toman el
   canonical, el sitemap, el `robots.txt`, el RSS y el JSON-LD; no hay que tocar nada más.
3. `npm run verify` — tiene que pasar limpio.
4. `npx wrangler deploy`.

`wrangler.jsonc` sirve `dist/` con `html_handling: "drop-trailing-slash"`, que coincide
con el `trailingSlash: 'never'` de `astro.config.ts`: `/programas` se sirve directo, sin
redirección.

## Presupuesto de performance

Medido con Chromium sobre `npm run preview`, sin compresión (Cloudflare comprime, así que
en producción es menos):

|                       | Presupuesto | Medido en `/`            |
| --------------------- | ----------- | ------------------------ |
| Transferencia crítica | < 150 KB    | **45,8 KB** (3 requests) |
| JavaScript            | < 40 KB     | **1,4 KB**               |
| LCP                   | < 2,5 s     | **72 ms**                |
| CLS                   | < 0,1       | **0**                    |

Se vuelve a medir antes de cada commit que toque la home.

## Datos pendientes del cliente

Todo esto está marcado en el código con `TODO: dato pendiente del cliente`.

1. **Rol de la Dra. Andrea Ramírez Ponzo.** Aparece en el canal pero no sabemos en qué
   segmento. (La conducción —Yessy López, Charly Álvarez, Luis Orpi— quedó confirmada
   contra las descripciones del canal.)
2. **Los `videoId` que faltan.** 13 cargados a mano del canal; las emisiones del 30/06 al
   28/07 y la del 04/08 completa siguen sin video.
3. **Horario de emisión.** El canal muestra vivo los jueves y estreno los martes, y una
   descripción dice 22:00, pero otras se contradicen. Va con `horarioConfirmado: false`
   y no se publica la hora.
4. **La lista de canales de cable del interior**, con localidad y número de señal.
5. **El nombre de la señal de TV.** El canal firma "VIVO TV — La Treinta"; falta que el
   cliente lo confirme.
6. **El total real de invitados.** "Casi 6.877" es el número que dio la prensa y es
   sospechosamente preciso; hasta confirmarlo se muestra "más de 6.800".
7. **La numeración de los capítulos.** Sin ella no se emite `episodeNumber` en el
   JSON-LD, porque un número equivocado le diría a Google que dos capítulos son el mismo.
8. **Correo, teléfono y localidad** para `/contacto`.
9. **A dónde se envían los formularios de pauta.** Hasta definirlo, `/anunciantes` no
   pinta el formulario: uno que postea a un endpoint inventado se traga las consultas.
10. **El tarifario de pauta.**
11. **El escudo de Noche D10 en vectorial.** Los íconos y la placa OG son provisorios.
12. **Bios y fotos** de invitados y equipo.
13. **Las portadas de los capítulos**, para servirlas locales en AVIF.
14. **Material de los 16 años**, para la página `/16-anos` (hoy fuera de la navegación).
15. **El dominio**, para reemplazar `localhost` en `src/datos/sitio.ts`.
