import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { TemplateProps } from './types';
import { getItems } from '@/lib/contentEngine';
import { buildResult } from '@/lib/scoring';
import { shuffle } from '@/lib/utils';
import { useStopwatch } from '@/hooks/useStopwatch';
import { GameHud } from '@/components/game/GameHud';
import { EmptyState, FinishedCard, GameButton } from './shared';

export function OpenBoxTemplate({ content, settings, theme, preview, onComplete }: TemplateProps) {
  const boxes = useMemo(() => {
    const items = getItems(content).filter((it) => it.q.trim());
    // setiap kotak menyembunyikan item acak
    return shuffle(items).map((it, i) => {
      const reveal = it.options.length
        ? `${it.q}\n→ ${it.options[it.answer] ?? it.options[0]}`
        : it.q;
      return { id: i, reveal };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const { elapsed, stop } = useStopwatch(boxes.length > 0);
  const [opened, setOpened] = useState<Set<number>>(new Set());
  const [active, setActive] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  if (boxes.length === 0) {
    return <EmptyState theme={theme} message="Tambahkan minimal satu item untuk Open the Box." />;
  }

  function openBox(id: number) {
    if (opened.has(id)) {
      setActive(id);
      return;
    }
    const next = new Set(opened).add(id);
    setOpened(next);
    setActive(id);
    if (next.size === boxes.length) stop();
  }

  function finish() {
    stop();
    setDone(true);
    onComplete(
      buildResult({ correct: opened.size, total: boxes.length, timeMs: elapsed }),
    );
  }

  if (done) {
    return (
      <FinishedCard
        theme={theme}
        score={opened.size * 100}
        correct={opened.size}
        total={boxes.length}
        timeMs={elapsed}
      />
    );
  }

  const activeBox = active !== null ? boxes.find((b) => b.id === active) : null;

  return (
    <div className="flex flex-1 flex-col">
      <GameHud
        theme={theme}
        score={opened.size * 100}
        timeMs={elapsed}
        showTimer={!!settings.timer}
        progress={[opened.size, boxes.length]}
      />

      {/* panel reveal */}
      <div
        className="mb-5 flex min-h-[120px] items-center justify-center rounded-2xl border-2 p-5 text-center shadow-sm"
        style={{ background: theme.card, borderColor: theme.cardBorder, color: theme.text }}
      >
        <AnimatePresence mode="wait">
          {activeBox ? (
            <motion.p
              key={activeBox.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="whitespace-pre-line text-lg font-extrabold"
            >
              {activeBox.reveal}
            </motion.p>
          ) : (
            <p className="text-base font-bold opacity-60">Klik sebuah kotak untuk membukanya 🎁</p>
          )}
        </AnimatePresence>
      </div>

      <div className="grid flex-1 grid-cols-3 gap-3 sm:grid-cols-4">
        {boxes.map((b) => {
          const isOpen = opened.has(b.id);
          return (
            <motion.button
              key={b.id}
              type="button"
              whileHover={{ scale: isOpen ? 1 : 1.04 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openBox(b.id)}
              className="flex aspect-square items-center justify-center rounded-2xl border-2 text-3xl font-black shadow-sm"
              style={{
                background: isOpen ? `${theme.accent}22` : theme.accent,
                color: isOpen ? theme.text : theme.accentContrast,
                borderColor: isOpen ? theme.correct : theme.accent,
              }}
            >
              {isOpen ? '✓' : b.id + 1}
            </motion.button>
          );
        })}
      </div>

      {opened.size === boxes.length && (
        <GameButton theme={theme} className="mt-5 w-full" onClick={finish}>
          ✅ Selesai
        </GameButton>
      )}

      {preview && (
        <p className="mt-4 text-center text-xs opacity-70">Mode preview — hasil tidak disimpan.</p>
      )}
    </div>
  );
}
