// =============================================================================
// TEMA VISUAL — ganti background/font/warna TANPA mengubah konten.
// Tema murni presentasi; template membaca nilai ini dari prop `theme`.
// =============================================================================

export interface Theme {
  id: string;
  name: string;
  /** Background panggung (boleh gradient). */
  background: string;
  /** Background kartu/tile. */
  card: string;
  cardBorder: string;
  /** Warna teks utama & redup. */
  text: string;
  muted: string;
  /** Aksen utama untuk tombol/sorotan + warna kontras di atasnya. */
  accent: string;
  accentContrast: string;
  /** Umpan balik benar/salah. */
  correct: string;
  wrong: string;
  /** Font family CSS. */
  fontFamily: string;
}

export const THEMES: Theme[] = [
  {
    id: 'classic',
    name: 'Klasik',
    background: 'linear-gradient(160deg, #eef5ff 0%, #f8fafc 100%)',
    card: '#ffffff',
    cardBorder: '#e2e8f0',
    text: '#0f172a',
    muted: '#64748b',
    accent: '#346dff',
    accentContrast: '#ffffff',
    correct: '#16a34a',
    wrong: '#ef4444',
    fontFamily: "'Nunito', system-ui, sans-serif",
  },
  {
    id: 'jungle',
    name: 'Rimba',
    background: 'linear-gradient(160deg, #14532d 0%, #166534 60%, #15803d 100%)',
    card: 'rgba(255,255,255,0.96)',
    cardBorder: '#bbf7d0',
    text: '#14532d',
    muted: '#3f6212',
    accent: '#f59e0b',
    accentContrast: '#1c1917',
    correct: '#15803d',
    wrong: '#dc2626',
    fontFamily: "'Baloo 2', 'Nunito', sans-serif",
  },
  {
    id: 'candy',
    name: 'Permen',
    background: 'linear-gradient(160deg, #fce7f3 0%, #fbcfe8 50%, #ddd6fe 100%)',
    card: '#ffffff',
    cardBorder: '#f9a8d4',
    text: '#831843',
    muted: '#9d174d',
    accent: '#ec4899',
    accentContrast: '#ffffff',
    correct: '#16a34a',
    wrong: '#e11d48',
    fontFamily: "'Baloo 2', 'Nunito', sans-serif",
  },
  {
    id: 'ocean',
    name: 'Samudra',
    background: 'linear-gradient(160deg, #0c4a6e 0%, #0369a1 55%, #0ea5e9 100%)',
    card: 'rgba(255,255,255,0.97)',
    cardBorder: '#bae6fd',
    text: '#0c4a6e',
    muted: '#075985',
    accent: '#06b6d4',
    accentContrast: '#06283d',
    correct: '#0d9488',
    wrong: '#ef4444',
    fontFamily: "'Nunito', system-ui, sans-serif",
  },
  {
    id: 'space',
    name: 'Antariksa',
    background: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 55%, #312e81 100%)',
    card: 'rgba(30,41,59,0.92)',
    cardBorder: '#4338ca',
    text: '#e0e7ff',
    muted: '#a5b4fc',
    accent: '#a78bfa',
    accentContrast: '#1e1b4b',
    correct: '#34d399',
    wrong: '#fb7185',
    fontFamily: "'Baloo 2', 'Nunito', sans-serif",
  },
];

const THEME_MAP = new Map(THEMES.map((t) => [t.id, t]));

export function getTheme(id: string | null | undefined): Theme {
  return (id && THEME_MAP.get(id)) || THEMES[0];
}
