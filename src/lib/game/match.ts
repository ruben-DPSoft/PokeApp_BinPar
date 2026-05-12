/**
 * Helpers de matching del mini-juego "¿Quién es ese Pokémon?".
 *
 * Vive aquí (fuera del componente) para poder testearlo sin renderizar React.
 */

/**
 * Normaliza un input para comparar contra el slug canónico:
 *  - minúsculas
 *  - quita diacríticos (NFD + strip combining marks)
 *  - elimina cualquier cosa que no sea letra/dígito
 *
 * "Mr. Mime" / "mr-mime" / "MR MIME" → "mrmime".
 */
export function normalizeGuess(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Distancia de Levenshtein con DP de dos filas — O(n) memoria.
 * Para nombres ≤20 chars es instantáneo.
 */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  let prev: number[] = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const curr: number[] = [i];
    for (let j = 1; j <= b.length; j++) {
      const sameChar = a.charCodeAt(i - 1) === b.charCodeAt(j - 1);
      const del = (prev[j] ?? 0) + 1;
      const ins = (curr[j - 1] ?? 0) + 1;
      const sub = (prev[j - 1] ?? 0) + (sameChar ? 0 : 1);
      curr.push(Math.min(del, ins, sub));
    }
    prev = curr;
  }
  return prev[b.length] ?? 0;
}

/**
 * Umbral de typos permitidos según longitud. Conservador en nombres cortos
 * para evitar colisiones (Nidoran♀ vs Nidoran♂ están a distancia 1).
 */
export function typoTolerance(targetLen: number): number {
  return targetLen >= 10 ? 2 : 1;
}

/** Acepta el guess si es exacto o "casi" (≤ tolerancia por longitud). */
export function isAcceptableGuess(guess: string, target: string): boolean {
  const g = normalizeGuess(guess);
  const t = normalizeGuess(target);
  if (g.length === 0) return false;
  return levenshtein(g, t) <= typoTolerance(t.length);
}
