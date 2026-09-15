/**
 * Casos de prueba del armado de emisiones. Los videos son los reales del feed
 * del canal (agosto de 2026); las duraciones, las de la YouTube Data API.
 *
 * Corre con: npm test
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  armarEmisiones,
  duracionDesdeIso,
  fechaEnMontevideo,
  type Curaduria,
  type PiezaDelFeed,
} from './emisiones.ts';

const sinCuraduria: Curaduria = {
  nombres: {},
  temaPorInvitado: {},
  emisionPorVideo: {},
  fechaPorVideo: {},
  ocultas: [],
};

const vivo = (videoId: string, fecha: string, publicado: string): PiezaDelFeed => ({
  videoId,
  tipo: 'emision',
  pase: 'vivo',
  fechaEmision: fecha,
  fechaDeducida: false,
  titulo: `Emisión del ${fecha}`,
  tituloOriginal: '',
  publicado,
  invitados: [],
  duracion: '2:10:00',
});

const estreno = (
  videoId: string,
  fecha: string,
  publicado: string,
  invitados: string[],
  duracion = '2:02:31',
): PiezaDelFeed => ({
  videoId,
  tipo: 'emision',
  pase: 'estreno',
  fechaEmision: fecha,
  fechaDeducida: false,
  titulo: invitados.join(' / '),
  tituloOriginal: '',
  publicado,
  invitados,
  duracion,
});

const entrevista = (
  videoId: string,
  invitado: string,
  publicado: string,
): PiezaDelFeed => ({
  videoId,
  tipo: 'entrevista',
  pase: null,
  fechaEmision: null,
  fechaDeducida: false,
  titulo: invitado,
  tituloOriginal: '',
  publicado,
  invitados: [invitado],
  duracion: '25:00',
});

// Las dos semanas reales del feed, en el orden en que salieron.
const agosto: PiezaDelFeed[] = [
  vivo('8HAalSp1Fr4', '2026-08-06', '2026-08-07T15:58:36+00:00'),
  entrevista('9DYjXI9-_WE', 'María de Lima', '2026-08-07T21:00:57+00:00'),
  estreno(
    '0pHnAdXCRTE',
    '2026-08-11',
    '2026-08-12T01:00:16+00:00',
    ['Carlos Alberto Rodriguez', 'Eduardo Acevedo', 'Alejandro Quintino'],
    '2:04:23',
  ),
  entrevista('xwe-2UcQP9Y', 'Alejandro Quintino', '2026-08-12T20:00:46+00:00'),
  vivo('COfAPQCduMs', '2026-08-13', '2026-08-14T15:17:43+00:00'),
  entrevista('6_Xb4FnmP2c', 'Anita Valiente', '2026-08-15T18:25:59+00:00'),
  entrevista('KOgTOCXWtsA', 'Robert Silva', '2026-08-17T01:31:22+00:00'),
  estreno('KRB6sjJYwCI', '2026-08-18', '2026-08-19T01:04:41+00:00', [
    'Sergio Secinaro',
    'Robert Silva',
    'Alejandro Quintino',
  ]),
];

describe('duracionDesdeIso', () => {
  it('pasa horas, minutos y segundos a h:mm:ss', () => {
    assert.equal(duracionDesdeIso('PT2H2M31S'), '2:02:31');
  });

  it('deja en m:ss lo que dura menos de una hora', () => {
    assert.equal(duracionDesdeIso('PT39M19S'), '39:19');
  });

  it('completa los componentes que la API omite', () => {
    assert.equal(duracionDesdeIso('PT2H'), '2:00:00');
    assert.equal(duracionDesdeIso('PT45S'), '0:45');
  });

  it('devuelve null para un vivo en curso (P0D) o un formato raro', () => {
    assert.equal(duracionDesdeIso('P0D'), null);
    assert.equal(duracionDesdeIso('basura'), null);
  });
});

describe('fechaEnMontevideo', () => {
  it('pasa el instante UTC a la fecha de Montevideo', () => {
    // El estreno del martes 18 a las 22:04 figura en la API como día 19.
    assert.equal(fechaEnMontevideo('2026-08-19T01:04:41+00:00'), '2026-08-18');
  });
});

describe('armarEmisiones: doble pase', () => {
  it('fusiona el vivo del jueves con el estreno del martes en una sola emisión', () => {
    const { emisiones } = armarEmisiones(agosto, sinCuraduria);
    const fechas = emisiones.map((e) => e.fecha);
    assert.deepEqual(fechas, ['2026-08-18', '2026-08-11']);
  });

  it('usa la fecha, el video y la duración del estreno, no los del vivo', () => {
    const { emisiones } = armarEmisiones(agosto, sinCuraduria);
    assert.equal(emisiones[0].videoId, 'KRB6sjJYwCI');
    assert.equal(emisiones[0].duracion, '2:02:31');
  });

  it('un vivo cuyo estreno nunca llegó se publica solo, pasada la semana', () => {
    const { emisiones, vivosSinEstreno } = armarEmisiones(
      [
        vivo('viejo', '2026-07-23', '2026-07-24T15:00:00Z'),
        entrevista('nuevo', 'Robert Silva', '2026-08-17T01:31:22Z'),
      ],
      sinCuraduria,
    );
    assert.deepEqual(
      emisiones.map((e) => [e.fecha, e.videoId]),
      [['2026-07-23', 'viejo']],
    );
    assert.deepEqual(vivosSinEstreno, []);
  });

  it('no publica un vivo que todavía no tiene estreno', () => {
    const soloVivo = [vivo('COfAPQCduMs', '2026-08-13', '2026-08-14T15:17:43+00:00')];
    const { emisiones, vivosSinEstreno } = armarEmisiones(soloVivo, sinCuraduria);
    assert.equal(emisiones.length, 0);
    assert.deepEqual(vivosSinEstreno, ['COfAPQCduMs']);
  });

  it('publica un estreno sin vivo: el histórico viejo no siempre lo tiene', () => {
    const { emisiones } = armarEmisiones(
      [
        estreno('KRB6sjJYwCI', '2026-08-18', '2026-08-19T01:04:41+00:00', [
          'Robert Silva',
        ]),
      ],
      sinCuraduria,
    );
    assert.equal(emisiones.length, 1);
    assert.equal(emisiones[0].fecha, '2026-08-18');
  });

  it('un programa sin nombres en el título no se titula con los invitados de los recortes', () => {
    const { emisiones } = armarEmisiones(
      [
        vivo('viejo', '2026-07-23', '2026-07-24T15:00:00Z'),
        entrevista('a', 'Niusa Samba', '2026-07-25T15:00:00Z'),
        entrevista('b', 'Robert Silva', '2026-08-17T01:31:22Z'),
      ],
      sinCuraduria,
    );
    assert.equal(emisiones[0].titulo, 'Programa completo');
    assert.deepEqual(emisiones[0].invitados, ['Niusa Samba']);
  });

  it('arma el título con los invitados del estreno y no inventa el número', () => {
    const { emisiones } = armarEmisiones(agosto, sinCuraduria);
    assert.equal(
      emisiones[0].titulo,
      'Sergio Secinaro / Robert Silva / Alejandro Quintino',
    );
    assert.equal(emisiones[0].numero, null);
  });
});

describe('armarEmisiones: histórico de pase único', () => {
  const unico = (
    videoId: string,
    fecha: string,
    publicado: string,
    invitados: string[],
  ) => ({
    ...estreno(videoId, fecha, publicado, invitados),
    pase: 'unico' as const,
  });

  it('un programa de pase único es una emisión con su propia fecha', () => {
    const { emisiones } = armarEmisiones(
      [unico('a', '2024-09-12', '2024-09-13T22:00:00Z', ['Eduardo Acevedo'])],
      sinCuraduria,
    );
    assert.deepEqual(
      emisiones.map((e) => [e.fecha, e.slug]),
      [['2024-09-12', '2024-09-12']],
    );
  });

  it('dos programas el mismo día: el subido antes se queda la fecha y el otro lleva sufijo', () => {
    const { emisiones } = armarEmisiones(
      [
        unico('despues', '2022-05-26', '2022-05-26T20:00:00Z', ['Martin Piña']),
        unico('antes', '2022-05-26', '2022-05-26T10:00:00Z', ['Ana Laura Barreto']),
      ],
      sinCuraduria,
    );
    const slugs = Object.fromEntries(emisiones.map((e) => [e.videoId, e.slug]));
    assert.deepEqual(slugs, { antes: '2022-05-26', despues: '2022-05-26-2' });
  });

  it('la curaduría puede corregir la fecha de un programa', () => {
    const { emisiones } = armarEmisiones(
      [unico('a', '2022-05-26', '2022-05-26T10:00:00Z', ['Ana Laura Barreto'])],
      { ...sinCuraduria, fechaPorVideo: { a: '2022-05-19' } },
    );
    assert.equal(emisiones[0].fecha, '2022-05-19');
  });
});

describe('armarEmisiones: a qué emisión va cada pieza', () => {
  const piezasDe = (fecha: string) =>
    armarEmisiones(agosto, sinCuraduria)
      .emisiones.find((e) => e.fecha === fecha)!
      .piezas.map((p) => p.videoId);

  it('cuelga la entrevista de la emisión cuyo estreno nombra al invitado', () => {
    // Quintino está en los dos estrenos: gana el más cercano a la publicación.
    assert.ok(piezasDe('2026-08-11').includes('xwe-2UcQP9Y'));
    assert.ok(piezasDe('2026-08-18').includes('KOgTOCXWtsA'));
  });

  it('sin nombre en común, la cuelga del último vivo anterior a la publicación', () => {
    assert.ok(piezasDe('2026-08-11').includes('9DYjXI9-_WE'));
    assert.ok(piezasDe('2026-08-18').includes('6_Xb4FnmP2c'));
  });

  it('deja huérfana la pieza que no cae cerca de ninguna emisión', () => {
    const lejana = entrevista('viejo', 'Nadie', '2025-01-01T12:00:00+00:00');
    const { huerfanas } = armarEmisiones([...agosto, lejana], sinCuraduria);
    assert.deepEqual(
      huerfanas.map((p) => p.videoId),
      ['viejo'],
    );
  });

  it('la reasignación a mano de la curaduría gana siempre', () => {
    const { emisiones } = armarEmisiones(agosto, {
      ...sinCuraduria,
      emisionPorVideo: { '6_Xb4FnmP2c': '0pHnAdXCRTE' },
    });
    const del11 = emisiones.find((e) => e.fecha === '2026-08-11')!;
    assert.ok(del11.piezas.some((p) => p.videoId === '6_Xb4FnmP2c'));
  });

  it('la reasignación también acepta el video del vivo, que quedó unido al estreno', () => {
    const { emisiones } = armarEmisiones(agosto, {
      ...sinCuraduria,
      emisionPorVideo: { '9DYjXI9-_WE': 'COfAPQCduMs' }, // vivo del 13 → estreno del 18
    });
    const del18 = emisiones.find((e) => e.fecha === '2026-08-18')!;
    assert.ok(del18.piezas.some((p) => p.videoId === '9DYjXI9-_WE'));
  });

  it('una reasignación a un video que no existe no se pierde en silencio', () => {
    const { huerfanas, curaduriaSinResolver } = armarEmisiones(agosto, {
      ...sinCuraduria,
      emisionPorVideo: { '9DYjXI9-_WE': 'no-existe' },
    });
    assert.ok(huerfanas.some((p) => p.videoId === '9DYjXI9-_WE'));
    assert.deepEqual(curaduriaSinResolver, ['9DYjXI9-_WE → no-existe']);
  });
});

describe('armarEmisiones: curaduría', () => {
  const curaduria: Curaduria = {
    nombres: { 'Carlos Alberto Rodriguez': 'Carlos Alberto Rodríguez' },
    temaPorInvitado: { 'Robert Silva': 'política', 'Anita Valiente': 'música' },
    emisionPorVideo: {},
    fechaPorVideo: {},
    ocultas: ['9DYjXI9-_WE'],
  };

  it('corrige los nombres en invitados y título', () => {
    const del11 = armarEmisiones(agosto, curaduria).emisiones[1];
    assert.equal(del11.invitados[0], 'Carlos Alberto Rodríguez');
    assert.ok(del11.titulo.startsWith('Carlos Alberto Rodríguez'));
  });

  it('pone el tema de cada pieza según el invitado', () => {
    const del18 = armarEmisiones(agosto, curaduria).emisiones[0];
    const silva = del18.piezas.find((p) => p.videoId === 'KOgTOCXWtsA')!;
    assert.deepEqual(silva.temas, ['política']);
  });

  it('saca las piezas ocultas', () => {
    const { emisiones, huerfanas } = armarEmisiones(agosto, curaduria);
    const todas = [...emisiones.flatMap((e) => e.piezas), ...huerfanas];
    assert.ok(!todas.some((p) => p.videoId === '9DYjXI9-_WE'));
  });
});
