// =============================================================================
// CONTENT ENGINE — logika inti yang memisahkan DATA dari TEMPLATE.
// Menentukan "shape" konten, kompatibilitas template, dan konversi antar-shape
// agar fitur Switch Template terasa mulus.
// =============================================================================
import type {
  ActivityContent,
  ContentShape,
  Pair,
  QuizItem,
  TemplateType,
  WordItem,
} from '@/types';

/** Shape yang dikonsumsi tiap template. */
export const TEMPLATE_SHAPE: Record<TemplateType, ContentShape> = {
  quiz: 'items',
  open_box: 'items',
  wheel: 'items',
  match_up: 'pairs',
  flashcards: 'pairs',
  anagram: 'words',
};

/** Template lain yang berbagi shape sama (switch tanpa kehilangan data). */
export function siblingTemplates(template: TemplateType): TemplateType[] {
  const shape = TEMPLATE_SHAPE[template];
  return (Object.keys(TEMPLATE_SHAPE) as TemplateType[]).filter(
    (t) => t !== template && TEMPLATE_SHAPE[t] === shape,
  );
}

// ----- normalisasi & pembacaan ----------------------------------------------

export function getItems(content: ActivityContent): QuizItem[] {
  return Array.isArray(content.items) ? content.items : [];
}
export function getPairs(content: ActivityContent): Pair[] {
  return Array.isArray(content.pairs) ? content.pairs : [];
}
export function getWords(content: ActivityContent): WordItem[] {
  return Array.isArray(content.words) ? content.words : [];
}

/** Shape utama yang saat ini punya data (untuk menandai kompatibilitas). */
export function detectShape(content: ActivityContent): ContentShape | null {
  if (getItems(content).length) return 'items';
  if (getPairs(content).length) return 'pairs';
  if (getWords(content).length) return 'words';
  return null;
}

/** Berapa baris data yang ada untuk sebuah shape. */
export function countForShape(content: ActivityContent, shape: ContentShape): number {
  if (shape === 'items') return getItems(content).length;
  if (shape === 'pairs') return getPairs(content).length;
  return getWords(content).length;
}

/** Konten dianggap kosong bila tak ada shape berisi data. */
export function isContentEmpty(content: ActivityContent): boolean {
  return detectShape(content) === null;
}

// ----- kompatibilitas template -----------------------------------------------

export type Compatibility =
  | { kind: 'native'; loss: false } // shape sama persis dengan data sekarang
  | { kind: 'convert'; loss: boolean } // perlu konversi (mungkin ada kehilangan)
  | { kind: 'empty' }; // belum ada data, template apa pun boleh

/**
 * Evaluasi memindahkan `content` ke `target`. Dipakai grid Switch Template untuk
 * menandai mana yang langsung cocok vs perlu konversi.
 */
export function evaluateSwitch(
  content: ActivityContent,
  target: TemplateType,
): Compatibility {
  const current = detectShape(content);
  if (!current) return { kind: 'empty' };

  const targetShape = TEMPLATE_SHAPE[target];
  if (current === targetShape) return { kind: 'native', loss: false };

  // butuh konversi lintas-shape
  return { kind: 'convert', loss: conversionLoses(current, targetShape) };
}

/** Apakah konversi shape ini berpotensi kehilangan informasi. */
function conversionLoses(from: ContentShape, to: ContentShape): boolean {
  // pairs -> items : kehilangan distraktor (hanya 1 jawaban benar dibuat)
  // items -> pairs : kehilangan opsi distraktor
  // apa pun -> words : kehilangan opsi/petunjuk
  // words -> lainnya : tidak ada petunjuk jawaban kaya
  if (from === to) return false;
  return true;
}

// ----- konversi antar-shape --------------------------------------------------

/**
 * Konversi best-effort dari konten saat ini ke shape yang dibutuhkan `target`.
 * Selalu mengembalikan ActivityContent baru. Bila sudah cocok, dikembalikan apa
 * adanya (key shape lain dipertahankan agar bisa kembali tanpa kehilangan data).
 */
export function convertContent(
  content: ActivityContent,
  target: TemplateType,
): ActivityContent {
  const targetShape = TEMPLATE_SHAPE[target];
  const current = detectShape(content);
  if (!current || current === targetShape) return content;

  switch (targetShape) {
    case 'items':
      return { ...content, items: toItems(content, current) };
    case 'pairs':
      return { ...content, pairs: toPairs(content, current) };
    case 'words':
      return { ...content, words: toWords(content, current) };
    default:
      return content;
  }
}

function toItems(content: ActivityContent, from: ContentShape): QuizItem[] {
  if (from === 'pairs') {
    // left = pertanyaan, right = jawaban benar; pakai right pasangan lain sbg distraktor
    const pairs = getPairs(content);
    const answers = pairs.map((p) => p.right);
    return pairs.map((p, i) => {
      const distractors = answers.filter((_, j) => j !== i);
      const picked = shufflePick(distractors, 3);
      const options = shuffleInPlace([p.right, ...picked]);
      return { q: p.left, options, answer: options.indexOf(p.right) };
    });
  }
  // words -> items: tebak kata dari petunjuk (kata jadi jawaban)
  const words = getWords(content);
  const allWords = words.map((w) => w.word);
  return words.map((w, i) => {
    const distractors = shufflePick(
      allWords.filter((_, j) => j !== i),
      3,
    );
    const options = shuffleInPlace([w.word, ...distractors]);
    return {
      q: w.hint ? `Petunjuk: ${w.hint}` : `Kata apa ini? (${w.word.length} huruf)`,
      options,
      answer: options.indexOf(w.word),
    };
  });
}

function toPairs(content: ActivityContent, from: ContentShape): Pair[] {
  if (from === 'items') {
    // pertanyaan <-> jawaban benar
    return getItems(content)
      .filter((it) => it.options.length > 0)
      .map((it) => ({
        left: it.q,
        right: it.options[it.answer] ?? it.options[0] ?? '',
      }));
  }
  // words -> pairs: kata <-> petunjuk
  return getWords(content).map((w) => ({
    left: w.word,
    right: w.hint ?? w.word,
  }));
}

function toWords(content: ActivityContent, from: ContentShape): WordItem[] {
  if (from === 'pairs') {
    return getPairs(content).map((p) => ({ word: p.left, hint: p.right }));
  }
  // items -> words: jawaban benar jadi kata, pertanyaan jadi petunjuk
  return getItems(content).map((it) => ({
    word: (it.options[it.answer] ?? it.q).toString(),
    hint: it.q,
  }));
}

// ----- helper internal -------------------------------------------------------

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function shufflePick<T>(arr: T[], n: number): T[] {
  return shuffleInPlace(arr.slice()).slice(0, n);
}

// ----- konten kosong default per template ------------------------------------

export function emptyContentFor(template: TemplateType): ActivityContent {
  switch (TEMPLATE_SHAPE[template]) {
    case 'items':
      return { items: [{ q: '', options: ['', ''], answer: 0 }] };
    case 'pairs':
      return { pairs: [{ left: '', right: '' }] };
    case 'words':
      return { words: [{ word: '', hint: '' }] };
  }
}

/** Ringkasan jumlah butir untuk ditampilkan di kartu. */
export function contentSummary(content: ActivityContent): string {
  const shape = detectShape(content);
  if (!shape) return 'Belum ada konten';
  const n = countForShape(content, shape);
  const label = shape === 'items' ? 'soal' : shape === 'pairs' ? 'pasangan' : 'kata';
  return `${n} ${label}`;
}
