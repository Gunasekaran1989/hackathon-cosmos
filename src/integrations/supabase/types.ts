export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          active: boolean
          category: string
          created_at: string
          criteria_type: string
          criteria_value: number
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          active?: boolean
          category?: string
          created_at?: string
          criteria_type: string
          criteria_value?: number
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          criteria_type?: string
          criteria_value?: number
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      hackathon_submissions: {
        Row: {
          admin_notes: string | null
          banner_image: string | null
          created_at: string
          description: string | null
          email: string
          end_date: string | null
          event_name: string
          format: string | null
          id: string
          location: string | null
          organizer: string
          prize_pool: string | null
          published_hackathon_id: string | null
          reference_id: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          start_date: string | null
          status: string
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          admin_notes?: string | null
          banner_image?: string | null
          created_at?: string
          description?: string | null
          email: string
          end_date?: string | null
          event_name: string
          format?: string | null
          id?: string
          location?: string | null
          organizer: string
          prize_pool?: string | null
          published_hackathon_id?: string | null
          reference_id?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          admin_notes?: string | null
          banner_image?: string | null
          created_at?: string
          description?: string | null
          email?: string
          end_date?: string | null
          event_name?: string
          format?: string | null
          id?: string
          location?: string | null
          organizer?: string
          prize_pool?: string | null
          published_hackathon_id?: string | null
          reference_id?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hackathon_submissions_published_hackathon_id_fkey"
            columns: ["published_hackathon_id"]
            isOneToOne: false
            referencedRelation: "hackathons"
            referencedColumns: ["id"]
          },
        ]
      }
      hackathons: {
        Row: {
          banner_image: string | null
          city: string | null
          country: string | null
          created_at: string
          description: string | null
          end_date: string | null
          event_type: string | null
          featured: boolean
          id: string
          location: string | null
          mode: string | null
          organizer: string
          organizer_logo: string | null
          participant_limit: number | null
          prize_pool: string | null
          registration_deadline: string | null
          registration_url: string | null
          short_description: string | null
          slug: string | null
          start_date: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          banner_image?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          event_type?: string | null
          featured?: boolean
          id?: string
          location?: string | null
          mode?: string | null
          organizer: string
          organizer_logo?: string | null
          participant_limit?: number | null
          prize_pool?: string | null
          registration_deadline?: string | null
          registration_url?: string | null
          short_description?: string | null
          slug?: string | null
          start_date: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          banner_image?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          event_type?: string | null
          featured?: boolean
          id?: string
          location?: string | null
          mode?: string | null
          organizer?: string
          organizer_logo?: string | null
          participant_limit?: number | null
          prize_pool?: string | null
          registration_deadline?: string | null
          registration_url?: string | null
          short_description?: string | null
          slug?: string | null
          start_date?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          company: string | null
          country: string | null
          created_at: string
          display_name: string | null
          full_name: string | null
          github_url: string | null
          id: string
          job_title: string | null
          linkedin_url: string | null
          location: string | null
          skills: string[]
          updated_at: string
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          full_name?: string | null
          github_url?: string | null
          id: string
          job_title?: string | null
          linkedin_url?: string | null
          location?: string | null
          skills?: string[]
          updated_at?: string
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          full_name?: string | null
          github_url?: string | null
          id?: string
          job_title?: string | null
          linkedin_url?: string | null
          location?: string | null
          skills?: string[]
          updated_at?: string
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          activity_type: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          awarded_at: string
          badge_id: string
          id: string
          metadata: Json
          user_id: string
        }
        Insert: {
          awarded_at?: string
          badge_id: string
          id?: string
          metadata?: Json
          user_id: string
        }
        Update: {
          awarded_at?: string
          badge_id?: string
          id?: string
          metadata?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_hackathon_participations: {
        Row: {
          completed_at: string | null
          created_at: string
          hackathon_id: string
          id: string
          participation_status: string
          registered_at: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          hackathon_id: string
          id?: string
          participation_status?: string
          registered_at?: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          hackathon_id?: string
          id?: string
          participation_status?: string
          registered_at?: string
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_hackathon_participations_hackathon_id_fkey"
            columns: ["hackathon_id"]
            isOneToOne: false
            referencedRelation: "hackathons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_hackathon_submission: {
        Args: { admin_notes_override?: string; submission_id: string }
        Returns: Json
      }
      complete_participation: { Args: { _hackathon_id: string }; Returns: Json }
      evaluate_user_badges: { Args: { _user_id?: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      register_for_hackathon: { Args: { _hackathon_id: string }; Returns: Json }
      slugify: { Args: { _input: string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
