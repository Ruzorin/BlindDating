export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          last_seen: string
          is_verified: boolean
          is_admin: boolean
          preferences: Json
          badges: Json
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          last_seen?: string
          is_verified?: boolean
          is_admin?: boolean
          preferences?: Json
          badges?: Json
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          last_seen?: string
          is_verified?: boolean
          is_admin?: boolean
          preferences?: Json
          badges?: Json
        }
      }
      matches: {
        Row: {
          id: string
          user1_id: string
          user2_id: string
          status: string
          created_at: string
          ended_at: string | null
          compatibility_score: number
        }
        Insert: {
          id?: string
          user1_id: string
          user2_id: string
          status: string
          created_at?: string
          ended_at?: string | null
          compatibility_score: number
        }
        Update: {
          id?: string
          user1_id?: string
          user2_id?: string
          status?: string
          created_at?: string
          ended_at?: string | null
          compatibility_score?: number
        }
      }
      messages: {
        Row: {
          id: string
          match_id: string
          sender_id: string
          content: string
          created_at: string
          is_read: boolean
        }
        Insert: {
          id?: string
          match_id: string
          sender_id: string
          content: string
          created_at?: string
          is_read?: boolean
        }
        Update: {
          id?: string
          match_id?: string
          sender_id?: string
          content?: string
          created_at?: string
          is_read?: boolean
        }
      }
      badges: {
        Row: {
          id: string
          name: string
          description: string
          icon_url: string
          requirements: Json
        }
        Insert: {
          id?: string
          name: string
          description: string
          icon_url: string
          requirements?: Json
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon_url?: string
          requirements?: Json
        }
      }
    }
    Functions: {
      check_active_match: {
        Args: { user_id: string }
        Returns: string
      }
    }
  }
}