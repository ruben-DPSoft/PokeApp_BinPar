import { describe, expect, it } from 'vitest';
import {
  isAcceptableGuess,
  levenshtein,
  normalizeGuess,
  typoTolerance,
} from './match';

describe('normalizeGuess', () => {
  it('reduce mayúsculas y puntuación a un slug uniforme', () => {
    expect(normalizeGuess('Mr. Mime')).toBe('mrmime');
    expect(normalizeGuess('MR-MIME')).toBe('mrmime');
    expect(normalizeGuess('mr mime')).toBe('mrmime');
  });

  it('quita acentos y caracteres no alfanuméricos', () => {
    expect(normalizeGuess('Pokémon')).toBe('pokemon');
    expect(normalizeGuess("Farfetch'd")).toBe('farfetchd');
    expect(normalizeGuess('Nidoran♀')).toBe('nidoran');
  });
});

describe('levenshtein', () => {
  it('devuelve 0 para cadenas idénticas y la longitud del otro si una está vacía', () => {
    expect(levenshtein('pikachu', 'pikachu')).toBe(0);
    expect(levenshtein('', 'mew')).toBe(3);
    expect(levenshtein('mew', '')).toBe(3);
  });

  it('cuenta inserción, borrado y sustitución como una operación cada una', () => {
    expect(levenshtein('pikachu', 'pikachuu')).toBe(1); // inserción
    expect(levenshtein('pikachu', 'pikach')).toBe(1); // borrado
    expect(levenshtein('pikachu', 'pikachi')).toBe(1); // sustitución
    expect(levenshtein('charizard', 'charixard')).toBe(1);
    expect(levenshtein('bulbasaur', 'bulbasur')).toBe(1);
  });
});

describe('typoTolerance', () => {
  it('permite 1 typo en nombres cortos y 2 en nombres largos (≥10)', () => {
    expect(typoTolerance(3)).toBe(1); // Mew
    expect(typoTolerance(7)).toBe(1); // Pikachu
    expect(typoTolerance(9)).toBe(1); // Bulbasaur
    expect(typoTolerance(10)).toBe(2); // Charmander
    expect(typoTolerance(15)).toBe(2);
  });
});

describe('isAcceptableGuess', () => {
  it('acepta exactos y "casi" según la tolerancia por longitud', () => {
    expect(isAcceptableGuess('Pikachu', 'pikachu')).toBe(true);
    expect(isAcceptableGuess('Pikachi', 'pikachu')).toBe(true); // 1 typo, len < 10
    expect(isAcceptableGuess('Charmandr', 'charmander')).toBe(true); // 1 typo, len 10
    expect(isAcceptableGuess('Charmender', 'charmander')).toBe(true); // 1 typo
  });

  it('rechaza cadenas vacías y diferencias mayores que la tolerancia', () => {
    expect(isAcceptableGuess('', 'pikachu')).toBe(false);
    expect(isAcceptableGuess('   ', 'pikachu')).toBe(false);
    expect(isAcceptableGuess('charizard', 'pikachu')).toBe(false);
    // Nombres cortos: 2 typos NO se aceptan (anti-colisión sex variants etc.)
    expect(isAcceptableGuess('pikachux', 'pikachu')).toBe(true); // 1
    expect(isAcceptableGuess('pakaXhu', 'pikachu')).toBe(false); // 2
  });
});
