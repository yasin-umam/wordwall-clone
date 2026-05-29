import { getWords } from '@/lib/contentEngine';
import { Button, Input } from '@/components/ui';
import type { ActivityContent, WordItem } from '@/types';

/** Editor untuk shape "words" (anagram). */
export function WordsEditor({
  content,
  onChange,
}: {
  content: ActivityContent;
  onChange: (c: ActivityContent) => void;
}) {
  const words = getWords(content);

  function set(next: WordItem[]) {
    onChange({ ...content, words: next });
  }
  function patch(i: number, p: Partial<WordItem>) {
    set(words.map((w, idx) => (idx === i ? { ...w, ...p } : w)));
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[1.5rem_1fr_1.4fr_2rem] items-center gap-2 px-1 text-xs font-bold uppercase tracking-wide text-slate-400">
        <span />
        <span>Kata</span>
        <span>Petunjuk (opsional)</span>
        <span />
      </div>
      {words.map((w, i) => (
        <div key={i} className="grid grid-cols-[1.5rem_1fr_1.4fr_2rem] items-center gap-2">
          <span className="text-xs font-black text-slate-400">{i + 1}</span>
          <Input
            value={w.word}
            onChange={(e) => patch(i, { word: e.target.value })}
            placeholder="KATA"
            className="font-bold uppercase"
          />
          <Input
            value={w.hint ?? ''}
            onChange={(e) => patch(i, { hint: e.target.value })}
            placeholder="Petunjuk untuk siswa"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => set(words.filter((_, idx) => idx !== i))}
            aria-label="Hapus kata"
          >
            🗑
          </Button>
        </div>
      ))}
      <Button variant="secondary" onClick={() => set([...words, { word: '', hint: '' }])} className="w-full">
        + Tambah kata
      </Button>
    </div>
  );
}
