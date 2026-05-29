import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/auth';
import { Button } from '@/components/ui';

export function TopBar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-xl shadow-playful">
            🎓
          </span>
          <span className="font-display text-xl font-black text-slate-900">PlayLearn</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm font-bold text-slate-500 sm:inline">
            {user?.displayName ?? user?.email}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await signOut();
              navigate('/login');
            }}
          >
            Keluar
          </Button>
        </div>
      </div>
    </header>
  );
}
