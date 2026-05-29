import { motion } from 'framer-motion';
import { TEMPLATE_LIST } from '@/templates/registry';
import { evaluateSwitch } from '@/lib/contentEngine';
import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { ActivityContent, TemplateType } from '@/types';

/**
 * Grid pemilih template untuk fitur Switch Template.
 * Menandai tiap template: kompatibel langsung / perlu konversi / template aktif.
 */
export function SwitchTemplateGrid({
  current,
  content,
  onPick,
}: {
  current: TemplateType;
  content: ActivityContent;
  onPick: (t: TemplateType) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {TEMPLATE_LIST.map((tpl) => {
        const isCurrent = tpl.type === current;
        const compat = evaluateSwitch(content, tpl.type);
        return (
          <motion.button
            key={tpl.type}
            type="button"
            whileHover={{ y: -2 }}
            disabled={isCurrent}
            onClick={() => onPick(tpl.type)}
            className={cn(
              'flex flex-col items-start gap-1 rounded-2xl border-2 p-4 text-left transition-colors',
              isCurrent
                ? 'border-brand-500 bg-brand-50 cursor-default'
                : 'border-slate-200 bg-white hover:border-brand-300',
            )}
          >
            <div className="flex w-full items-center justify-between">
              <span className="text-2xl">{tpl.icon}</span>
              {isCurrent ? (
                <Badge className="bg-brand-100 text-brand-700">Aktif</Badge>
              ) : compat.kind === 'native' ? (
                <Badge className="bg-emerald-100 text-emerald-700">✓ Cocok</Badge>
              ) : compat.kind === 'empty' ? (
                <Badge className="bg-slate-100 text-slate-500">Kosong</Badge>
              ) : (
                <Badge className="bg-amber-100 text-amber-700">↻ Konversi</Badge>
              )}
            </div>
            <span className="font-display text-base font-extrabold text-slate-900">{tpl.name}</span>
            <span className="text-xs text-slate-500">{tpl.description}</span>
            {!isCurrent && compat.kind === 'convert' && compat.loss && (
              <span className="mt-1 text-[11px] font-bold text-amber-600">
                Data akan dikonversi (sebagian detail bisa berubah)
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
