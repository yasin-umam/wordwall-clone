import type { ActivityContent, TemplateType } from './content';

export * from './content';

/** Pengaturan main per-aktivitas (jsonb settings). */
export interface ActivitySettings {
  /** Tampilkan & hitung timer saat main. */
  timer?: boolean;
  /** Acak urutan item/opsi. */
  shuffle?: boolean;
  /** Tampilkan jawaban benar setelah memilih (quiz). */
  showAnswer?: boolean;
}

/** Baris tabel `activities`. */
export interface Activity {
  id: string;
  owner_id: string;
  title: string;
  template_type: TemplateType;
  content: ActivityContent;
  theme: string;
  settings: ActivitySettings;
  is_public: boolean;
  share_slug: string | null;
  created_at: string;
  updated_at: string;
}

/** Payload untuk membuat / memperbarui aktivitas (kolom yang diatur klien). */
export type ActivityDraft = Pick<
  Activity,
  'title' | 'template_type' | 'content' | 'theme' | 'settings' | 'is_public'
> & { share_slug?: string | null };

/** Baris tabel `play_results`. */
export interface PlayResult {
  id: string;
  activity_id: string;
  player_name: string;
  score: number;
  time_ms: number | null;
  accuracy: number | null;
  played_at: string;
}

/** Hasil yang dihasilkan template lewat onComplete(). */
export interface GameResult {
  score: number;
  timeMs: number;
  /** 0..1 */
  accuracy: number;
  /** Detail opsional untuk ringkasan. */
  correct?: number;
  total?: number;
}

export interface Profile {
  id: string;
  display_name: string | null;
  created_at: string;
}
