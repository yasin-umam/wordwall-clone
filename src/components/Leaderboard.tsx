import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { listResults, subscribeResults } from '@/lib/api';
import { formatTime } from '@/lib/utils';
import type { PlayResult } from '@/types';

const MEDALS = ['🥇', '🥈', '🥉'];

/** Leaderboard real-time per aktivitas (untuk main bareng di kelas). */
export function Leaderboard({
  activityId,
  highlightId,
  compact,
}: {
  activityId: string;
  highlightId?: string | null;
  compact?: boolean;
}) {
  const [rows, setRows] = useState<PlayResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    listResults(activityId)
      .then((r) => alive && setRows(r))
      .finally(() => alive && setLoading(false));

    // Realtime: tambah baris saat ada hasil baru, lalu urutkan ulang.
    const unsubscribe = subscribeResults(activityId, (row) => {
      setRows((prev) => {
        if (prev.some((r) => r.id === row.id)) return prev;
        return [...prev, row].sort(
          (a, b) => b.score - a.score || (a.time_ms ?? 0) - (b.time_ms ?? 0),
        );
      });
    });

    // WAJIB cleanup channel saat unmount.
    return () => {
      alive = false;
      unsubscribe();
    };
  }, [activityId]);

  if (loading) {
    return <p className="py-4 text-center text-sm text-slate-400">Memuat papan skor…</p>;
  }
  if (rows.length === 0) {
    return <p className="py-4 text-center text-sm text-slate-400">Belum ada skor. Jadilah yang pertama! 🎯</p>;
  }

  return (
    <ul className="space-y-2">
      <AnimatePresence initial={false}>
        {rows.slice(0, compact ? 5 : 50).map((r, i) => {
          const mine = highlightId === r.id;
          return (
            <motion.li
              key={r.id}
              layout
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
                mine ? 'bg-brand-100 ring-2 ring-brand-400' : 'bg-slate-50'
              }`}
            >
              <span className="w-7 text-center text-lg font-black text-slate-400">
                {MEDALS[i] ?? i + 1}
              </span>
              <span className="flex-1 truncate font-bold text-slate-800">{r.player_name}</span>
              {r.time_ms != null && (
                <span className="text-xs font-bold tabular-nums text-slate-400">
                  {formatTime(r.time_ms)}
                </span>
              )}
              <span className="font-black text-brand-600">{r.score}</span>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
