import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/store/auth';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  listActivities,
  deleteActivity,
  duplicateActivity,
  updateActivity,
  slugFromTitle,
} from '@/lib/api';
import { getTemplate } from '@/templates/registry';
import { contentSummary } from '@/lib/contentEngine';
import { getTheme } from '@/lib/themes';
import { TopBar } from '@/components/TopBar';
import { Button, Card, Spinner, Badge, Modal } from '@/components/ui';
import { ShareModal } from '@/components/ShareModal';
import type { Activity } from '@/types';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareTarget, setShareTarget] = useState<Activity | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Activity | null>(null);
  const [busy, setBusy] = useState(false);

  function reload() {
    if (!user) return;
    setLoading(true);
    listActivities(user.id)
      .then(setActivities)
      .finally(() => setLoading(false));
  }

  useEffect(reload, [user]);

  async function onDuplicate(a: Activity) {
    if (!user) return;
    await duplicateActivity(a.id, user.id);
    reload();
  }

  async function onDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    await deleteActivity(deleteTarget.id);
    setBusy(false);
    setDeleteTarget(null);
    reload();
  }

  async function togglePublic(next: boolean) {
    if (!shareTarget) return;
    setBusy(true);
    const nextSlug = next ? shareTarget.share_slug ?? slugFromTitle(shareTarget.title) : shareTarget.share_slug;
    const updated = await updateActivity(shareTarget.id, { is_public: next, share_slug: nextSlug });
    setBusy(false);
    setShareTarget(updated);
    setActivities((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  }

  return (
    <div className="min-h-full">
      <TopBar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-black text-slate-900">Aktivitas Saya</h1>
            <p className="text-slate-500">Buat, edit, dan bagikan game pembelajaran.</p>
          </div>
          <Button size="lg" onClick={() => navigate('/new')}>
            + Buat Aktivitas
          </Button>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-6 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
            Mode demo lokal — perubahan tidak tersimpan permanen. Hubungkan Supabase (lihat README)
            untuk menyimpan & berbagi sungguhan.
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner className="h-8 w-8" />
          </div>
        ) : activities.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-5xl">🎲</div>
            <p className="mt-3 font-bold text-slate-600">Belum ada aktivitas.</p>
            <Button className="mt-4" onClick={() => navigate('/new')}>
              Buat yang pertama
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map((a) => {
              const meta = getTemplate(a.template_type);
              const theme = getTheme(a.theme);
              return (
                <motion.div key={a.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="flex h-full flex-col overflow-hidden">
                    <div
                      className="flex h-24 items-center justify-center text-5xl"
                      style={{ background: theme.background }}
                    >
                      {meta.icon}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <Badge className="bg-brand-100 text-brand-700">{meta.name}</Badge>
                        {a.is_public && <Badge className="bg-emerald-100 text-emerald-700">Publik</Badge>}
                      </div>
                      <h3 className="font-display text-lg font-extrabold leading-tight text-slate-900">
                        {a.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">{contentSummary(a.content)}</p>

                      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                        <Button size="sm" onClick={() => navigate(`/play/${a.id}`)}>
                          ▶ Main
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => navigate(`/edit/${a.id}`)}>
                          ✏️ Edit
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => setShareTarget(a)}>
                          🔗
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onDuplicate(a)} title="Duplikat">
                          ⧉
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(a)}
                          title="Hapus"
                          className="text-rose-500"
                        >
                          🗑
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {shareTarget && (
        <ShareModal
          open
          onClose={() => setShareTarget(null)}
          isPublic={shareTarget.is_public}
          slug={shareTarget.share_slug}
          busy={busy}
          onTogglePublic={togglePublic}
        />
      )}

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Hapus aktivitas?">
        <p className="text-slate-600">
          Yakin menghapus <strong>{deleteTarget?.title}</strong>? Tindakan ini tidak bisa dibatalkan.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
            Batal
          </Button>
          <Button variant="danger" onClick={onDelete} disabled={busy}>
            {busy ? 'Menghapus…' : 'Hapus'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
