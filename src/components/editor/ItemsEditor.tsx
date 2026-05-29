import { getItems } from '@/lib/contentEngine';
import { Button, Input } from '@/components/ui';
import type { ActivityContent, QuizItem } from '@/types';

/**
 * Editor untuk shape "items" (quiz / open_box / wheel).
 * Untuk wheel/open_box, opsi & jawaban opsional — tetap diedit di sini agar
 * Switch Template ke quiz langsung kompatibel.
 */
export function ItemsEditor({
  content,
  onChange,
  needsOptions,
}: {
  content: ActivityContent;
  onChange: (c: ActivityContent) => void;
  /** quiz butuh opsi+jawaban; wheel/open_box cukup teks `q`. */
  needsOptions: boolean;
}) {
  const items = getItems(content);

  function set(next: QuizItem[]) {
    onChange({ ...content, items: next });
  }
  function patch(i: number, p: Partial<QuizItem>) {
    set(items.map((it, idx) => (idx === i ? { ...it, ...p } : it)));
  }
  function addItem() {
    set([...items, { q: '', options: needsOptions ? ['', ''] : [], answer: 0 }]);
  }
  function removeItem(i: number) {
    set(items.filter((_, idx) => idx !== i));
  }
  function setOption(i: number, oi: number, value: string) {
    patch(i, { options: items[i].options.map((o, idx) => (idx === oi ? value : o)) });
  }
  function addOption(i: number) {
    patch(i, { options: [...items[i].options, ''] });
  }
  function removeOption(i: number, oi: number) {
    const opts = items[i].options.filter((_, idx) => idx !== oi);
    const answer = items[i].answer >= opts.length ? Math.max(0, opts.length - 1) : items[i].answer;
    patch(i, { options: opts, answer });
  }

  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-black text-brand-700">
              {i + 1}
            </span>
            <Input
              value={item.q}
              onChange={(e) => patch(i, { q: e.target.value })}
              placeholder={needsOptions ? 'Tulis pertanyaan…' : 'Tulis item…'}
              className="flex-1"
            />
            <Button variant="ghost" size="sm" onClick={() => removeItem(i)} aria-label="Hapus baris">
              🗑
            </Button>
          </div>

          {needsOptions && (
            <div className="space-y-2 pl-8">
              {item.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`answer-${i}`}
                    checked={item.answer === oi}
                    onChange={() => patch(i, { answer: oi })}
                    className="h-4 w-4 accent-emerald-600"
                    aria-label="Tandai jawaban benar"
                    title="Jawaban benar"
                  />
                  <Input
                    value={opt}
                    onChange={(e) => setOption(i, oi, e.target.value)}
                    placeholder={`Opsi ${oi + 1}`}
                    className={item.answer === oi ? 'border-emerald-300 bg-emerald-50' : ''}
                  />
                  {item.options.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(i, oi)}
                      aria-label="Hapus opsi"
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={() => addOption(i)}>
                + Tambah opsi
              </Button>
            </div>
          )}
        </div>
      ))}
      <Button variant="secondary" onClick={addItem} className="w-full">
        + Tambah {needsOptions ? 'soal' : 'item'}
      </Button>
    </div>
  );
}
