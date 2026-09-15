/**
 * Dominio: armar las emisiones a partir de los videos clasificados del canal.
 *
 * Funciones puras, igual que `feed.ts`: entra lo que trajo el ingestor y la
 * curaduría, sale el archivo. No lee archivos ni sale a la red.
 *
 * TRAMPA DEL DOBLE PASE: desde julio de 2026 cada programa sale en vivo un
 * jueves y se reestrena el martes siguiente, con dos videos y dos fechas en el
 * título. Es UNA emisión, y lo que queda es del estreno: fecha, videoId y
 * duración. Un vivo sin estreno no se publica durante una semana, porque la
 * fecha es la URL y cambiarla a los cinco días rompería los links; si pasada
 * la semana el estreno no llegó, el vivo se publica solo.
 * Antes de 2026 el programa era de pase único (en 2022, diario): cada video
 * largo es su propia emisión.
 *
 * TRAMPA DE LA FECHA REPETIDA: en 2022 se subieron tandas atrasadas y muchos
 * títulos no traen fecha, así que dos programas pueden caer el mismo día. La
 * URL usa `slug`: el primero subido se queda la fecha, el siguiente lleva
 * `-2`. Lo correcto es corregir la fecha en `curaduria.fechaPorVideo`.
 *
 * TRAMPA DEL AGRUPADO: los recortes no dicen a qué emisión pertenecen. Se
 * cuelgan con una heurística, en este orden:
 *   1. la reasignación a mano de `curaduria.emisionPorVideo`, que gana siempre;
 *   2. la emisión que nombra al invitado, la más cercana en fecha;
 *   3. la emisión con el último comienzo anterior a la publicación del recorte.
 * Lo que no cae en ninguna queda en `huerfanas`, que el ingestor lista.
 */
import {
  fechaEnMontevideo,
  formatearDuracion,
  segundosDesdeIso,
  type PiezaClasificada,
  type TipoDePieza as TipoDelFeed,
} from './feed.ts';

export { fechaEnMontevideo };

export type TipoDePieza = Exclude<TipoDelFeed, 'emision'>;

/** Un video clasificado, tal cual queda en `feed.json`. */
export type PiezaDelFeed = PiezaClasificada;

export type Pieza = {
  titulo: string;
  tipo: TipoDePieza;
  videoId: string;
  duracion: string;
  invitados: string[];
  temas: string[];
};

export type Emision = {
  /** Lo que va en la URL: la fecha, o la fecha con sufijo si se repite. */
  slug: string;
  fecha: string; // ISO, la del estreno
  /** El canal no numera los capítulos. TODO: dato pendiente del cliente. */
  numero: number | null;
  titulo: string;
  videoId: string;
  duracion: string;
  invitados: string[];
  piezas: Pieza[];
};

export type Curaduria = {
  /** Nombre como lo escribe el canal → nombre correcto. */
  nombres: Record<string, string>;
  temaPorInvitado: Record<string, string>;
  /** videoId de un recorte → videoId de la emisión a la que pertenece. */
  emisionPorVideo: Record<string, string>;
  /** videoId de un programa → fecha de emisión correcta (ISO). */
  fechaPorVideo: Record<string, string>;
  ocultas: string[];
};

export type ArchivoArmado = {
  emisiones: Emision[];
  huerfanas: Pieza[];
  /** videoId de los vivos que esperan su estreno. */
  vivosSinEstreno: string[];
  /** Reasignaciones de la curaduría que apuntan a un video que no es ninguna emisión. */
  curaduriaSinResolver: string[];
};

/** Días entre el vivo del jueves y el estreno del martes siguiente. */
const MAXIMO_ENTRE_VIVO_Y_ESTRENO = 7;
/** Cuando un estreno no tiene vivo, se asume que se grabó cinco días antes. */
const DIAS_DEL_VIVO_AL_ESTRENO = 5;
/** Un recorte publicado más lejos que esto de su emisión queda huérfano. */
const VENTANA_DEL_RECORTE = 14;

const UN_DIA = 86_400_000;
const diasEntre = (desde: string, hasta: string) =>
  (Date.parse(`${hasta}T00:00:00Z`) - Date.parse(`${desde}T00:00:00Z`)) / UN_DIA;
const restarDias = (fecha: string, dias: number) =>
  new Date(Date.parse(`${fecha}T00:00:00Z`) - dias * UN_DIA).toISOString().slice(0, 10);

/** `PT2H2M31S` → `2:02:31`. Un vivo en curso (`P0D`) todavía no tiene duración. */
export function duracionDesdeIso(iso: string): string | null {
  const segundos = segundosDesdeIso(iso);
  return segundos === null ? null : formatearDuracion(segundos);
}

type EnArmado = Omit<Emision, 'slug'> & {
  inicio: string;
  publicado: string;
  /** El video del programa y, si lo tuvo, el del vivo que se le unió. */
  videos: string[];
};

const aEmision = (
  programa: PiezaDelFeed,
  inicio: string,
  vivo?: PiezaDelFeed,
): EnArmado => ({
  fecha: programa.fechaEmision!,
  inicio,
  videos: vivo ? [programa.videoId, vivo.videoId] : [programa.videoId],
  publicado: programa.publicado,
  numero: null,
  titulo: '',
  videoId: programa.videoId,
  duracion: programa.duracion,
  invitados: programa.invitados,
  piezas: [],
});

function juntarPases(programas: PiezaDelFeed[], ultimaPublicacion: string) {
  const vivos = programas.filter((p) => p.pase === 'vivo');
  const usados = new Set<string>();

  const conEstreno = programas
    .filter((p) => p.pase !== 'vivo')
    .map((programa) => {
      if (programa.pase === 'unico') return aEmision(programa, programa.fechaEmision!);
      const fecha = programa.fechaEmision!;
      const vivo = vivos
        .filter((v) => !usados.has(v.videoId))
        .filter((v) => {
          const dias = diasEntre(v.fechaEmision!, fecha);
          return dias > 0 && dias <= MAXIMO_ENTRE_VIVO_Y_ESTRENO;
        })
        .sort((a, b) => b.fechaEmision!.localeCompare(a.fechaEmision!))[0];
      if (vivo) usados.add(vivo.videoId);
      return aEmision(
        programa,
        vivo?.fechaEmision ?? restarDias(fecha, DIAS_DEL_VIVO_AL_ESTRENO),
        vivo,
      );
    });

  const sueltos = vivos.filter((v) => !usados.has(v.videoId));
  const vencido = (v: PiezaDelFeed) =>
    diasEntre(v.fechaEmision!, ultimaPublicacion) > MAXIMO_ENTRE_VIVO_Y_ESTRENO;

  return {
    emisiones: [
      ...conEstreno,
      ...sueltos.filter(vencido).map((v) => aEmision(v, v.fechaEmision!)),
    ],
    vivosSinEstreno: sueltos.filter((v) => !vencido(v)).map((v) => v.videoId),
  };
}

function emisionDeLaPieza(
  pieza: PiezaDelFeed,
  emisiones: EnArmado[],
  curaduria: Curaduria,
): EnArmado | undefined {
  const forzada = curaduria.emisionPorVideo[pieza.videoId];
  if (forzada) return emisiones.find((e) => e.videos.includes(forzada));

  const publicada = fechaEnMontevideo(pieza.publicado);
  const distancia = (e: EnArmado) => Math.abs(diasEntre(e.fecha, publicada));
  const cerca = emisiones.filter((e) => distancia(e) <= VENTANA_DEL_RECORTE);

  const porNombre = cerca
    .filter((e) => pieza.invitados.some((nombre) => e.invitados.includes(nombre)))
    .sort((a, b) => distancia(a) - distancia(b))[0];
  if (porNombre) return porNombre;

  return cerca
    .filter((e) => e.inicio <= publicada)
    .sort((a, b) => b.inicio.localeCompare(a.inicio))[0];
}

function aPieza(recorte: PiezaDelFeed, curaduria: Curaduria): Pieza {
  return {
    titulo: recorte.titulo,
    tipo: recorte.tipo as TipoDePieza,
    videoId: recorte.videoId,
    duracion: recorte.duracion,
    invitados: recorte.invitados,
    temas: [
      ...new Set(
        recorte.invitados
          .map((nombre) => curaduria.temaPorInvitado[nombre])
          .filter((tema): tema is string => Boolean(tema)),
      ),
    ],
  };
}

/** El primero subido se queda la fecha; los siguientes, -2, -3… */
function conSlug(emisiones: EnArmado[]): Emision[] {
  const usadas = new Map<string, number>();
  return [...emisiones]
    .sort((a, b) => a.publicado.localeCompare(b.publicado))
    .map((emision): Emision => {
      const veces = (usadas.get(emision.fecha) ?? 0) + 1;
      usadas.set(emision.fecha, veces);
      const invitados = [
        ...new Set([
          ...emision.invitados,
          ...emision.piezas.flatMap((p) => p.invitados),
        ]),
      ];
      return {
        slug: veces === 1 ? emision.fecha : `${emision.fecha}-${veces}`,
        fecha: emision.fecha,
        numero: emision.numero,
        videoId: emision.videoId,
        duracion: emision.duracion,
        piezas: emision.piezas,
        invitados,
        // El título es el del programa. Con los invitados de los recortes no
        // se arma: un vivo sin nombres podría quedar con siete ajenos.
        titulo: emision.invitados.join(' / ') || 'Programa completo',
      };
    });
}

export function armarEmisiones(
  feed: PiezaDelFeed[],
  curaduria: Curaduria,
): ArchivoArmado {
  const corregir = (nombre: string) => curaduria.nombres[nombre] ?? nombre;
  const visibles = feed
    .filter((pieza) => !curaduria.ocultas.includes(pieza.videoId))
    .map((pieza) => ({
      ...pieza,
      invitados: pieza.invitados.map(corregir),
      fechaEmision: curaduria.fechaPorVideo[pieza.videoId] ?? pieza.fechaEmision,
    }));

  const ultimaPublicacion = visibles.reduce((ultima, pieza) => {
    const fecha = fechaEnMontevideo(pieza.publicado);
    return fecha > ultima ? fecha : ultima;
  }, '0000-00-00');
  const { emisiones, vivosSinEstreno } = juntarPases(
    visibles.filter((p) => p.tipo === 'emision' && p.fechaEmision),
    ultimaPublicacion,
  );

  const huerfanas: Pieza[] = [];
  const curaduriaSinResolver: string[] = [];
  for (const recorte of visibles.filter((p) => p.tipo !== 'emision')) {
    const emision = emisionDeLaPieza(recorte, emisiones, curaduria);
    if (emision) emision.piezas.push(aPieza(recorte, curaduria));
    else huerfanas.push(aPieza(recorte, curaduria));
    const forzada = curaduria.emisionPorVideo[recorte.videoId];
    if (forzada && !emision)
      curaduriaSinResolver.push(`${recorte.videoId} → ${forzada}`);
  }

  return {
    emisiones: conSlug(emisiones).sort(
      (a, b) => b.fecha.localeCompare(a.fecha) || b.slug.localeCompare(a.slug),
    ),
    huerfanas,
    vivosSinEstreno,
    curaduriaSinResolver,
  };
}
