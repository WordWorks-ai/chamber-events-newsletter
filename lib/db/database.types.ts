export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      chambers: {
        Row: {
          id: string;
          slug: string;
          name: string;
          website_url: string;
          events_url: string;
          platform_hint: string | null;
          active: boolean;
          default_timezone: string;
          logo_url: string | null;
          favicon_url: string | null;
          theme_color: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          website_url: string;
          events_url: string;
          platform_hint?: string | null;
          active?: boolean;
          default_timezone?: string;
          logo_url?: string | null;
          favicon_url?: string | null;
          theme_color?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["chambers"]["Insert"]>;
        Relationships: [];
      };
      scrape_cache: {
        Row: {
          chamber_id: string;
          cache_key: string;
          normalized_events: Json;
          branding: Json;
          fetched_at: string;
          expires_at: string;
          source_hash: string | null;
        };
        Insert: {
          chamber_id: string;
          cache_key: string;
          normalized_events: Json;
          branding: Json;
          fetched_at?: string;
          expires_at: string;
          source_hash?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["scrape_cache"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "scrape_cache_chamber_id_fkey";
            columns: ["chamber_id"];
            referencedRelation: "chambers";
            referencedColumns: ["id"];
          }
        ];
      };
      newsletter_runs: {
        Row: {
          id: string;
          chamber_id: string;
          status: string;
          event_count: number;
          request_payload: Json;
          output_meta: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          chamber_id: string;
          status: string;
          event_count?: number;
          request_payload: Json;
          output_meta?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["newsletter_runs"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "newsletter_runs_chamber_id_fkey";
            columns: ["chamber_id"];
            referencedRelation: "chambers";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
