import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * True bila kredensial Supabase tersedia. Dipakai UI untuk men-disable fitur
 * yang butuh backend (auth, simpan, leaderboard) dan menampilkan mode demo lokal.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    '[PlayLearn] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY belum diset. ' +
      'Aplikasi berjalan dalam mode demo lokal (tanpa simpan/login). ' +
      'Salin .env.example ke .env untuk mengaktifkan backend.',
  );
}

// Placeholder aman agar createClient tidak melempar error saat env kosong.
export const supabase = createClient<Database>(
  url ?? 'http://localhost:54321',
  anonKey ?? 'public-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
