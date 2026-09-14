# Noche D10

## Qué es

Sitio del programa **Noche D10**, un magazine uruguayo de entrevistas, música en vivo
y humor que va hace 16 años por CX30 Radio Nacional AM 1130, VIVO TV, la red de cables
del interior y streaming por YouTube. Lo hace Producciones D10 (Luis Betarte, dirección;
Matías Bidegaray, producción general). Cliente de Scalerics.

El sitio tiene dos trabajos: hacer encontrable un archivo de ~3.000 capítulos y captar
pauta publicitaria. No es un folleto institucional.

## Estado

**Demo previa a reunión.** Andamiaje creado, datos relevados, diseño sin definir.
Todavía no hay dominio, ni contrato firmado, ni material del cliente.

## Reglas que no se negocian

1. Español rioplatense en todo: variables, funciones, carpetas, rutas, comentarios,
   docs y mensajes de commit. Las excepciones son los nombres que impone Astro
   (`src/pages/`, `public/`, `layout`, `getStaticPaths`).
2. Astro estático. Sin framework de UI, sin WebGL, sin GSAP. Las animaciones van con
   `animation-timeline: view()` de CSS y las transiciones de página con la View
   Transitions API nativa.
3. Una sola fuente de verdad: todo texto, precio, nombre y dato vive en `src/datos/`.
   Si un dato aparece en dos lugares, en algún momento van a discrepar.
4. El adaptador nunca decide. Si aparece un `if` sobre una regla del negocio dentro de
   un componente o una página, eso baja a `src/datos/` aunque sean tres líneas.
5. Presupuesto de performance, medido y no estimado: home < 150 KB de transferencia
   crítica, < 40 KB de JS, LCP < 2,5 s, CLS < 0,1.
6. Nunca embeber el iframe de YouTube directo. Va siempre por `FachadaYoutube.astro`.
7. No inventar datos del cliente. Lo que falta va con `TODO:` y se pregunta.
8. `feed.json` lo escribe el script, nunca una persona. Toda corrección a mano
   va en `src/datos/curaduria.ts`, que lo pisa.

## Trampas del dominio

- **Cada programa se publica DOS VECES y es una sola emisión.** Sale en vivo un
  jueves y se reestrena el martes siguiente, con dos videos y dos fechas distintas
  en el título. `emisiones.ts` los fusiona y deja la fecha del vivo. Si alguien saca
  esa fusión, el archivo muestra todo duplicado.
- **El canal usa cinco formatos de título y dos separadores distintos** — la barra
  `|` y una `l` minúscula, que a ojo son iguales. Están todos en
  `src/dominio/feed.ts` con su caso de prueba. Formato nuevo: primero el test,
  después el parser, nunca un parche en la página.
- **Las entrevistas sueltas no dicen a qué emisión pertenecen.** Se cuelgan de la
  emisión más cercana dentro de 10 días. Es una heurística: cuando se equivoca, se
  corrige en `curaduria.emisionPorVideo`.
- **El feed de YouTube devuelve solo las últimas 15 entradas.** Mantiene el sitio al
  día de acá en adelante, pero no trae los 496 videos que ya están publicados. El
  archivo viejo hay que cargarlo una vez por otra vía; el script agrega y nunca
  borra, así que no lo pisa.
- **Una emisión no es un video, son cuatro.** Cada programa genera el completo (~2 h),
  una entrevista por invitado, el segmento de humor y a veces una columna. Si se
  modela como "lista de videos" se pierde toda la navegación. El modelo correcto está
  en `src/datos/emisiones.ts`.
- **El horario que dicen las descripciones se contradice.** Una entrevista dice
  "jueves 13 de agosto de 2026, 22:00 horas"; otras arrastran un texto pegado que
  dice "Lunes a viernes 19 hs", que parece de otro programa de la casa. En
  `programa.ts` está marcado con `horarioConfirmado: false`. No publicar un horario
  hasta que el cliente lo confirme.
- **"Casi 6.877 invitados" es el número que dio la prensa.** Es sospechosamente
  preciso. Hasta que el cliente lo confirme se muestra "más de 6.800".
- **El archivo tiene 3.000 capítulos: nada de infinite scroll.** Mata el footer, donde
  está el contacto de pauta, y rompe el deep-linking y el SEO.
- La marca tiene dos logos: el escudo de _Noche D10_ y el de _D10 De Diez Producciones_.
  No son intercambiables. Este repo usa el primero.

## Comandos

```bash
npm install
npm run dev        # http://localhost:4321
npm test           # tests del parser de títulos, sin levantar nada
npm run feed       # trae el feed del canal y actualiza src/datos/feed.json
npm run feed -- --ver   # muestra qué traería, sin escribir
npm run verify     # format:check + check + test + build — lo mismo que CI
npm run build      # genera dist/
npx wrangler deploy
```

## Estructura

```
src/
  dominio/      # funciones puras: el parser de títulos del canal + sus tests
  datos/        # feed.json (lo escribe el script) + curaduria.ts (a mano)
  componentes/  # piezas de UI
  layouts/      # Base.astro
  pages/        # una ruta por archivo (nombre impuesto por Astro)
  estilos/      # global.css con los tokens de marca
herramientas/   # traer-feed.ts: el adaptador que habla con YouTube
public/         # estático servido tal cual
```

## Cómo entra un programa nuevo

El canal publica, y de ahí sale todo. El workflow `traer-feed.yml` corre los
miércoles y viernes a las 12:00 UTC (09:00 de Montevideo), o sea la mañana
siguiente a cada pase:

1. `npm run feed` trae el feed y clasifica lo nuevo con `src/dominio/feed.ts`.
2. Si hay piezas nuevas, las agrega a `src/datos/feed.json` y las commitea.
3. Ese commit dispara el deploy.

Lo que el parser no sabe clasificar no se descarta: queda listado en
`feed.json` bajo `sinClasificar` y el script lo imprime, para que alguien mire
y agregue el formato.

Nadie del lado del cliente toca nada: publican en YouTube como siempre.

El brief completo del cliente — investigación, arquitectura, referencias de diseño y
los prompts de Claude Design — está en `../brief-d10.md`, fuera del repo.
