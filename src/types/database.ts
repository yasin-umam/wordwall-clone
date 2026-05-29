// Tipe ringkas untuk supabase-js generic. Bila skema berubah, regenerasi dengan:
//   supabase gen types typescript --local > src/types/database.ts
import type { ActivityContent, TemplateType } from './content';
import type { ActivitySettings } from './index';

type Json = ActivityContent | ActivitySettings | Record<string, unknown>;

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; display_name: string | null; created_at: string };
        Insert: { id: string; display_name?: string | null };
        Update: { display_name?: string | null };
        Relationships: [];
      };
      activities: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          template_type: TemplateType;
          content: ActivityContent;
          theme: string;
          settings: ActivitySettings;
          is_public: boolean;
          share_slug: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          template_type: TemplateType;
          content?: ActivityContent;
          theme?: string;
          settings?: ActivitySettings;
          is_public?: boolean;
          share_slug?: string | null;
        };
        Update: Partial<Database['public']['Tables']['activities']['Insert']>;
        Relationships: [];
      };
      play_results: {
        Row: {
          id: string;
          activity_id: string;
          player_name: string;
          score: number;
          time_ms: number | null;
          accuracy: number | null;
          played_at: string;
        };
        Insert: {
          id?: string;
          activity_id: string;
          player_name: string;
          score?: number;
          time_ms?: number | null;
          accuracy?: number | null;
        };
        Update: Partial<Database['public']['Tables']['play_results']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type { Json };
