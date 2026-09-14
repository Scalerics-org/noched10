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

## Trampas del dominio

- **Hay dos versiones de la conducción actual y no está resuelto.** El Instagram
  acredita a Yessy López, Charly Álvarez y Luis Orpi; la nota de aniversario de
  Crónicas del Este dice Robert Moré, Charly Álvarez y Sabrina Floras. El único que
  coincide es Charly Álvarez. Está anotado en `src/datos/equipo.ts`. No publicar la
  página de equipo sin confirmarlo.
- **Una emisión no es un video, son cuatro.** Cada programa genera el completo (~2 h),
  una entrevista por invitado, el segmento de humor y a veces una columna. Si se
  modela como "lista de videos" se pierde toda la navegación. El modelo correcto está
  en `src/datos/emisiones.ts`.
- **El horario de emisión es una inferencia, no un dato.** Los martes salen de las
  fechas de estreno en YouTube (04, 11 y 18 de agosto de 2026, los tres martes). El
  horario exacto no lo sabemos.
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
npm run verify     # format:check + astro check + build — lo mismo que CI
npm run build      # genera dist/
npx wrangler deploy
```

## Estructura

```
src/
  datos/        # el dominio: todo dato y texto del programa
  componentes/  # piezas de UI
  layouts/      # Base.astro
  pages/        # una ruta por archivo (nombre impuesto por Astro)
  estilos/      # global.css con los tokens de marca
public/         # estático servido tal cual
```

El brief completo del cliente — investigación, arquitectura, referencias de diseño y
los prompts de Claude Design — está en `../brief-d10.md`, fuera del repo.
