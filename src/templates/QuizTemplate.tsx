import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { TemplateProps } from './types';
import { getItems } from '@/lib/contentEngine';
import { buildResult, speedBonus } from '@/lib/scoring';
import { shuffle } from '@/lib/utils';
import { useStopwatch } from '@/hooks/useStopwatch';
import { GameHud } from '@/components/game/GameHud';
import { EmptyState, FinishedCard } from './shared';

interface PreparedItem {
  q: string;
  options: { text: string; correct: boolean }[];
}

export function QuizTemplate({ content, settings, theme, preview, onComplete }: TemplateProps) {
  const prepared = useMemo<PreparedItem[]>(() => {
    let items = getItems(content).filter((it) => it.q.trim() && it.options.length);
    if (settings.shuffle) items = shuffle(items);
    return items.map((it) => {
      const opts = it.options.map((text, i) => ({ text, correct: i === it.answer }));
      return { q: it.q, options: settings.shuffle ? shuffle(opts) : opts };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, settings.shuffle]);

  const { elapsed, stop } = useStopwatch(prepared.length > 0);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [questionStart, setQuestionStart] = useState(0);
  const [done, setDone] = useState(false);

  // Navigasi keyboard: tekan 1..N untuk memilih opsi.
  const chooseRef = useRef<(i: number) => void>(() => {});
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const n = Number.parseInt(e.key, 10);
      if (!Number.isNaN(n) && n >= 1) chooseRef.current(n - 1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (prepared.length === 0) {
    return <EmptyState theme={theme} message="Tambahkan minimal satu soal untuk memainkan Quiz." />;
  }

  const item = prepared[index];

  function choose(optIndex: number) {
    if (picked !== null) return;
    setPicked(optIndex);
    const isCorrect = item.options[optIndex].correct;
    const bonus = isCorrect && settings.timer ? speedBonus(elapsed - questionStart) : 0;
    const newScore = score + (isCorrect ? 100 + bonus : 0);
    const newCorrect = correctCount + (isCorrect ? 1 : 0);
    setScore(newScore);
    setCorrectCount(newCorrect);

    const isLast = index + 1 >= prepared.length;
    window.setTimeout(
      () => {
        if (isLast) {
          stop();
          setDone(true);
          onComplete(
            buildResult({ correct: newCorrect, total: prepared.length, timeMs: elapsed }),
          );
        } else {
          setIndex((i) => i + 1);
          setPicked(null);
          setQuestionStart(elapsed);
        }
      },
      settings.showAnswer ? 1100 : 700,
    );
  }

  chooseRef.current = (i: number) => {
    if (!done && i < item.options.length) choose(i);
  };

  if (done) {
    return (
      <FinishedCard
        theme={theme}
        score={score}
        correct={correctCount}
        total={prepared.length}
        timeMs={elapsed}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <GameHud
        theme={theme}
        score={score}
        timeMs={elapsed}
        showTimer={!!settings.timer}
        progress={[index + 1, prepared.length]}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          className="flex flex-1 flex-col"
        >
          <div
            className="mb-5 rounded-2xl border p-6 text-center text-xl font-extrabold shadow-sm sm:text-2xl"
            style={{ background: theme.card, borderColor: theme.cardBorder, color: theme.text }}
          >
            {item.q}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {item.options.map((opt, i) => {
              const isPicked = picked === i;
              const reveal = picked !== null;
              let bg = theme.card;
              let border = theme.cardBorder;
              let color = theme.text;
              if (reveal && opt.correct && (settings.showAnswer || isPicked)) {
                bg = theme.correct;
                border = theme.correct;
                color = '#fff';
              } else if (reveal && isPicked && !opt.correct) {
                bg = theme.wrong;
                border = theme.wrong;
                color = '#fff';
              }
              return (
                <motion.button
                  key={i}
                  type="button"
                  onClick={() => choose(i)}
                  disabled={reveal}
                  whileTap={{ scale: 0.97 }}
                  aria-label={`Pilihan ${i + 1}: ${opt.text}`}
                  className="flex items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left text-base font-bold shadow-sm transition-colors disabled:cursor-default focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/10"
                  style={{ background: bg, borderColor: border, color }}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-black"
                    style={{ background: theme.accent, color: theme.accentContrast }}
                  >
                    {i + 1}
                  </span>
                  {opt.text}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {preview && (
        <p className="mt-4 text-center text-xs opacity-70">Mode preview — hasil tidak disimpan.</p>
      )}
    </div>
  );
}
