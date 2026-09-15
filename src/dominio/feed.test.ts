/**
 * Casos de prueba del parser. Todos los títulos de acá son reales: salen de
 * la lista de subidas del canal (496 videos, 2019–2026) bajada el 15/09/2026.
 * Cuando aparezca un formato nuevo, el caso se agrega acá primero y recién
 * después se toca `feed.ts`.
 *
 * Corre con: npm test
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  aNombrePropio,
  clasificar,
  descartar,
  fechaDesdeTitulo,
  invitadosDelTitulo,
} from './feed.ts';

const HORA = 3600;
const entrada = (
  titulo: string,
  segundos = 25 * 60,
  publicado = '2026-08-19T01:04:41Z',
) => ({
  videoId: 'xxx',
  titulo,
  publicado,
  descripcion: '',
  segundos,
});

describe('fechaDesdeTitulo', () => {
  const publicado = '2026-08-19T01:04:41Z';

  it('lee dd-mm-aa, el formato de 2026', () => {
    assert.equal(fechaDesdeTitulo('l 18-08-26 - ESTRENO', publicado), '2026-08-18');
  });

  it('lee dd/mm/aaaa y dd-mm-aaaa', () => {
    assert.equal(
      fechaDesdeTitulo('NOCHE D10 - MIGUEL ASQUETA - 03/03/2022', publicado),
      '2022-03-03',
    );
    assert.equal(
      fechaDesdeTitulo('TODO D10 / Cecilia Comunales / 06-09-2020', publicado),
      '2020-09-06',
    );
  });

  it('lee la fecha escrita con el mes en letras, con o sin año', () => {
    assert.equal(
      fechaDesdeTitulo('NOCHE D10 / Martes 27 de Septiembre de 2022', publicado),
      '2022-09-27',
    );
    assert.equal(
      fechaDesdeTitulo('NOCHE D10 / 07 DE SETIEMBRE DE 2022', publicado),
      '2022-09-07',
    );
    assert.equal(
      fechaDesdeTitulo('NOCHE D10 / 06 DE SEPTIEMBRE', '2022-09-07T10:00:00Z'),
      '2022-09-06',
    );
  });

  it('lee "NOCHE D10 26 08" con el año de la publicación', () => {
    assert.equal(
      fechaDesdeTitulo('NOCHE D10 26 08  OK', '2022-08-29T10:00:00Z'),
      '2022-08-26',
    );
    assert.equal(
      fechaDesdeTitulo('NOCHE D 10 09 8', '2022-08-10T10:00:00Z'),
      '2022-08-09',
    );
  });

  it('si la fecha sin año caería después de la publicación, es del año anterior', () => {
    assert.equal(
      fechaDesdeTitulo('NOCHE D10 29 12', '2023-01-03T10:00:00Z'),
      '2022-12-29',
    );
  });

  it('devuelve null si el título no trae fecha', () => {
    assert.equal(fechaDesdeTitulo('NOCHE D10 l ANITA VALIENTE', publicado), null);
    assert.equal(fechaDesdeTitulo('NOCHE D10 2024 - Eduardo Acevedo', publicado), null);
  });
});

describe('aNombrePropio', () => {
  it('baja las mayúsculas de imprenta', () => {
    assert.equal(aNombrePropio('ANITA VALIENTE'), 'Anita Valiente');
  });

  it('deja en minúscula las partículas que no arrancan el nombre', () => {
    assert.equal(aNombrePropio('MARÍA DE LIMA'), 'María de Lima');
  });

  it('respeta los apodos entre comillas', () => {
    assert.equal(
      aNombrePropio('WASHINGTON "TURCO" ABDALA'),
      'Washington "Turco" Abdala',
    );
  });

  it('no toca un texto que ya viene en mixto', () => {
    assert.equal(aNombrePropio('Dito Galeano'), 'Dito Galeano');
  });
});

describe('invitadosDelTitulo', () => {
  it('lista de 2026 con barras, fecha y marca', () => {
    assert.deepEqual(
      invitadosDelTitulo(
        'NOCHE DE 10 | SERGIO SECINARO / ROBERT SILVA / ALEJANDRO QUINTINO l 18-08-26 - ESTRENO',
      ),
      ['Sergio Secinaro', 'Robert Silva', 'Alejandro Quintino'],
    );
  });

  it('lista con guiones y paréntesis de contexto', () => {
    assert.deepEqual(
      invitadosDelTitulo(
        'NOCHE D10 l CARLOS GOBERNA JR. - MARCEL GOBERNA (ORQUESTA LA DECANA) l Entrevista Completa',
      ),
      ['Carlos Goberna Jr.', 'Marcel Goberna'],
    );
  });

  it('lista de 2024 con comas, emojis y títulos profesionales', () => {
    assert.deepEqual(
      invitadosDelTitulo(
        'NOCHE D10 2024 - 😂¡ Fito Galli,  🎤 Alejandra Díaz,  Detrás del LIKE',
      ),
      ['Fito Galli', 'Alejandra Díaz'],
    );
    assert.deepEqual(
      invitadosDelTitulo('NOCHE D10 2024 - Daniel Baldi, Dr. Gustavo Alvarez, ALE BUS'),
      ['Daniel Baldi', 'Gustavo Alvarez', 'Ale Bus'],
    );
  });

  it('saca las columnas fijas, que no son invitados', () => {
    assert.deepEqual(
      invitadosDelTitulo(
        'NOCHE D10 / RODRIGO GOÑI - LA VERDAD DE LA MILANESA 2 - DOUGLAS VAZQUEZ',
      ),
      ['Rodrigo Goñi', 'Douglas Vazquez'],
    );
    assert.deepEqual(
      invitadosDelTitulo(
        'NOCHE D10 2026 | Luis Orpi - Carlos Goberna Jr. - Columna Tenencia Compartida',
      ),
      ['Luis Orpi', 'Carlos Goberna Jr.'],
    );
  });

  it('formato "X, Y en Noche D10"', () => {
    assert.deepEqual(
      invitadosDelTitulo(
        'Sandra Rodríguez, Richard Núñez, Gustavo Álvarez en Noche D10',
      ),
      ['Sandra Rodríguez', 'Richard Núñez', 'Gustavo Álvarez'],
    );
    assert.deepEqual(invitadosDelTitulo('FITO GALLI en NOCHE D10 (2026)'), [
      'Fito Galli',
    ]);
  });

  it('formato "X, Y y Z: en Noche D10" con dos puntos antes de la marca', () => {
    assert.deepEqual(
      invitadosDelTitulo('Miguel Cufos, Jorge Gandini y Solange: en Noche D10'),
      ['Miguel Cufos', 'Jorge Gandini y Solange'],
    );
  });

  it('no deja comillas de apodo abiertas ni títulos profesionales encadenados', () => {
    assert.deepEqual(
      invitadosDelTitulo(
        'NOCHE D10 2024 - Las Queridas,  Jorge Pintos "Rafo", La Verdad de la Milanesa',
      ),
      ['Las Queridas', 'Jorge Pintos "Rafo"'],
    );
    assert.deepEqual(
      invitadosDelTitulo(
        'NOCHE D10  2024 - Eduardo Espinel, Abogada Dra. Natalia Ruiz Díaz',
      ),
      ['Eduardo Espinel', 'Natalia Ruiz Díaz'],
    );
  });

  it('formato "X, rol, en NOCHE D10!" se queda con el nombre', () => {
    assert.deepEqual(
      invitadosDelTitulo('🎤✨ Alejandra Díaz, cantante, en NOCHE D10 !'),
      ['Alejandra Díaz'],
    );
  });

  it('formato editorial "X SIN FILTROS: ..."', () => {
    assert.deepEqual(
      invitadosDelTitulo(
        'ROBERT SILVA, SIN FILTROS: Gobierno, oposición y lo que viene l NOCHE D10',
      ),
      ['Robert Silva'],
    );
  });

  it('un título sin nombres no inventa invitados', () => {
    assert.deepEqual(
      invitadosDelTitulo('NOCHE D10 / Martes 27 de Septiembre de 2022'),
      [],
    );
    assert.deepEqual(
      invitadosDelTitulo(
        'NOCHE DE 10 | Edición - 13-08-26 - EN VIVO --- Beta Contenidos',
      ),
      [],
    );
  });
});

describe('descartar', () => {
  it('descarta los shorts', () => {
    assert.equal(descartar(entrada('"Te vas a ir en muletas" 😳⚽', 45)), 'short');
  });

  it('descarta TODO D10 hasta que el cliente confirme si es el mismo programa', () => {
    assert.equal(
      descartar(
        entrada('TODO D10 / Marcel Keoroglián - Andrés Abt / 16-08-2020', 96 * 60),
      ),
      'todo-d10',
    );
  });

  it('no descarta una entrevista ni un programa', () => {
    assert.equal(
      descartar(entrada('NOCHE D10 l ANITA VALIENTE l Entrevista Completa')),
      null,
    );
  });
});

describe('clasificar', () => {
  it('el estreno del programa completo', () => {
    const pieza = clasificar(
      entrada(
        'NOCHE DE 10 | SERGIO SECINARO / ROBERT SILVA / ALEJANDRO QUINTINO l 18-08-26 - ESTRENO',
        2 * HORA,
      ),
    );
    assert.equal(pieza.tipo, 'emision');
    assert.equal(pieza.pase, 'estreno');
    assert.equal(pieza.fechaEmision, '2026-08-18');
    assert.equal(pieza.fechaDeducida, false);
    assert.deepEqual(pieza.invitados, [
      'Sergio Secinaro',
      'Robert Silva',
      'Alejandro Quintino',
    ]);
  });

  it('la emisión en vivo', () => {
    const pieza = clasificar(
      entrada(
        'NOCHE DE 10 | Edición - 13-08-26 - EN VIVO --- Beta Contenidos',
        2 * HORA,
      ),
    );
    assert.equal(pieza.pase, 'vivo');
    assert.equal(pieza.fechaEmision, '2026-08-13');
  });

  it('un programa de más de una hora sin pase es un programa de pase único', () => {
    const pieza = clasificar(
      entrada(
        'NOCHE D10 2024 - Eduardo Acevedo,  Gaby Montenegro',
        2 * HORA,
        '2024-09-13T22:00:00Z',
      ),
    );
    assert.equal(pieza.tipo, 'emision');
    assert.equal(pieza.pase, 'unico');
    assert.deepEqual(pieza.invitados, ['Eduardo Acevedo', 'Gaby Montenegro']);
  });

  it('sin fecha en el título usa la de publicación en Montevideo y lo marca', () => {
    const pieza = clasificar(
      entrada(
        'NOCHE D10 2024 - Eduardo Acevedo,  Gaby Montenegro',
        2 * HORA,
        '2024-09-14T01:30:00Z',
      ),
    );
    assert.equal(pieza.fechaEmision, '2024-09-13');
    assert.equal(pieza.fechaDeducida, true);
  });

  it('un "X, Y en Noche D10" de dos horas es un programa, no una entrevista', () => {
    const pieza = clasificar(
      entrada(
        'Sandra Rodríguez, Richard Núñez, Gustavo Álvarez en Noche D10',
        2 * HORA,
      ),
    );
    assert.equal(pieza.tipo, 'emision');
  });

  it('un programa sin nombres en el título no arrastra la basura del título', () => {
    const pieza = clasificar(
      entrada('NOCHE D10 30 08 OK', 2 * HORA, '2022-09-01T10:00:00Z'),
    );
    assert.equal(pieza.titulo, 'Programa completo');
    assert.equal(pieza.fechaEmision, '2022-08-30');
  });

  it('el recorte "X en Noche D10" se titula con el nombre, sin el "en" colgando', () => {
    assert.equal(
      clasificar(entrada('Sonora Palacio en Noche D10')).titulo,
      'Sonora Palacio',
    );
    assert.equal(
      clasificar(entrada("LEO CARLINI (PECHO E' FIERRO) EN NOCHE D10 / OCTUBRE 2024"))
        .titulo,
      "Leo Carlini (pecho e' fierro)",
    );
  });

  it('el segmento de humor con separador al principio se titula con el invitado', () => {
    const pieza = clasificar(
      entrada('l JAIME EL MÍSTICO l Segmento de Humor con Luis Orpi'),
    );
    assert.equal(pieza.tipo, 'humor');
    assert.equal(pieza.titulo, 'Jaime el Místico');
  });

  it('la entrevista completa', () => {
    const pieza = clasificar(
      entrada('NOCHE D10 l WASHINGTON "TURCO" ABDALA l Entrevista Completa'),
    );
    assert.equal(pieza.tipo, 'entrevista');
    assert.equal(pieza.fechaEmision, null);
    assert.deepEqual(pieza.invitados, ['Washington "Turco" Abdala']);
    assert.equal(pieza.titulo, 'Washington "Turco" Abdala');
  });

  it('el segmento de humor, aunque falte el separador', () => {
    const pieza = clasificar(
      entrada('NOCHE D10 SERGIO SOSA l Las Humoradas de Luis Orpi'),
    );
    assert.equal(pieza.tipo, 'humor');
    assert.deepEqual(pieza.invitados, ['Sergio Sosa']);
  });

  it('la columna con disertantes', () => {
    const pieza = clasificar(
      entrada(
        '“Tenencia Compartida ” 2 CAP - Disertantes: Raúl Menéndez• Marcel Mantero',
      ),
    );
    assert.equal(pieza.tipo, 'columna');
    assert.deepEqual(pieza.invitados, ['Raúl Menéndez', 'Marcel Mantero']);
  });

  it('la columna del fin del mundo', () => {
    const pieza = clasificar(
      entrada('🌍⚖️ EP. 2 "La columna del fin del mundo" con Gustavo Salle'),
    );
    assert.equal(pieza.tipo, 'columna');
    assert.deepEqual(pieza.invitados, ['Gustavo Salle']);
  });

  it('el título editorial queda limpio de emojis y de marca', () => {
    const pieza = clasificar(
      entrada(
        'SERGIO SECINARO SIN FILTROS: “HAY COSAS QUE MUCHOS NO SE ANIMAN A DECIR” | NOCHE D10',
      ),
    );
    assert.equal(
      pieza.titulo,
      'Sergio Secinaro sin filtros: “hay cosas que muchos no se animan a decir”',
    );
    assert.deepEqual(pieza.invitados, ['Sergio Secinaro']);
  });
});
