/**
 * llms.txt: un resumen del sitio en texto plano, para que un modelo que lo
 * visite entienda qué es esto sin tener que recorrer 3.000 fichas.
 * Especificación: https://llmstxt.org/
 */
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

import { sitio } from '../datos/sitio';
import { programa, plataformas, emision } from '../datos/programa';
import { urlDeEmision } from '../datos/archivo';
import { formatearFecha } from '../datos/texto';

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL(sitio.url);
  const enlace = (ruta: string) => new URL(ruta, base).href;

  const emisiones = (await getCollection('emisiones')).sort((a, b) =>
    b.data.fecha.localeCompare(a.data.fecha),
  );
  const invitados = await getCollection('invitados');

  const cuerpo = `# ${sitio.nombre}

> ${sitio.descripcion}

Magazine uruguayo de entrevistas, música en vivo y humor, al aire desde hace
${programa.aniosAlAire} años. Lo produce Producciones D10. Son cerca de
${programa.capitulosAprox} capítulos y más de ${programa.invitadosAprox} invitados.

Emisión: ${emision.frecuencia}, en vivo los ${emision.dia} y en reestreno los ${emision.reestreno}, de ${emision.duracionAprox}.
${emision.horarioConfirmado ? `Horario: ${emision.hora}.` : 'Horario exacto: sin confirmar.'}

Se emite por: ${plataformas.map((p) => p.nombre).join(', ')}.

## Secciones

- [Programas](${enlace('/programas')}): el archivo de emisiones, con filtros por año y por tema.
- [Entrevistas](${enlace('/entrevistas')}): las piezas sueltas de cada programa.
- [Invitados](${enlace('/invitados')}): índice de las personas que pasaron por el estudio (${invitados.length} cargadas).
- [Equipo](${enlace('/equipo')}): quiénes hacen el programa.
- [Dónde vernos](${enlace('/donde-vernos')}): radio, televisión, cable y streaming.
- [Anunciantes](${enlace('/anunciantes')}): formatos de pauta publicitaria.
- [Contacto](${enlace('/contacto')})

## Cómo está modelado el archivo

Una emisión no es un video: son varias piezas. Cada programa genera el capítulo
completo (unas dos horas), una entrevista por invitado, el segmento de humor
—"Las Humoradas de Luis Orpi"— y a veces una columna. Cada pieza tiene su
propia ficha y su propio invitado enlazado.

## Emisiones publicadas

${emisiones
  .map(
    (e) =>
      `- [${e.data.titulo}](${enlace(urlDeEmision(e.data))}) — ${formatearFecha(e.data.fecha)}, ${e.data.duracion}`,
  )
  .join('\n')}

## Notas

Este sitio está en construcción y hay datos pendientes de confirmar con el
programa: el horario exacto de emisión, la lista de canales de cable del
interior, la numeración de los capítulos y los identificadores de video de
YouTube.
`;

  return new Response(cuerpo, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
