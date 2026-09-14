/**
 * Pauta publicitaria.
 *
 * Esta es la mitad del trabajo del sitio: el archivo hace que la gente llegue,
 * esta sección hace que el programa cobre. Los formatos salen de lo que el
 * programa efectivamente puede ofrecer (radio + TV abierta + cables del
 * interior + YouTube). Los precios NO están acá porque el cliente todavía no
 * los pasó, y un precio inventado en una página pública es un problema
 * comercial, no un placeholder.
 *
 * TODO: dato pendiente del cliente — tarifario, duraciones y disponibilidad.
 */

export type Formato = {
  id: string;
  nombre: string;
  descripcion: string;
  /** Dónde impacta. Se cruza con src/datos/programa.ts. */
  alcance: string[];
  /** TODO: dato pendiente del cliente. */
  precio: string | null;
};

export const formatos: Formato[] = [
  {
    id: 'mencion',
    nombre: 'Mención en vivo',
    descripcion:
      'El conductor presenta la marca durante el programa, en radio y TV al ' +
      'mismo tiempo, y queda en el video del capítulo completo en YouTube.',
    alcance: ['CX30 Radio Nacional', 'VIVO TV', 'Cables del interior', 'YouTube'],
    precio: null,
  },
  {
    id: 'spot',
    nombre: 'Spot en tanda',
    descripcion:
      'Pieza producida saliendo en la tanda del programa. Se emite en las ' +
      'cuatro plataformas y se repite en la reposición.',
    alcance: ['CX30 Radio Nacional', 'VIVO TV', 'Cables del interior'],
    precio: null,
  },
  {
    id: 'seccion',
    nombre: 'Sección auspiciada',
    descripcion:
      'Un bloque fijo del programa lleva el nombre de la marca: la entrevista ' +
      'central, el segmento de humor o una columna.',
    alcance: ['CX30 Radio Nacional', 'VIVO TV', 'Cables del interior', 'YouTube'],
    precio: null,
  },
  {
    id: 'archivo',
    nombre: 'Presencia en el archivo',
    descripcion:
      'La marca acompaña las fichas del archivo del programa, que es lo que la ' +
      'gente busca por Google mucho después de que la emisión salió al aire.',
    alcance: ['Sitio web', 'YouTube'],
    precio: null,
  },
];

/** Lo que se le vende al anunciante, en números que ya están relevados. */
export const argumentos = [
  {
    titulo: '16 años sin cortes',
    detalle:
      'Un programa que sigue al aire desde 2010 no se explica con una campaña: ' +
      'se explica con audiencia que vuelve todas las semanas.',
  },
  {
    titulo: 'Cuatro pantallas a la vez',
    detalle:
      'Radio AM, televisión abierta, la red de cables del interior y YouTube. ' +
      'Una sola pauta cubre Montevideo y el interior.',
  },
  {
    titulo: 'La pauta no se apaga',
    detalle:
      'Cada emisión queda publicada en YouTube y en este archivo. La mención ' +
      'se sigue viendo meses después del día que salió al aire.',
  },
];

/** Campos del formulario. Los valida el propio navegador, sin JS. */
export const camposDelFormulario = [
  {
    nombre: 'empresa',
    etiqueta: 'Empresa o marca',
    tipo: 'text',
    requerido: true,
    autocomplete: 'organization',
  },
  {
    nombre: 'contacto',
    etiqueta: 'Nombre y apellido',
    tipo: 'text',
    requerido: true,
    autocomplete: 'name',
  },
  {
    nombre: 'email',
    etiqueta: 'Correo electrónico',
    tipo: 'email',
    requerido: true,
    autocomplete: 'email',
  },
  {
    nombre: 'telefono',
    etiqueta: 'Teléfono o WhatsApp',
    tipo: 'tel',
    requerido: false,
    autocomplete: 'tel',
  },
] as const;
