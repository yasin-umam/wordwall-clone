import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { TemplateProps } from './types';
import { getPairs } from '@/lib/contentEngine';
import { buildResult } from '@/lib/scoring';
import { shuffle } from '@/lib/utils';
import { useStopwatch } from '@/hooks/useStopwatch';
import { GameHud } from '@/components/game/GameHud';
import { EmptyState, FinishedCard, GameButton } from './shared';

export function FlashCardsTemplate({ content, settings, theme, preview, onComplete }: TemplateProps) {
  const cards = useMemo(() => {
    const pairs = getPairs(content).filter((p) => p.left.trim() || p.right.trim());
    return settings.shuffle ? shuffle(pairs) : pairs;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, settings.shuffle]);

  const { elapsed, stop } = useStopwatch(cards.length > 0);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());
  const [done, setDone] = useState(false);

  if (cards.length === 0) {
    return <EmptyState theme={theme} message="Tambahkan minimal satu kartu untuk Flash Cards." />;
  }

  function go(delta: number) {
    setFlipped(false);
    setIndex((i) => Math.min(cards.length - 1, Math.max(0, i + delta)));
  }

  function mark(isKnown: boolean) {
    const next = new Set(known);
    if (isKnown) next.add(index);
    else next.delete(index);
    setKnown(next);
    if (index + 1 >= cards.length) finish(next);
    else go(1);
  }

  function finish(knownSet = known) {
    stop();
    setDone(true);
    onComplete(
      buildResult({ correct: knownSet.size, total: cards.length, timeMs: elapsed }),
    );
  }

  if (done) {
    return (
      <FinishedCard
        theme={theme}
        score={known.size * 100}
        correct={known.size}
        total={cards.length}
        timeMs={elapsed}
      >
        <p className="mt-2 text-sm font-bold opacity-70">kartu ditandai "sudah tahu"</p>
      </FinishedCard>
    );
  }

  const card = cards[index];

  return (
    <div className="flex flex-1 flex-col items-center">
      <GameHud
        theme={theme}
        score={known.size * 100}
        timeMs={elapsed}
        showTimer={!!settings.timer}
        progress={[index + 1, cards.length]}
      />

      <div className="flex flex-1 flex-col items-center justify-center gap-6 [perspective:1200px]">
        <motion.button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          className="relative h-56 w-full max-w-md cursor-pointer rounded-3xl [transform-style:preserve-3d]"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5 }}
          aria-label="Balik kartu"
        >
          {/* depan */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border-2 p-6 text-center shadow-lg [backface-visibility:hidden]"
            style={{ background: theme.card, borderColor: theme.cardBorder, color: theme.text }}
          >
            <span className="text-xs font-bold uppercase tracking-wide opacity-50">Depan</span>
            <span className="mt-2 text-3xl font-black">{card.left}</span>
            <span className="mt-4 text-xs opacity-50">klik untuk membalik</span>
          </div>
          {/* belakang */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border-2 p-6 text-center shadow-lg [backface-visibility:hidden] [transform:rotateY(180deg)]"
            style={{ background: theme.accent, borderColor: theme.accent, color: theme.accentContrast }}
          >
            <span className="text-xs font-bold uppercase tracking-wide opacity-70">Belakang</span>
            <span className="mt-2 text-3xl font-black">{card.right}</span>
          </div>
        </motion.button>

        <div className="flex items-center gap-3">
          <GameButton theme={theme} variant="surface" onClick={() => go(-1)} disabled={index === 0}>
            ‹ Mundur
          </GameButton>
          <GameButton
            theme={theme}
            variant="surface"
            onClick={() => go(1)}
            disabled={index === cards.length - 1}
          >
            Maju ›
          </GameButton>
        </div>

        <div className="flex items-center gap-3">
          <GameButton theme={theme} variant="surface" onClick={() => mark(false)}>
            ↻ Belum tahu
          </GameButton>
          <GameButton theme={theme} onClick={() => mark(true)}>
            ✓ Sudah tahu
          </GameButton>
        </div>
      </div>

      <GameButton theme={theme} variant="surface" className="mt-4" onClick={() => finish()}>
        ✅ Selesai
      </GameButton>

      {preview && (
        <p className="mt-4 text-center text-xs opacity-70">Mode preview — hasil tidak disimpan.</p>
      )}
    </div>
  );
}
