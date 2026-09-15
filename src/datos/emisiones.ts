/**
 * Emisiones y piezas del archivo.
 *
 * Ya no se cargan a mano: salen de `feed.json`, que escribe el ingestor
 * (`herramientas/traer-feed.ts`) con lo que publica el canal @produccionesD10,
 * corregido con `curaduria.ts`. Cómo se fusiona el doble pase y a qué emisión
 * va cada recorte está en `src/dominio/emisiones.ts`, con sus tests.
 *
 * Cada emisión genera cuatro tipos de pieza y ése es el modelo que importa:
 * el programa completo (~2 h), una entrevista por invitado, el segmento de
 * humor y, a veces, una columna. Si esto se modela como "una lista de videos"
 * se pierde toda la navegación interesante.
 */
import feed from './feed.json' with { type: 'json' };
import * as curaduria from './curaduria';
import { armarEmisiones, type PiezaDelFeed } from '../dominio/emisiones';

export type { Emision, Pieza, TipoDePieza } from '../dominio/emisiones';

const archivo = armarEmisiones(feed.piezas as PiezaDelFeed[], curaduria);

export const emisiones = archivo.emisiones;

/** Recortes que no se pudieron colgar de ninguna emisión. Los lista el ingestor. */
export const huerfanas = archivo.huerfanas;

/** Categorías del archivo, derivadas de los invitados que recibe el programa. */
export const temas = [
  'política',
  'música',
  'deporte',
  'espectáculos',
  'sociedad',
  'humor',
] as const;

/**
 * Las piezas aplanadas y el índice de invitados viven en
 * src/datos/invitados.ts; el archivo paginado y los filtros, en
 * src/datos/archivo.ts. Este archivo es sólo el dato armado.
 */
