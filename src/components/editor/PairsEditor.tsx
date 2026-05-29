import { getPairs } from '@/lib/contentEngine';
import { Button, Input } from '@/components/ui';
import type { ActivityContent, Pair } from '@/types';

/** Editor untuk shape "pairs" (match_up / flashcards). */
export function PairsEditor({
  content,
  onChange,
  leftLabel = 'Kiri',
  rightLabel = 'Kanan',
}: {
  content: ActivityContent;
  onChange: (c: ActivityContent) => void;
  leftLabel?: string;
  rightLabel?: string;
}) {
  const pairs = getPairs(content);

  function set(next: Pair[]) {
    onChange({ ...content, pairs: next });
  }
  function patch(i: number, p: Partial<Pair>) {
    set(pairs.map((pair, idx) => (idx === i ? { ...pair, ...p } : pair)));
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[1.5rem_1fr_1fr_2rem] items-center gap-2 px-1 text-xs font-bold uppercase tracking-wide text-slate-400">
        <span />
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
        <span />
      </div>
      {pairs.map((pair, i) => (
        <div key={i} className="grid grid-cols-[1.5rem_1fr_1fr_2rem] items-center gap-2">
          <span className="text-xs font-black text-slate-400">{i + 1}</span>
          <Input value={pair.left} onChange={(e) => patch(i, { left: e.target.value })} placeholder={leftLabel} />
          <Input value={pair.right} onChange={(e) => patch(i, { right: e.target.value })} placeholder={rightLabel} />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => set(pairs.filter((_, idx) => idx !== i))}
            aria-label="Hapus pasangan"
          >
            🗑
          </Button>
        </div>
      ))}
      <Button variant="secondary" onClick={() => set([...pairs, { left: '', right: '' }])} className="w-full">
        + Tambah pasangan
      </Button>
    </div>
  );
}
