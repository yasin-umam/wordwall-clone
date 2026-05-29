/** Gabung className bersyarat (mirip clsx ringkas). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** Fisher–Yates shuffle (mengembalikan array baru). */
export function shuffle<T>(arr: readonly T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Format milidetik -> "1:23" atau "0:09". */
export function formatTime(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Slug acak pendek untuk link publik (tidak meng-expose UUID). */
export function randomSlug(len = 8): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < len; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

/** Slug dari judul + suffix acak, agar mudah dibaca. */
export function slugFromTitle(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 32)
    .replace(/^-|-$/g, '');
  return `${base || 'main'}-${randomSlug(5)}`;
}

/** Pengganti crypto.randomUUID untuk id sementara di klien. */
export function tempId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `tmp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  );
}
