import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface AuthUser {
  id: string;
  email?: string;
  displayName?: string;
}

interface AuthState {
  user: AuthUser | null;
  ready: boolean;
  init: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const DEMO_USER: AuthUser = { id: 'demo', email: 'demo@playlearn.app', displayName: 'Guru Demo' };

export const useAuth = create<AuthState>((set) => ({
  user: null,
  ready: false,

  init: () => {
    if (!isSupabaseConfigured) {
      // Mode demo: langsung "login" sebagai guru demo (tanpa backend).
      set({ user: DEMO_USER, ready: true });
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      const s = data.session;
      set({
        user: s
          ? { id: s.user.id, email: s.user.email ?? undefined, displayName: s.user.user_metadata?.display_name }
          : null,
        ready: true,
      });
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      set({
        user: session
          ? {
              id: session.user.id,
              email: session.user.email ?? undefined,
              displayName: session.user.user_metadata?.display_name,
            }
          : null,
      });
    });
  },

  signIn: async (email, password) => {
    if (!isSupabaseConfigured) {
      set({ user: { ...DEMO_USER, email } });
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  signUp: async (email, password, displayName) => {
    if (!isSupabaseConfigured) {
      set({ user: { ...DEMO_USER, email, displayName } });
      return;
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (error) throw error;
  },

  signOut: async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    set({ user: null });
  },
}));
