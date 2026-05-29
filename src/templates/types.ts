import type { ActivityContent, ActivitySettings, GameResult } from '@/types';
import type { Theme } from '@/lib/themes';

/**
 * INTERFACE PROPS SERAGAM untuk SEMUA template.
 * Menambah template baru = buat komponen dengan props ini + daftar ke registry.
 * Tidak perlu mengubah editor inti maupun play mode.
 */
export interface TemplateProps {
  /** Data konten template-agnostic. */
  content: ActivityContent;
  /** Pengaturan main (timer, shuffle, dll). */
  settings: ActivitySettings;
  /** Tema visual yang sudah di-resolve. */
  theme: Theme;
  /** True saat dirender di panel preview editor (interaksi tetap jalan, hasil tidak disimpan). */
  preview?: boolean;
  /** Dipanggil saat permainan selesai dengan hasil akhir. */
  onComplete: (result: GameResult) => void;
}
