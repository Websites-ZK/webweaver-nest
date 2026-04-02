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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      admin_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          is_resolved: boolean
          message: string
          resolved_at: string | null
          severity: string
        }
        Insert: {
          alert_type?: string
          created_at?: string
          id?: string
          is_resolved?: boolean
          message: string
          resolved_at?: string | null
          severity?: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          is_resolved?: boolean
          message?: string
          resolved_at?: string | null
          severity?: string
        }
        Relationships: []
      }
      auto_heal_actions: {
        Row: {
          action_type: string
          completed_at: string | null
          created_at: string
          hosting_plan_id: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          action_type?: string
          completed_at?: string | null
          created_at?: string
          hosting_plan_id: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          action_type?: string
          completed_at?: string | null
          created_at?: string
          hosting_plan_id?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      domains: {
        Row: {
          dns_provider: string | null
          domain_name: string
          expires_at: string
          id: string
          registered_at: string
          ssl_enabled: boolean
          status: string
          user_id: string
        }
        Insert: {
          dns_provider?: string | null
          domain_name: string
          expires_at?: string
          id?: string
          registered_at?: string
          ssl_enabled?: boolean
          status?: string
          user_id: string
        }
        Update: {
          dns_provider?: string | null
          domain_name?: string
          expires_at?: string
          id?: string
          registered_at?: string
          ssl_enabled?: boolean
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      hosting_plans: {
        Row: {
          bandwidth_limit_gb: number
          bandwidth_used_gb: number
          billing_period: string
          cpu_cores: number
          created_at: string
          domain: string | null
          expires_at: string
          id: string
          plan_name: string
          ram_mb: number
          ram_used_mb: number
          server_location: string
          status: string
          storage_limit_gb: number
          storage_used_gb: number
          user_id: string
        }
        Insert: {
          bandwidth_limit_gb?: number
          bandwidth_used_gb?: number
          billing_period?: string
          cpu_cores?: number
          created_at?: string
          domain?: string | null
          expires_at?: string
          id?: string
          plan_name?: string
          ram_mb?: number
          ram_used_mb?: number
          server_location?: string
          status?: string
          storage_limit_gb?: number
          storage_used_gb?: number
          user_id: string
        }
        Update: {
          bandwidth_limit_gb?: number
          bandwidth_used_gb?: number
          billing_period?: string
          cpu_cores?: number
          created_at?: string
          domain?: string | null
          expires_at?: string
          id?: string
          plan_name?: string
          ram_mb?: number
          ram_used_mb?: number
          server_location?: string
          status?: string
          storage_limit_gb?: number
          storage_used_gb?: number
          user_id?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string
          due_date: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string
          due_date?: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string
          due_date?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding_events: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json | null
          step: number
          user_id: string
        }
        Insert: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          step: number
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          step?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_earnings: {
        Row: {
          amount: number
          commission_rate: number
          created_at: string
          credits_earned: number
          id: string
          invoice_id: string | null
          referred_user_id: string
          referrer_id: string
        }
        Insert: {
          amount?: number
          commission_rate?: number
          created_at?: string
          credits_earned?: number
          id?: string
          invoice_id?: string | null
          referred_user_id: string
          referrer_id: string
        }
        Update: {
          amount?: number
          commission_rate?: number
          created_at?: string
          credits_earned?: number
          id?: string
          invoice_id?: string | null
          referred_user_id?: string
          referrer_id?: string
        }
        Relationships: []
      }
      referral_profiles: {
        Row: {
          commission_rate: number
          created_at: string
          credits_balance: number
          id: string
          referral_code: string
          total_referrals: number
          total_referred_revenue: number
          user_id: string
        }
        Insert: {
          commission_rate?: number
          created_at?: string
          credits_balance?: number
          id?: string
          referral_code: string
          total_referrals?: number
          total_referred_revenue?: number
          user_id: string
        }
        Update: {
          commission_rate?: number
          created_at?: string
          credits_balance?: number
          id?: string
          referral_code?: string
          total_referrals?: number
          total_referred_revenue?: number
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referred_user_id: string
          referrer_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          referred_user_id: string
          referrer_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          referred_user_id?: string
          referrer_id?: string
          status?: string
        }
        Relationships: []
      }
      server_health_checks: {
        Row: {
          checked_at: string
          id: string
          is_up: boolean
          response_time_ms: number | null
          status_code: number | null
          target_url: string
        }
        Insert: {
          checked_at?: string
          id?: string
          is_up?: boolean
          response_time_ms?: number | null
          status_code?: number | null
          target_url: string
        }
        Update: {
          checked_at?: string
          id?: string
          is_up?: boolean
          response_time_ms?: number | null
          status_code?: number | null
          target_url?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      generate_referral_code: { Args: never; Returns: string }
      get_admin_stats: { Args: never; Returns: Json }
      get_onboarding_funnel: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      process_referral_earning: {
        Args: {
          p_amount: number
          p_invoice_id: string
          p_referred_user_id: string
        }
        Returns: undefined
      }
      process_referral_signup: {
        Args: { p_referrer_id: string }
        Returns: undefined
      }
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
