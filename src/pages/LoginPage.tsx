import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/store/auth';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Button, Input, Card } from '@/components/ui';

export function LoginPage() {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: { pathname: string } } };
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState(isSupabaseConfigured ? '' : 'demo@playlearn.app');
  const [password, setPassword] = useState(isSupabaseConfigured ? '' : 'demo123456');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={location.state?.from?.pathname ?? '/'} replace />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (mode === 'in') await signIn(email, password);
      else await signUp(email, password, name || 'Guru');
      navigate(location.state?.from?.pathname ?? '/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal masuk');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-gradient-to-br from-brand-50 via-white to-brand-100 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-3xl shadow-playful">
            🎓
          </div>
          <h1 className="font-display text-3xl font-black text-slate-900">PlayLearn</h1>
          <p className="text-sm font-bold text-slate-500">Buat game pembelajaran, bagikan ke siswa.</p>
        </div>

        <Card className="p-6">
          {!isSupabaseConfigured && (
            <div className="mb-4 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
              Mode demo lokal — Supabase belum dikonfigurasi. Masuk dengan kredensial apa pun
              untuk mencoba sebagai Guru Demo.
            </div>
          )}
          <form onSubmit={submit} className="space-y-3">
            {mode === 'up' && (
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama tampilan" />
            )}
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Kata sandi"
              required
              minLength={6}
            />
            {error && <p className="text-sm font-bold text-rose-500">{error}</p>}
            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? 'Memproses…' : mode === 'in' ? 'Masuk' : 'Daftar'}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-500">
            {mode === 'in' ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
            <button
              className="font-bold text-brand-600 hover:underline"
              onClick={() => {
                setMode((m) => (m === 'in' ? 'up' : 'in'));
                setError('');
              }}
            >
              {mode === 'in' ? 'Daftar di sini' : 'Masuk di sini'}
            </button>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
