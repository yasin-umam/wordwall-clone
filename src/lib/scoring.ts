import type { GameResult } from '@/types';

/** Poin dasar per jawaban benar (skor dihitung client-side di Fase 1). */
export const POINTS_PER_CORRECT = 100;

/**
 * Bonus kecepatan opsional: makin cepat menjawab, makin besar bonus (maks 50%).
 * elapsedMs = waktu menjawab butir ini, limitMs = ambang penuh-bonus.
 */
export function speedBonus(elapsedMs: number, limitMs = 8000): number {
  if (elapsedMs >= limitMs) return 0;
  const ratio = 1 - elapsedMs / limitMs;
  return Math.round(POINTS_PER_CORRECT * 0.5 * ratio);
}

/** Bentuk hasil akhir yang konsisten dari (benar / total / waktu). */
export function buildResult(args: {
  correct: number;
  total: number;
  timeMs: number;
  bonus?: number;
}): GameResult {
  const { correct, total, timeMs, bonus = 0 } = args;
  return {
    score: correct * POINTS_PER_CORRECT + bonus,
    timeMs,
    accuracy: total > 0 ? correct / total : 0,
    correct,
    total,
  };
}
