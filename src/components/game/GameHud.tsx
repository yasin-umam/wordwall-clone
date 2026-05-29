import { formatTime } from '@/lib/utils';
import type { Theme } from '@/lib/themes';

/** Bar info atas saat bermain: skor, timer (opsional), dan progres. */
export function GameHud({
  theme,
  score,
  timeMs,
  showTimer,
  progress,
}: {
  theme: Theme;
  score: number;
  timeMs: number;
  showTimer: boolean;
  /** [current, total] */
  progress?: [number, number];
}) {
  const chip = {
    background: theme.card,
    borderColor: theme.cardBorder,
    color: theme.text,
  };
  return (
    <div className="mb-4 flex items-center justify-between gap-2">
      <div
        className="rounded-full border px-4 py-1.5 text-sm font-extrabold shadow-sm"
        style={chip}
      >
        ⭐ {score}
      </div>
      {progress && (
        <div
          className="rounded-full border px-4 py-1.5 text-sm font-bold shadow-sm"
          style={chip}
        >
          {progress[0]} / {progress[1]}
        </div>
      )}
      {showTimer && (
        <div
          className="rounded-full border px-4 py-1.5 text-sm font-extrabold tabular-nums shadow-sm"
          style={chip}
        >
          ⏱ {formatTime(timeMs)}
        </div>
      )}
    </div>
  );
}
