import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { TemplateProps } from './types';
import { getItems } from '@/lib/contentEngine';
import { buildResult } from '@/lib/scoring';
import { useStopwatch } from '@/hooks/useStopwatch';
import { GameHud } from '@/components/game/GameHud';
import { EmptyState, FinishedCard, GameButton } from './shared';

const PALETTE = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6', '#22d3ee', '#fb923c'];

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function segmentPath(cx: number, cy: number, r: number, start: number, end: number) {
  const a = polar(cx, cy, r, start);
  const b = polar(cx, cy, r, end);
  const large = end - start > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${a.x} ${a.y} A ${r} ${r} 0 ${large} 1 ${b.x} ${b.y} Z`;
}

export function WheelTemplate({ content, settings, theme, preview, onComplete }: TemplateProps) {
  const labels = useMemo(
    () => getItems(content).map((it) => it.q.trim()).filter(Boolean),
    [content],
  );

  const { elapsed, stop } = useStopwatch(labels.length > 0);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [spins, setSpins] = useState(0);
  const [removed, setRemoved] = useState<Set<number>>(new Set());
  const [autoRemove, setAutoRemove] = useState(false);
  const [done, setDone] = useState(false);

  if (labels.length === 0) {
    return <EmptyState theme={theme} message="Tambahkan minimal satu item untuk Random Wheel." />;
  }

  const active = labels.map((label, i) => ({ label, i })).filter((x) => !removed.has(x.i));
  const seg = 360 / active.length;
  const size = 300;
  const cx = size / 2;
  const r = size / 2 - 4;

  function spin() {
    if (spinning || active.length === 0) return;
    setSpinning(true);
    setResult(null);
    const pickPos = Math.floor(Math.random() * active.length);
    const targetCenter = pickPos * seg + seg / 2;
    const base = (360 - targetCenter + 360) % 360;
    const newRotation = rotation - (rotation % 360) + base + 360 * 5;
    setRotation(newRotation);
    setSpins((s) => s + 1);
    window.setTimeout(() => {
      setSpinning(false);
      setResult(active[pickPos].i);
      if (autoRemove) {
        setRemoved((prev) => new Set(prev).add(active[pickPos].i));
      }
    }, 3600);
  }

  function finish() {
    stop();
    setDone(true);
    onComplete(buildResult({ correct: spins, total: Math.max(spins, 1), timeMs: elapsed }));
  }

  if (done) {
    return <FinishedCard theme={theme} score={spins * 100} timeMs={elapsed} />;
  }

  return (
    <div className="flex flex-1 flex-col items-center">
      <GameHud theme={theme} score={spins * 100} timeMs={elapsed} showTimer={!!settings.timer} />

      <div className="relative mt-2 flex flex-col items-center">
        {/* pointer */}
        <div
          className="z-10 -mb-2 h-0 w-0"
          style={{
            borderLeft: '14px solid transparent',
            borderRight: '14px solid transparent',
            borderTop: `24px solid ${theme.accent}`,
          }}
        />
        <motion.svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          animate={{ rotate: rotation }}
          transition={{ duration: 3.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.25))' }}
        >
          {active.map((item, pos) => {
            const start = pos * seg;
            const end = start + seg;
            const mid = start + seg / 2;
            const labelPos = polar(cx, cx, r * 0.62, mid);
            return (
              <g key={item.i}>
                <path d={segmentPath(cx, cx, r, start, end)} fill={PALETTE[pos % PALETTE.length]} stroke="#fff" strokeWidth={2} />
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  fill="#1f2937"
                  fontSize={active.length > 8 ? 11 : 14}
                  fontWeight={800}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${mid}, ${labelPos.x}, ${labelPos.y})`}
                >
                  {item.label.length > 14 ? `${item.label.slice(0, 13)}…` : item.label}
                </text>
              </g>
            );
          })}
          <circle cx={cx} cy={cx} r={18} fill="#fff" stroke={theme.accent} strokeWidth={4} />
        </motion.svg>
      </div>

      <div className="mt-5 flex flex-col items-center gap-3">
        <GameButton theme={theme} onClick={spin} disabled={spinning || active.length === 0}>
          {spinning ? 'Memutar…' : '🎡 Putar'}
        </GameButton>

        {result !== null && !spinning && (
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-2xl border-2 px-6 py-3 text-center text-xl font-black shadow-sm"
            style={{ background: theme.card, borderColor: theme.accent, color: theme.text }}
          >
            👉 {labels[result]}
          </motion.div>
        )}

        <label className="flex cursor-pointer items-center gap-2 text-sm font-bold opacity-80">
          <input
            type="checkbox"
            checked={autoRemove}
            onChange={(e) => setAutoRemove(e.target.checked)}
            className="h-4 w-4 accent-current"
          />
          Hapus item setelah terpilih
        </label>

        <GameButton theme={theme} variant="surface" onClick={finish}>
          ✅ Selesai
        </GameButton>
      </div>

      {preview && (
        <p className="mt-4 text-center text-xs opacity-70">Mode preview — hasil tidak disimpan.</p>
      )}
    </div>
  );
}
