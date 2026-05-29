import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/store/auth';
import { getActivity, getActivityBySlug, submitResult } from '@/lib/api';
import { getTemplate } from '@/templates/registry';
import { getTheme } from '@/lib/themes';
import { formatTime } from '@/lib/utils';
import { GameStage } from '@/components/game/GameStage';
import { Leaderboard } from '@/components/Leaderboard';
import { Button, Input, Spinner } from '@/components/ui';
import type { Activity, GameResult } from '@/types';

type Mode = 'owner' | 'public' | 'embed';
type Phase = 'loading' | 'intro' | 'playing' | 'result' | 'notfound';

export function PlayPage({ mode }: { mode: Mode }) {
  const { id, slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activity, setActivity] = useState<Activity | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [playerName, setPlayerName] = useState('');
  const [result, setResult] = useState<GameResult | null>(null);
  const [myResultId, setMyResultId] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let alive = true;
    const loader = mode === 'owner' ? getActivity(id!) : getActivityBySlug(slug!);
    loader.then((a) => {
      if (!alive) return;
      if (!a) {
        setPhase('notfound');
        return;
      }
      setActivity(a);
      if (mode === 'owner' && user?.displayName) setPlayerName(user.displayName);
      setPhase('intro');
    });
    return () => {
      alive = false;
    };
  }, [id, slug, mode, user]);

  const showLeaderboard = !!activity && (activity.is_public || mode === 'owner');

  const handleComplete = useCallback(
    async (r: GameResult) => {
      setResult(r);
      setPhase('result');
      if (!activity) return;
      // Anonim hanya boleh kirim ke aktivitas publik (sesuai RLS).
      if (activity.is_public) {
        try {
          const row = await submitResult({
            activity_id: activity.id,
            player_name: playerName.trim() || 'Anonim',
            score: r.score,
            time_ms: Math.round(r.timeMs),
            accuracy: Number(r.accuracy.toFixed(2)),
          });
          setMyResultId(row.id);
        } catch {
          /* abaikan kegagalan submit (mis. aktivitas privat) */
        }
      }
    },
    [activity, playerName],
  );

  function start() {
    setResult(null);
    setMyResultId(null);
    setNonce((n) => n + 1);
    setPhase('playing');
  }

  if (phase === 'loading') {
    return (
      <div className="flex h-[100dvh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (phase === 'notfound' || !activity) {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="text-6xl">🔍</div>
        <h1 className="font-display text-2xl font-black">Aktivitas tidak ditemukan</h1>
        <p className="text-slate-500">Link mungkin salah atau aktivitas belum dipublikasikan.</p>
        <Link to="/">
          <Button className="mt-2">Ke beranda</Button>
        </Link>
      </div>
    );
  }

  const meta = getTemplate(activity.template_type);
  const theme = getTheme(activity.theme);

  // ---- INTRO ----
  if (phase === 'intro') {
    return (
      <div
        className="flex h-[100dvh] flex-col items-center justify-center p-6"
        style={{ background: theme.background, color: theme.text, fontFamily: theme.fontFamily }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md rounded-3xl border-2 p-8 text-center shadow-xl"
          style={{ background: theme.card, borderColor: theme.cardBorder }}
        >
          <div className="text-6xl">{meta.icon}</div>
          <h1 className="mt-3 font-display text-2xl font-black">{activity.title}</h1>
          <p className="mt-1 text-sm font-bold opacity-70">{meta.name}</p>

          {mode !== 'owner' && (
            <div className="mt-6 text-left">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide opacity-60">
                Nama kamu
              </label>
              <Input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Tulis namamu…"
                onKeyDown={(e) => e.key === 'Enter' && playerName.trim() && start()}
              />
            </div>
          )}

          <Button
            size="lg"
            className="mt-6 w-full"
            onClick={start}
            disabled={mode !== 'owner' && !playerName.trim()}
          >
            ▶ Mulai Main
          </Button>

          {mode === 'owner' && (
            <Link
              to={`/edit/${activity.id}`}
              className="mt-3 inline-block text-sm font-bold text-brand-600 hover:underline"
            >
              ‹ Kembali ke editor
            </Link>
          )}
        </motion.div>
      </div>
    );
  }

  // ---- PLAYING ----
  if (phase === 'playing') {
    const Comp = meta.component;
    return (
      <div className="relative h-[100dvh]">
        {mode !== 'embed' && (
          <button
            onClick={() => setPhase('intro')}
            className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/20 text-lg text-white backdrop-blur hover:bg-black/30"
            aria-label="Keluar"
          >
            ✕
          </button>
        )}
        <GameStage key={nonce} theme={theme}>
          <Comp
            content={activity.content}
            settings={activity.settings ?? {}}
            theme={theme}
            onComplete={handleComplete}
          />
        </GameStage>
      </div>
    );
  }

  // ---- RESULT ----
  return (
    <div
      className="flex min-h-[100dvh] flex-col items-center p-6"
      style={{ background: theme.background, color: theme.text, fontFamily: theme.fontFamily }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mt-6 w-full max-w-md rounded-3xl border-2 p-8 text-center shadow-xl"
        style={{ background: theme.card, borderColor: theme.cardBorder }}
      >
        <div className="text-6xl">🎉</div>
        <h2 className="mt-2 font-display text-2xl font-black">
          Bagus, {playerName.trim() || 'Pemain'}!
        </h2>
        {result && (
          <>
            <div className="mt-3 text-5xl font-black" style={{ color: theme.accent }}>
              {result.score}
            </div>
            <div className="mt-2 flex justify-center gap-4 text-sm font-bold opacity-80">
              {typeof result.correct === 'number' && typeof result.total === 'number' && (
                <span>✓ {result.correct}/{result.total}</span>
              )}
              <span>🎯 {Math.round(result.accuracy * 100)}%</span>
              <span>⏱ {formatTime(result.timeMs)}</span>
            </div>
          </>
        )}
        <div className="mt-6 flex flex-col gap-2">
          <Button size="lg" onClick={start}>
            🔁 Main lagi
          </Button>
          {mode === 'owner' ? (
            <Button variant="secondary" onClick={() => navigate('/')}>
              Ke Aktivitas Saya
            </Button>
          ) : (
            mode === 'public' && (
              <Link to="/login" className="text-sm font-bold underline opacity-70">
                Buat game-mu sendiri →
              </Link>
            )
          )}
        </div>
      </motion.div>

      {showLeaderboard && (
        <div
          className="mt-6 w-full max-w-md rounded-3xl border-2 p-6 shadow-xl"
          style={{ background: theme.card, borderColor: theme.cardBorder }}
        >
          <h3 className="mb-3 font-display text-lg font-black">🏆 Papan Skor</h3>
          <Leaderboard activityId={activity.id} highlightId={myResultId} />
        </div>
      )}
    </div>
  );
}
