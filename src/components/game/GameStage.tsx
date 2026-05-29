import type { CSSProperties, ReactNode } from 'react';
import type { Theme } from '@/lib/themes';

/**
 * Pembungkus panggung permainan: menerapkan background, font, dan warna tema
 * tanpa mengubah konten. Dipakai oleh PlayPage dan panel preview editor.
 */
export function GameStage({
  theme,
  children,
  className = '',
}: {
  theme: Theme;
  children: ReactNode;
  className?: string;
}) {
  const style: CSSProperties = {
    background: theme.background,
    color: theme.text,
    fontFamily: theme.fontFamily,
  };
  return (
    <div
      className={`flex h-full w-full flex-col items-center overflow-y-auto p-4 sm:p-6 ${className}`}
      style={style}
    >
      <div className="flex w-full max-w-3xl flex-1 flex-col">{children}</div>
    </div>
  );
}
