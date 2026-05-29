// =============================================================================
// MODEL KONTEN — template-agnostic (disimpan sebagai jsonb di kolom content).
// Pisahkan tegas DATA KONTEN dari TEMPLATE TAMPILAN.
//
// Tiga "bentuk" (shape) konten:
//   - items : daftar soal/butir  -> quiz, open_box, wheel
//   - pairs : pasangan kiri-kanan -> match_up, flashcards
//   - words : kata + petunjuk     -> anagram
// =============================================================================

export type TemplateType =
  | 'quiz'
  | 'match_up'
  | 'anagram'
  | 'open_box'
  | 'wheel'
  | 'flashcards';

export type ContentShape = 'items' | 'pairs' | 'words';

/** Satu butir untuk daftar item (quiz/open_box/wheel). */
export interface QuizItem {
  /** Pertanyaan / label item. */
  q: string;
  /** Opsi jawaban. Untuk open_box/wheel boleh kosong. */
  options: string[];
  /** Index opsi yang benar (0-based). -1 bila tidak relevan. */
  answer: number;
}

/** Satu pasangan (match_up/flashcards). */
export interface Pair {
  left: string;
  right: string;
}

/** Satu kata untuk anagram. */
export interface WordItem {
  word: string;
  hint?: string;
}

export interface ItemsContent {
  items: QuizItem[];
}
export interface PairsContent {
  pairs: Pair[];
}
export interface WordsContent {
  words: WordItem[];
}

/**
 * Bentuk gabungan yang tersimpan di DB. Hanya satu key utama yang dipakai
 * sesuai shape template, tetapi disimpan longgar agar Switch Template mulus.
 */
export type ActivityContent = Partial<ItemsContent & PairsContent & WordsContent>;
