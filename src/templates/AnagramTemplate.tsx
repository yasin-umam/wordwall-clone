import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { TemplateProps } from './types';
import { getWords } from '@/lib/contentEngine';
import { buildResult } from '@/lib/scoring';
import { shuffle } from '@/lib/utils';
import { useStopwatch } from '@/hooks/useStopwatch';
import { GameHud } from '@/components/game/GameHud';
import { EmptyState, FinishedCard, GameButton } from './shared';

interface Tile {
  id: number;
  char: string;
}

function scramble(word: string): Tile[] {
  const letters = word.toUpperCase().replace(/\s+/g, '').split('');
  const tiles = letters.map((char, id) => ({ id, char }));
  if (tiles.length <= 1) return tiles;
  let out = shuffle(tiles);
  // pastikan tidak kebetulan tersusun benar
  for (let i = 0; i < 8 && out.map((t) => t.char).join('') === letters.join(''); i++) {
    out = shuffle(tiles);
  }
  return out;
}

export function AnagramTemplate({ content, settings, theme, preview, onComplete }: TemplateProps) {
  const words = useMemo(() => {
    const w = getWords(content).filter((x) => x.word.trim());
    return settings.shuffle ? shuffle(w) : w;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, settings.shuffle]);

  const { elapsed, stop } = useStopwatch(words.length > 0);
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [pool, setPool] = useState<Tile[]>([]);
  const [answer, setAnswer] = useState<Tile[]>([]);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [done, setDone] = useState(false);

  const target = words[index]?.word.toUpperCase().replace(/\s+/g, '') ?? '';

  useEffect(() => {
    if (words.length) {
      setPool(scramble(words[index].word));
      setAnswer([]);
      setStatus('idle');
    }
  }, [index, words]);

  if (words.length === 0) {
    return <EmptyState theme={theme} message="Tambahkan minimal satu kata untuk Anagram." />;
  }

  function placeTile(tile: Tile) {
    if (status === 'correct') return;
    const nextAnswer = [...answer, tile];
    setPool((p) => p.filter((t) => t.id !== tile.id));
    setAnswer(nextAnswer);
    if (nextAnswer.length === target.length) check(nextAnswer);
  }

  function removeTile(tile: Tile) {
    if (status === 'correct') return;
    setAnswer((a) => a.filter((t) => t.id !== tile.id));
    setPool((p) => [...p, tile]);
    setStatus('idle');
  }

  function check(current: Tile[]) {
    const built = current.map((t) => t.char).join('');
    if (built === target) {
      const newCorrect = correctCount + 1;
      setCorrectCount(newCorrect);
      setStatus('correct');
      const isLast = index + 1 >= words.length;
      window.setTimeout(() => {
        if (isLast) {
          stop();
          setDone(true);
          onComplete(buildResult({ correct: newCorrect, total: words.length, timeMs: elapsed }));
        } else {
          setIndex((i) => i + 1);
        }
      }, 900);
    } else {
      setStatus('wrong');
    }
  }

  function resetCurrent() {
    setPool(scramble(words[index].word));
    setAnswer([]);
    setStatus('idle');
  }

  if (done) {
    return (
      <FinishedCard
        theme={theme}
        score={correctCount * 100}
        correct={correctCount}
        total={words.length}
        timeMs={elapsed}
      />
    );
  }

  const current = words[index];

  return (
    <div className="flex flex-1 flex-col">
      <GameHud
        theme={theme}
        score={correctCount * 100}
        timeMs={elapsed}
        showTimer={!!settings.timer}
        progress={[index + 1, words.length]}
      />

      {current.hint && (
        <div
          className="mb-5 rounded-2xl border p-4 text-center text-base font-bold shadow-sm"
          style={{ background: theme.card, borderColor: theme.cardBorder, color: theme.text }}
        >
          💡 {current.hint}
        </div>
      )}

      {/* slot jawaban */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-1 flex-col items-center justify-center gap-8"
        >
          <motion.div
            animate={status === 'wrong' ? { x: [0, -10, 10, -8, 8, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="flex flex-wrap justify-center gap-2"
          >
            {Array.from({ length: target.length }).map((_, i) => {
              const tile = answer[i];
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => tile && removeTile(tile)}
                  className="flex h-14 w-12 items-center justify-center rounded-xl border-2 text-2xl font-black uppercase shadow-sm sm:h-16 sm:w-14"
                  style={{
                    background:
                      status === 'correct' ? theme.correct : tile ? theme.card : 'transparent',
                    borderColor:
                      status === 'correct'
                        ? theme.correct
                        : status === 'wrong' && tile
                          ? theme.wrong
                          : theme.cardBorder,
                    color: status === 'correct' ? '#fff' : theme.text,
                  }}
                >
                  {tile?.char ?? ''}
                </button>
              );
            })}
          </motion.div>

          {/* tile huruf acak */}
          <div className="flex flex-wrap justify-center gap-2">
            {pool.map((tile) => (
              <motion.button
                key={tile.id}
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => placeTile(tile)}
                className="flex h-14 w-12 items-center justify-center rounded-xl border-2 text-2xl font-black uppercase shadow-sm sm:h-16 sm:w-14"
                style={{ background: theme.accent, color: theme.accentContrast, borderColor: theme.accent }}
              >
                {tile.char}
              </motion.button>
            ))}
          </div>

          <GameButton theme={theme} variant="surface" onClick={resetCurrent}>
            ↺ Ulang kata ini
          </GameButton>
        </motion.div>
      </AnimatePresence>

      {preview && (
        <p className="mt-4 text-center text-xs opacity-70">Mode preview — hasil tidak disimpan.</p>
      )}
    </div>
  );
}
