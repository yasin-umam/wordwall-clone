import { useState } from 'react';
import { Modal, Button } from '@/components/ui';
import { isSupabaseConfigured } from '@/lib/supabase';

/** Modal bagikan: toggle publik, link slug, dan embed iframe. */
export function ShareModal({
  open,
  onClose,
  isPublic,
  slug,
  busy,
  onTogglePublic,
}: {
  open: boolean;
  onClose: () => void;
  isPublic: boolean;
  slug: string | null;
  busy?: boolean;
  onTogglePublic: (next: boolean) => void;
}) {
  const origin = window.location.origin;
  const link = slug ? `${origin}/p/${slug}` : '';
  const embed = slug
    ? `<iframe src="${origin}/embed/${slug}" width="100%" height="600" style="border:0;border-radius:16px" allowfullscreen></iframe>`
    : '';

  const [copied, setCopied] = useState<'link' | 'embed' | null>(null);
  function copy(text: string, which: 'link' | 'embed') {
    navigator.clipboard?.writeText(text);
    setCopied(which);
    window.setTimeout(() => setCopied(null), 1500);
  }

  return (
    <Modal open={open} onClose={onClose} title="Bagikan aktivitas">
      <div className="space-y-4">
        <label className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
          <div>
            <p className="font-bold text-slate-900">Publikasikan</p>
            <p className="text-xs text-slate-500">Siswa bisa main lewat link tanpa akun.</p>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => onTogglePublic(!isPublic)}
            className={`relative h-7 w-12 rounded-full transition-colors ${
              isPublic ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
            aria-pressed={isPublic}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${
                isPublic ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </label>

        {isPublic && slug ? (
          <>
            <Field label="Link publik" value={link} onCopy={() => copy(link, 'link')} copied={copied === 'link'} />
            <Field
              label="Kode embed"
              value={embed}
              onCopy={() => copy(embed, 'embed')}
              copied={copied === 'embed'}
              mono
            />
            {!isSupabaseConfigured && (
              <p className="text-xs font-bold text-amber-600">
                Mode demo: link hanya berfungsi di sesi browser ini.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-slate-500">
            Aktifkan "Publikasikan" untuk mendapatkan link dan kode embed.
          </p>
        )}

        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function Field({
  label,
  value,
  onCopy,
  copied,
  mono,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="flex gap-2">
        <input
          readOnly
          value={value}
          onFocus={(e) => e.currentTarget.select()}
          className={`flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 ${
            mono ? 'font-mono text-xs' : ''
          }`}
        />
        <Button variant="secondary" size="sm" onClick={onCopy}>
          {copied ? '✓ Tersalin' : 'Salin'}
        </Button>
      </div>
    </div>
  );
}
