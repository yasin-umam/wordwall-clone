import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { motion } from 'framer-motion';
import type { TemplateProps } from './types';
import { getPairs } from '@/lib/contentEngine';
import { buildResult } from '@/lib/scoring';
import { shuffle } from '@/lib/utils';
import { useStopwatch } from '@/hooks/useStopwatch';
import { GameHud } from '@/components/game/GameHud';
import { EmptyState, FinishedCard } from './shared';
import type { Theme } from '@/lib/themes';

interface Row {
  id: string;
  left: string;
  right: string;
}

function Chip({ id, label, theme }: { id: string; label: string; theme: Theme }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });
  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="w-full cursor-grab touch-none rounded-2xl border-2 px-4 py-3 text-base font-bold shadow-sm active:cursor-grabbing"
      style={{
        background: theme.card,
        borderColor: theme.cardBorder,
        color: theme.text,
        opacity: isDragging ? 0.3 : 1,
      }}
    >
      {label}
    </button>
  );
}

function Slot({
  id,
  left,
  matched,
  theme,
}: {
  id: string;
  left: string;
  matched: string | null;
  theme: Theme;
}) {
  const { setNodeRef, isOver } = useDroppable({ id, disabled: matched !== null });
  return (
    <div
      className="flex items-stretch gap-2 rounded-2xl border-2 p-2"
      style={{ borderColor: theme.cardBorder, background: 'transparent' }}
    >
      <div
        className="flex flex-1 items-center rounded-xl px-3 py-3 text-base font-extrabold"
        style={{ background: theme.card, color: theme.text }}
      >
        {left}
      </div>
      <div
        ref={setNodeRef}
        className="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed px-3 py-3 text-sm font-bold transition-colors"
        style={{
          borderColor: matched ? theme.correct : isOver ? theme.accent : theme.cardBorder,
          background: matched ? theme.correct : isOver ? `${theme.accent}22` : 'transparent',
          color: matched ? '#fff' : theme.muted,
        }}
      >
        {matched ?? 'letakkan di sini'}
      </div>
    </div>
  );
}

export function MatchUpTemplate({ content, settings, theme, preview, onComplete }: TemplateProps) {
  const rows = useMemo<Row[]>(() => {
    const pairs = getPairs(content).filter((p) => p.left.trim() && p.right.trim());
    const base = pairs.map((p, i) => ({ id: `r${i}`, left: p.left, right: p.right }));
    return settings.shuffle ? shuffle(base) : base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, settings.shuffle]);

  const chipsInit = useMemo(
    () => (settings.shuffle ? shuffle(rows) : rows).map((r) => ({ id: `c-${r.id}`, value: r.right })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows, settings.shuffle],
  );

  const { elapsed, stop } = useStopwatch(rows.length > 0);
  const [matched, setMatched] = useState<Record<string, string>>({});
  const [pool, setPool] = useState(chipsInit);
  const [wrongSlot, setWrongSlot] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
  );

  if (rows.length === 0) {
    return <EmptyState theme={theme} message="Tambahkan minimal satu pasangan untuk Match Up." />;
  }

  const matchedCount = Object.keys(matched).length;
  const activeChip = pool.find((c) => c.id === activeId);

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const slotId = String(over.id);
    if (matched[slotId]) return;
    const chip = pool.find((c) => c.id === active.id);
    const row = rows.find((r) => r.id === slotId);
    if (!chip || !row) return;

    if (chip.value === row.right) {
      const newMatched = { ...matched, [slotId]: chip.value };
      setMatched(newMatched);
      setPool((p) => p.filter((c) => c.id !== chip.id));
      if (Object.keys(newMatched).length === rows.length) {
        stop();
        setDone(true);
        onComplete(buildResult({ correct: rows.length, total: rows.length, timeMs: elapsed }));
      }
    } else {
      setWrongSlot(slotId);
      window.setTimeout(() => setWrongSlot(null), 500);
    }
  }

  if (done) {
    return (
      <FinishedCard
        theme={theme}
        score={rows.length * 100}
        correct={rows.length}
        total={rows.length}
        timeMs={elapsed}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <GameHud
        theme={theme}
        score={matchedCount * 100}
        timeMs={elapsed}
        showTimer={!!settings.timer}
        progress={[matchedCount, rows.length]}
      />
      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="grid flex-1 gap-4 sm:grid-cols-[1.4fr_1fr]">
          <div className="space-y-2">
            {rows.map((r) => (
              <motion.div
                key={r.id}
                animate={wrongSlot === r.id ? { x: [0, -8, 8, -6, 6, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <Slot id={r.id} left={r.left} matched={matched[r.id] ?? null} theme={theme} />
              </motion.div>
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide opacity-70">Tarik ke pasangannya</p>
            {pool.map((c) => (
              <Chip key={c.id} id={c.id} label={c.value} theme={theme} />
            ))}
            {pool.length === 0 && (
              <p className="text-sm font-bold opacity-60">Semua sudah dijodohkan 🎯</p>
            )}
          </div>
        </div>
        <DragOverlay>
          {activeChip ? (
            <div
              className="rounded-2xl border-2 px-4 py-3 text-base font-bold shadow-lg"
              style={{ background: theme.accent, color: theme.accentContrast, borderColor: theme.accent }}
            >
              {activeChip.value}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      {preview && (
        <p className="mt-4 text-center text-xs opacity-70">Mode preview — hasil tidak disimpan.</p>
      )}
    </div>
  );
}
