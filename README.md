# noched10

Sitio del programa **Noche D10**: magazine uruguayo de entrevistas, música y humor,
16 años al aire por CX30 Radio Nacional AM 1130, VIVO TV, cables del interior y YouTube.

Para quién es: el público del programa, que llega desde Instagram o desde Google
buscando a un invitado, y las marcas que quieren pautar.

## Correr en local

```bash
npm install
npm run dev
```

Queda en **http://localhost:4321**.

## Comandos

| Comando           | Qué hace                                                  |
| ----------------- | --------------------------------------------------------- |
| `npm run dev`     | servidor de desarrollo en el puerto 4321                  |
| `npm run build`   | genera el sitio estático en `dist/`                       |
| `npm run preview` | sirve `dist/` para revisarlo antes de desplegar           |
| `npm run check`   | chequeo de tipos de Astro                                 |
| `npm run format`  | formatea con Prettier                                     |
| `npm run verify`  | `format:check` + `check` + `build`: lo mismo que corre CI |

## Rutas

| Ruta            | Qué es                                                        | Estado                               |
| --------------- | ------------------------------------------------------------- | ------------------------------------ |
| `/`             | home: último programa, trayectoria, entrevistas, dónde vernos | andamiaje                            |
| `/programas`    | archivo de emisiones                                          | andamiaje, faltan filtros y buscador |
| `/donde-vernos` | radio, TV, cable y streaming                                  | andamiaje                            |
| `/entrevistas`  | piezas cortas por tema                                        | pendiente                            |
| `/invitados`    | índice A-Z con todas las apariciones                          | pendiente                            |
| `/equipo`       | conducción, dirección y columnistas                           | pendiente                            |
| `/16-anos`      | especial de aniversario                                       | pendiente                            |
| `/anunciantes`  | media kit y formulario de pauta                               | pendiente                            |

## Estructura

```
src/
  datos/         sitio.ts · programa.ts · equipo.ts · emisiones.ts
  componentes/   Cabezal.astro · PieDePagina.astro · FachadaYoutube.astro
  layouts/       Base.astro
  pages/         index.astro · programas/index.astro · donde-vernos.astro
  estilos/       global.css
public/          robots.txt
```

## Desplegar

Cloudflare, Worker de assets sobre `dist/`, en la cuenta de Scalerics.

```bash
npm run build
npx wrangler deploy
```

Antes del primer deploy hay que completar `account_id` en `wrangler.jsonc`. Sin esa
línea, si wrangler está logueado con una cuenta personal el sitio se va a la cuenta
equivocada.

Mientras no esté pago: la URL `.workers.dev` queda protegida y el dominio propio no se
conecta.

## Pendiente del cliente

- Logo en vectorial (SVG/AI/EPS) de las dos marcas
- Quién conduce hoy — hay dos versiones, ver `CLAUDE.md`
- Día y horario exacto de emisión en radio y en TV
- Lista de canales de cable del interior, con localidades
- Teléfono, mail y dirección de contacto
- Dominio definido y comprado
- Fotos del set, de los conductores y de los invitados
