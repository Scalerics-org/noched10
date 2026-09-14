/**
 * Casos de prueba del parser. Todos los títulos de acá son reales, copiados
 * del feed del canal el 14/09/2026. Cuando aparezca un formato nuevo, el caso
 * se agrega acá primero y recién después se toca `feed.ts`.
 *
 * Corre con: npm test
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  aNombrePropio,
  clasificar,
  fechaDesdeTitulo,
  separarInvitados,
} from './feed.ts';

const entrada = (titulo: string) => ({
  videoId: 'xxx',
  titulo,
  publicado: '2026-08-19T01:04:41+00:00',
  descripcion: '',
});

describe('fechaDesdeTitulo', () => {
  it('lee el formato dd-mm-aa del canal', () => {
    assert.equal(fechaDesdeTitulo('l 18-08-26 - ESTRENO'), '2026-08-18');
  });

  it('devuelve null si el título no trae fecha', () => {
    assert.equal(fechaDesdeTitulo('NOCHE D10 l ANITA VALIENTE'), null);
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

describe('separarInvitados', () => {
  it('separa por barra', () => {
    assert.deepEqual(separarInvitados('SERGIO SECINARO / ROBERT SILVA'), [
      'Sergio Secinaro',
      'Robert Silva',
    ]);
  });

  it('separa por guión y descarta el paréntesis de la banda', () => {
    assert.deepEqual(
      separarInvitados('CARLOS GOBERNA JR. - MARCEL GOBERNA (ORQUESTA LA DECANA)'),
      ['Carlos Goberna Jr.', 'Marcel Goberna'],
    );
  });
});

describe('clasificar', () => {
  it('reconoce el estreno del programa completo y le saca los tres invitados', () => {
    const pieza = clasificar(
      entrada(
        'NOCHE DE 10 | SERGIO SECINARO / ROBERT SILVA / ALEJANDRO QUINTINO l 18-08-26 - ESTRENO',
      ),
    );
    assert.equal(pieza?.tipo, 'emision');
    assert.equal(pieza?.pase, 'estreno');
    assert.equal(pieza?.fechaEmision, '2026-08-18');
    assert.deepEqual(pieza?.invitados, [
      'Sergio Secinaro',
      'Robert Silva',
      'Alejandro Quintino',
    ]);
  });

  it('reconoce la emisión en vivo, que no lista invitados', () => {
    const pieza = clasificar(
      entrada('NOCHE DE 10 | Edición - 13-08-26 - EN VIVO --- Beta Contenidos'),
    );
    assert.equal(pieza?.tipo, 'emision');
    assert.equal(pieza?.pase, 'vivo');
    assert.equal(pieza?.fechaEmision, '2026-08-13');
    assert.deepEqual(pieza?.invitados, []);
  });

  it('reconoce la entrevista completa con separador "l"', () => {
    const pieza = clasificar(
      entrada('NOCHE D10 l ANITA VALIENTE l Entrevista Completa'),
    );
    assert.equal(pieza?.tipo, 'entrevista');
    assert.deepEqual(pieza?.invitados, ['Anita Valiente']);
  });

  it('reconoce la entrevista aunque el invitado tenga comillas', () => {
    const pieza = clasificar(
      entrada('NOCHE D10 l WASHINGTON "TURCO" ABDALA l Entrevista Completa'),
    );
    assert.equal(pieza?.tipo, 'entrevista');
    assert.deepEqual(pieza?.invitados, ['Washington "Turco" Abdala']);
  });

  it('reconoce el segmento de humor', () => {
    const pieza = clasificar(
      entrada('NOCHE D10 l EL GUAPO MALAVIA l Las Humoradas de Luis Orpi'),
    );
    assert.equal(pieza?.tipo, 'humor');
    assert.deepEqual(pieza?.invitados, ['El Guapo Malavia']);
  });

  it('reconoce el humor aunque falte el separador después de la marca', () => {
    const pieza = clasificar(
      entrada('NOCHE D10 SERGIO SOSA l Las Humoradas de Luis Orpi'),
    );
    assert.equal(pieza?.tipo, 'humor');
    assert.deepEqual(pieza?.invitados, ['Sergio Sosa']);
  });

  it('reconoce la entrevista en formato editorial', () => {
    const pieza = clasificar(
      entrada(
        'ROBERT SILVA, SIN FILTROS: Gobierno, oposición, Partido Colorado y lo que viene l NOCHE D10',
      ),
    );
    assert.equal(pieza?.tipo, 'entrevista');
    assert.deepEqual(pieza?.invitados, ['Robert Silva']);
  });

  it('corta el nombre en SIN FILTROS aunque no venga la coma', () => {
    const pieza = clasificar(
      entrada(
        'SERGIO SECINARO SIN FILTROS: “HAY COSAS QUE MUCHOS NO SE ANIMAN A DECIR” | NOCHE D10',
      ),
    );
    assert.deepEqual(pieza?.invitados, ['Sergio Secinaro']);
  });

  it('reconoce la columna con disertantes', () => {
    const pieza = clasificar(
      entrada(
        '“Tenencia Compartida ” 2 CAP - Disertantes: Raúl Menéndez• Marcel Mantero',
      ),
    );
    assert.equal(pieza?.tipo, 'columna');
    assert.deepEqual(pieza?.invitados, ['Raúl Menéndez', 'Marcel Mantero']);
  });

  it('reconoce el formato viejo "X en Noche D10"', () => {
    const pieza = clasificar(entrada('Sonora Palacio en Noche D10'));
    assert.equal(pieza?.tipo, 'entrevista');
    assert.deepEqual(pieza?.invitados, ['Sonora Palacio']);
  });

  it('devuelve null si no reconoce el formato, en vez de inventar', () => {
    assert.equal(clasificar(entrada('Un título que no sigue ningún formato')), null);
  });
});
