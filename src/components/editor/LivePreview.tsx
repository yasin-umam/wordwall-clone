import { useState } from 'react';
import { getTemplate } from '@/templates/registry';
import { getTheme } from '@/lib/themes';
import { GameStage } from '@/components/game/GameStage';
import { Button } from '@/components/ui';
import type { ActivityContent, ActivitySettings, TemplateType } from '@/types';

/** Preview langsung & dapat dimainkan dari konten yang sedang diedit. */
export function LivePreview({
  template,
  content,
  settings,
  theme,
}: {
  template: TemplateType;
  content: ActivityContent;
  settings: ActivitySettings;
  theme: string;
}) {
  const [nonce, setNonce] = useState(0);
  const meta = getTemplate(template);
  const Comp = meta.component;
  const resolvedTheme = getTheme(theme);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
          Pratinjau Langsung
        </span>
        <Button variant="ghost" size="sm" onClick={() => setNonce((n) => n + 1)}>
          🔄 Mulai ulang
        </Button>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <GameStage key={`${template}-${theme}-${nonce}`} theme={resolvedTheme}>
          <Comp
            content={content}
            settings={settings}
            theme={resolvedTheme}
            preview
            onComplete={() => {
              /* preview: hasil tidak disimpan */
            }}
          />
        </GameStage>
      </div>
    </div>
  );
}
