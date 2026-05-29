// =============================================================================
// DATA ACCESS LAYER — semua akses Supabase di satu tempat.
// Bila Supabase belum dikonfigurasi, otomatis jatuh ke MODE DEMO LOKAL
// (in-memory) memakai SAMPLE_ACTIVITIES agar aplikasi tetap bisa dicoba.
// JANGAN pernah pakai service key di sini — hanya anon key + RLS.
// =============================================================================
import { supabase, isSupabaseConfigured } from './supabase';
import { SAMPLE_ACTIVITIES, findSampleBySlug } from '@/data/samples';
import { slugFromTitle, tempId } from './utils';
import type { Activity, ActivityDraft, PlayResult } from '@/types';

// ---------- mode demo (in-memory) -------------------------------------------
let demoActivities: Activity[] = SAMPLE_ACTIVITIES.map((a) => ({ ...a }));
const demoResults: PlayResult[] = [
  mkResult('a0000000-0000-4000-a000-000000000001', 'Andi', 300, 28000, 1),
  mkResult('a0000000-0000-4000-a000-000000000001', 'Sinta', 225, 31000, 0.75),
  mkResult('a0000000-0000-4000-a000-000000000001', 'Budi', 150, 26000, 0.5),
];
const demoListeners = new Map<string, Set<(r: PlayResult) => void>>();

function mkResult(
  activity_id: string,
  player_name: string,
  score: number,
  time_ms: number,
  accuracy: number,
): PlayResult {
  return {
    id: tempId(),
    activity_id,
    player_name,
    score,
    time_ms,
    accuracy,
    played_at: new Date().toISOString(),
  };
}

// ---------- Activities -------------------------------------------------------

export async function listActivities(ownerId: string): Promise<Activity[]> {
  if (!isSupabaseConfigured) {
    return demoActivities
      .filter((a) => a.owner_id === ownerId || a.owner_id === 'demo')
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  }
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('owner_id', ownerId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data as Activity[];
}

export async function getActivity(id: string): Promise<Activity | null> {
  if (!isSupabaseConfigured) {
    return demoActivities.find((a) => a.id === id) ?? null;
  }
  const { data, error } = await supabase.from('activities').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? (data as Activity) : null;
}

export async function getActivityBySlug(slug: string): Promise<Activity | null> {
  if (!isSupabaseConfigured) {
    return findSampleBySlug(slug) ?? demoActivities.find((a) => a.share_slug === slug) ?? null;
  }
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('share_slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data ? (data as Activity) : null;
}

export async function createActivity(ownerId: string, draft: ActivityDraft): Promise<Activity> {
  if (!isSupabaseConfigured) {
    const now = new Date().toISOString();
    const activity: Activity = {
      id: tempId(),
      owner_id: ownerId,
      created_at: now,
      updated_at: now,
      share_slug: draft.share_slug ?? null,
      ...draft,
    };
    demoActivities = [activity, ...demoActivities];
    return activity;
  }
  const { data, error } = await supabase
    .from('activities')
    .insert({ owner_id: ownerId, ...draft })
    .select('*')
    .single();
  if (error) throw error;
  return data as Activity;
}

export async function updateActivity(
  id: string,
  patch: Partial<ActivityDraft>,
): Promise<Activity> {
  if (!isSupabaseConfigured) {
    demoActivities = demoActivities.map((a) =>
      a.id === id ? { ...a, ...patch, updated_at: new Date().toISOString() } : a,
    );
    return demoActivities.find((a) => a.id === id)!;
  }
  const { data, error } = await supabase
    .from('activities')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as Activity;
}

export async function deleteActivity(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    demoActivities = demoActivities.filter((a) => a.id !== id);
    return;
  }
  const { error } = await supabase.from('activities').delete().eq('id', id);
  if (error) throw error;
}

export async function duplicateActivity(id: string, ownerId: string): Promise<Activity> {
  const src = await getActivity(id);
  if (!src) throw new Error('Aktivitas tidak ditemukan');
  return createActivity(ownerId, {
    title: `${src.title} (salinan)`,
    template_type: src.template_type,
    content: src.content,
    theme: src.theme,
    settings: src.settings,
    is_public: false,
    share_slug: null,
  });
}

// ---------- Play results -----------------------------------------------------

export async function submitResult(payload: {
  activity_id: string;
  player_name: string;
  score: number;
  time_ms: number;
  accuracy: number;
}): Promise<PlayResult> {
  if (!isSupabaseConfigured) {
    const row = mkResult(
      payload.activity_id,
      payload.player_name,
      payload.score,
      payload.time_ms,
      payload.accuracy,
    );
    demoResults.unshift(row);
    demoListeners.get(payload.activity_id)?.forEach((cb) => cb(row));
    return row;
  }
  const { data, error } = await supabase
    .from('play_results')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data as PlayResult;
}

export async function listResults(activityId: string): Promise<PlayResult[]> {
  if (!isSupabaseConfigured) {
    return demoResults
      .filter((r) => r.activity_id === activityId)
      .sort((a, b) => b.score - a.score || (a.time_ms ?? 0) - (b.time_ms ?? 0));
  }
  const { data, error } = await supabase
    .from('play_results')
    .select('*')
    .eq('activity_id', activityId)
    .order('score', { ascending: false })
    .order('time_ms', { ascending: true })
    .limit(100);
  if (error) throw error;
  return data as PlayResult[];
}

/**
 * Realtime leaderboard. Mengembalikan fungsi cleanup yang WAJIB dipanggil
 * saat unmount (removeChannel).
 */
export function subscribeResults(
  activityId: string,
  onInsert: (row: PlayResult) => void,
): () => void {
  if (!isSupabaseConfigured) {
    let set = demoListeners.get(activityId);
    if (!set) {
      set = new Set();
      demoListeners.set(activityId, set);
    }
    set.add(onInsert);
    return () => set?.delete(onInsert);
  }
  const channel = supabase
    .channel(`results:${activityId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'play_results', filter: `activity_id=eq.${activityId}` },
      (payload) => onInsert(payload.new as PlayResult),
    )
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}

export { slugFromTitle };
