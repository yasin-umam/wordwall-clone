import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { Theme } from '@/lib/themes';
import { formatTime } from '@/lib/utils';

/** Tombol bertema untuk dipakai di dalam permainan. */
export function GameButton({
  theme,
  variant = 'accent',
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  theme: Theme;
  variant?: 'accent' | 'surface';
}) {
  const style =
    variant === 'accent'
      ? { background: theme.accent, color: theme.accentContrast, borderColor: theme.accent }
      : { background: theme.card, color: theme.text, borderColor: theme.cardBorder };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-2xl border-2 px-6 py-3 text-base font-extrabold shadow-sm transition-transform active:scale-95 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/10 ${className}`}
      style={style}
      {...rest}
    >
      {children}
    </button>
  );
}

export function EmptyState({ theme, message }: { theme: Theme; message: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <div className="text-5xl">🧩</div>
      <p className="mt-3 max-w-xs text-base font-bold opacity-80" style={{ color: theme.text }}>
        {message}
      </p>
    </div>
  );
}

export function FinishedCard({
  theme,
  score,
  correct,
  total,
  timeMs,
  onRestart,
  children,
}: {
  theme: Theme;
  score: number;
  correct?: number;
  total?: number;
  timeMs?: number;
  onRestart?: () => void;
  children?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="m-auto w-full max-w-sm rounded-3xl border-2 p-8 text-center shadow-lg"
      style={{ background: theme.card, borderColor: theme.cardBorder, color: theme.text }}
    >
      <div className="text-6xl">🎉</div>
      <h2 className="mt-3 font-display text-2xl font-black">Selesai!</h2>
      <div className="mt-4 text-4xl font-black" style={{ color: theme.accent }}>
        {score} <span className="text-lg font-bold opacity-70">poin</span>
      </div>
      <div className="mt-3 flex justify-center gap-4 text-sm font-bold opacity-80">
        {typeof correct === 'number' && typeof total === 'number' && (
          <span>
            ✓ {correct}/{total} benar
          </span>
        )}
        {typeof timeMs === 'number' && <span>⏱ {formatTime(timeMs)}</span>}
      </div>
      {children}
      {onRestart && (
        <GameButton theme={theme} className="mt-6 w-full" onClick={onRestart}>
          🔁 Main lagi
        </GameButton>
      )}
    </motion.div>
  );
}
