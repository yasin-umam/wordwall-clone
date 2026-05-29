import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/store/auth';
import {
  createActivity,
  getActivity,
  updateActivity,
  slugFromTitle,
} from '@/lib/api';
import {
  convertContent,
  emptyContentFor,
  isContentEmpty,
  contentSummary,
} from '@/lib/contentEngine';
import { TEMPLATE_LIST, getTemplate } from '@/templates/registry';
import { THEMES } from '@/lib/themes';
import { TopBar } from '@/components/TopBar';
import { Button, Card, Input, Modal, Spinner, Badge } from '@/components/ui';
import { ContentEditor } from '@/components/editor/ContentEditor';
import { LivePreview } from '@/components/editor/LivePreview';
import { SwitchTemplateGrid } from '@/components/editor/SwitchTemplateGrid';
import { ShareModal } from '@/components/ShareModal';
import { cn } from '@/lib/utils';
import type { ActivityContent, ActivitySettings, TemplateType } from '@/types';

export function EditorPage() {
  const { id } = useParams();
  const editing = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(editing);
  const [activityId, setActivityId] = useState<string | null>(id ?? null);
  const [title, setTitle] = useState('Aktivitas tanpa judul');
  const [template, setTemplate] = useState<TemplateType | null>(null);
  const [content, setContent] = useState<ActivityContent>({});
  const [theme, setTheme] = useState('classic');
  const [settings, setSettings] = useState<ActivitySettings>({
    timer: true,
    shuffle: true,
    showAnswer: true,
  });
  const [isPublic, setIsPublic] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);

  const [switchOpen, setSwitchOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedTick, setSavedTick] = useState(false);
  const [error, setError] = useState('');
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    if (!editing || !id) return;
    getActivity(id)
      .then((a) => {
        if (!a) {
          setError('Aktivitas tidak ditemukan.');
          return;
        }
        setTitle(a.title);
        setTemplate(a.template_type);
        setContent(a.content);
        setTheme(a.theme);
        setSettings(a.settings ?? {});
        setIsPublic(a.is_public);
        setSlug(a.share_slug);
      })
      .finally(() => setLoading(false));
  }, [editing, id]);

  function draftFields() {
    return {
      title: title.trim() || 'Aktivitas tanpa judul',
      template_type: template!,
      content,
      theme,
      settings,
      is_public: isPublic,
      share_slug: slug,
    };
  }

  async function save(): Promise<string | null> {
    if (!template || !user) return null;
    if (isContentEmpty(content)) {
      setError('Isi minimal satu butir konten dulu.');
      return null;
    }
    setSaving(true);
    setError('');
    try {
      if (activityId) {
        await updateActivity(activityId, draftFields());
        flashSaved();
        return activityId;
      }
      const created = await createActivity(user.id, draftFields());
      setActivityId(created.id);
      flashSaved();
      window.history.replaceState(null, '', `/edit/${created.id}`);
      return created.id;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan.');
      return null;
    } finally {
      setSaving(false);
    }
  }

  function flashSaved() {
    setSavedTick(true);
    window.setTimeout(() => setSavedTick(false), 1800);
  }

  function pickStartTemplate(t: TemplateType) {
    setTemplate(t);
    setContent(emptyContentFor(t));
  }

  function applySwitch(t: TemplateType) {
    setContent((c) => convertContent(c, t));
    setTemplate(t);
    setSwitchOpen(false);
  }

  async function testPlay() {
    const aid = await save();
    if (aid) navigate(`/play/${aid}`);
  }

  async function togglePublic(next: boolean) {
    if (!user || !template) return;
    setSaving(true);
    try {
      const nextSlug = next ? slug ?? slugFromTitle(title) : slug;
      let aid = activityId;
      const patch = { ...draftFields(), is_public: next, share_slug: nextSlug };
      if (aid) {
        await updateActivity(aid, patch);
      } else {
        const created = await createActivity(user.id, patch);
        aid = created.id;
        setActivityId(created.id);
        window.history.replaceState(null, '', `/edit/${created.id}`);
      }
      setIsPublic(next);
      setSlug(nextSlug);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal mengubah status publikasi.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  // ---- pemilih template awal (aktivitas baru) ----
  if (!template) {
    return (
      <div className="min-h-full">
        <TopBar />
        <div className="mx-auto max-w-4xl px-4 py-10">
          <Link to="/" className="text-sm font-bold text-slate-500 hover:text-brand-600">
            ‹ Kembali
          </Link>
          <h1 className="mt-2 font-display text-3xl font-black text-slate-900">
            Pilih template untuk memulai
          </h1>
          <p className="mb-6 text-slate-500">
            Tenang — kamu bisa ganti template kapan saja tanpa input ulang konten.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TEMPLATE_LIST.map((tpl) => (
              <motion.button
                key={tpl.type}
                whileHover={{ y: -4 }}
                onClick={() => pickStartTemplate(tpl.type)}
                className="flex flex-col items-start gap-2 rounded-2xl border-2 border-slate-200 bg-white p-5 text-left shadow-card hover:border-brand-400"
              >
                <span className="text-4xl">{tpl.icon}</span>
                <span className="font-display text-lg font-extrabold text-slate-900">{tpl.name}</span>
                <span className="text-sm text-slate-500">{tpl.description}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const meta = getTemplate(template);

  return (
    <div className="flex h-full flex-col">
      <TopBar />

      {/* toolbar editor */}
      <div className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <Link to="/" className="text-sm font-bold text-slate-500 hover:text-brand-600">
            ‹ Aktivitas
          </Link>
          <Badge className="bg-brand-100 text-brand-700">
            {meta.icon} {meta.name}
          </Badge>
          <span className="text-xs text-slate-400">{contentSummary(content)}</span>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setSwitchOpen(true)}>
              🔀 Ganti Template
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setShareOpen(true)}>
              🔗 Bagikan
            </Button>
            <Button variant="secondary" size="sm" onClick={testPlay} disabled={saving}>
              ▶ Mainkan
            </Button>
            <Button size="sm" onClick={save} disabled={saving}>
              {saving ? 'Menyimpan…' : savedTick ? '✓ Tersimpan' : 'Simpan'}
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 px-4 py-2 text-center text-sm font-bold text-rose-600">{error}</div>
      )}

      {/* tab mobile */}
      <div className="flex border-b border-slate-100 bg-white lg:hidden">
        {(['edit', 'preview'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={cn(
              'flex-1 py-2.5 text-sm font-bold',
              mobileTab === tab ? 'border-b-2 border-brand-500 text-brand-600' : 'text-slate-400',
            )}
          >
            {tab === 'edit' ? '✏️ Edit' : '👀 Pratinjau'}
          </button>
        ))}
      </div>

      <div className="grid flex-1 overflow-hidden lg:grid-cols-2">
        {/* FORM */}
        <div
          className={cn(
            'overflow-y-auto bg-slate-50 px-4 py-5',
            mobileTab === 'edit' ? 'block' : 'hidden lg:block',
          )}
        >
          <div className="mx-auto max-w-xl space-y-5">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">
                Judul aktivitas
              </label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul…" />
            </div>

            <Card className="p-4">
              <h3 className="mb-3 font-display text-sm font-extrabold uppercase tracking-wide text-slate-500">
                Konten
              </h3>
              <ContentEditor template={template} content={content} onChange={setContent} />
            </Card>

            {/* Tema */}
            <Card className="p-4">
              <h3 className="mb-3 font-display text-sm font-extrabold uppercase tracking-wide text-slate-500">
                Tema
              </h3>
              <div className="flex flex-wrap gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={cn(
                      'flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-bold transition-colors',
                      theme === t.id ? 'border-brand-500' : 'border-transparent hover:border-slate-200',
                    )}
                  >
                    <span className="h-5 w-5 rounded-full border border-white shadow" style={{ background: t.background }} />
                    {t.name}
                  </button>
                ))}
              </div>
            </Card>

            {/* Pengaturan */}
            <Card className="p-4">
              <h3 className="mb-3 font-display text-sm font-extrabold uppercase tracking-wide text-slate-500">
                Pengaturan main
              </h3>
              <div className="space-y-1">
                <Toggle
                  label="Timer"
                  checked={!!settings.timer}
                  onChange={(v) => setSettings((s) => ({ ...s, timer: v }))}
                />
                <Toggle
                  label="Acak urutan"
                  checked={!!settings.shuffle}
                  onChange={(v) => setSettings((s) => ({ ...s, shuffle: v }))}
                />
                {template === 'quiz' && (
                  <Toggle
                    label="Tampilkan jawaban benar"
                    checked={!!settings.showAnswer}
                    onChange={(v) => setSettings((s) => ({ ...s, showAnswer: v }))}
                  />
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* PREVIEW */}
        <div
          className={cn(
            'border-l border-slate-100 bg-white',
            mobileTab === 'preview' ? 'block' : 'hidden lg:block',
          )}
        >
          <LivePreview template={template} content={content} settings={settings} theme={theme} />
        </div>
      </div>

      <Modal open={switchOpen} onClose={() => setSwitchOpen(false)} title="Ganti Template" wide>
        <p className="mb-4 text-sm text-slate-500">
          Konten yang sama akan dirender ulang di template baru — tanpa input ulang.
        </p>
        <SwitchTemplateGrid current={template} content={content} onPick={applySwitch} />
      </Modal>

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        isPublic={isPublic}
        slug={slug}
        busy={saving}
        onTogglePublic={togglePublic}
      />
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between py-1.5">
      <span className="font-bold text-slate-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 rounded-full transition-colors',
          checked ? 'bg-brand-500' : 'bg-slate-300',
        )}
        aria-pressed={checked}
      >
        <span
          className={cn(
            'absolute top-1 h-4 w-4 rounded-full bg-white transition-all',
            checked ? 'left-6' : 'left-1',
          )}
        />
      </button>
    </label>
  );
}
