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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          active: boolean | null
          condition_type: Database["public"]["Enums"]["alert_condition"]
          created_at: string | null
          expires_at: string | null
          id: string
          last_triggered: string | null
          parameters: Json | null
          recurrence: Database["public"]["Enums"]["alert_recurrence"] | null
          symbol: string
          threshold: number | null
          trigger_count: number | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          condition_type: Database["public"]["Enums"]["alert_condition"]
          created_at?: string | null
          expires_at?: string | null
          id?: string
          last_triggered?: string | null
          parameters?: Json | null
          recurrence?: Database["public"]["Enums"]["alert_recurrence"] | null
          symbol: string
          threshold?: number | null
          trigger_count?: number | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          condition_type?: Database["public"]["Enums"]["alert_condition"]
          created_at?: string | null
          expires_at?: string | null
          id?: string
          last_triggered?: string | null
          parameters?: Json | null
          recurrence?: Database["public"]["Enums"]["alert_recurrence"] | null
          symbol?: string
          threshold?: number | null
          trigger_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      candlestick_tags: {
        Row: {
          bullish: boolean | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          bullish?: boolean | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          bullish?: boolean | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      mistake_tags: {
        Row: {
          id: string
          name: string
          severity: string | null
        }
        Insert: {
          id?: string
          name: string
          severity?: string | null
        }
        Update: {
          id?: string
          name?: string
          severity?: string | null
        }
        Relationships: []
      }
      pattern_tags: {
        Row: {
          category: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          last_login: string | null
          name: string | null
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          name?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          name?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      studies: {
        Row: {
          analysis_date: string | null
          attachments: Json | null
          category: Database["public"]["Enums"]["study_category"] | null
          created_at: string | null
          id: string
          notes: string | null
          symbol: string
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analysis_date?: string | null
          attachments?: Json | null
          category?: Database["public"]["Enums"]["study_category"] | null
          created_at?: string | null
          id?: string
          notes?: string | null
          symbol: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analysis_date?: string | null
          attachments?: Json | null
          category?: Database["public"]["Enums"]["study_category"] | null
          created_at?: string | null
          id?: string
          notes?: string | null
          symbol?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      trade_candlesticks: {
        Row: {
          candlestick_id: string
          trade_id: string
        }
        Insert: {
          candlestick_id: string
          trade_id: string
        }
        Update: {
          candlestick_id?: string
          trade_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trade_candlesticks_candlestick_id_fkey"
            columns: ["candlestick_id"]
            isOneToOne: false
            referencedRelation: "candlestick_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_candlesticks_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "trades"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_events: {
        Row: {
          created_at: string | null
          event_type: Database["public"]["Enums"]["trade_event_type"]
          id: string
          notes: string | null
          pnl_realized: number | null
          price: number
          quantity: number | null
          timestamp: string | null
          trade_id: string
        }
        Insert: {
          created_at?: string | null
          event_type: Database["public"]["Enums"]["trade_event_type"]
          id?: string
          notes?: string | null
          pnl_realized?: number | null
          price: number
          quantity?: number | null
          timestamp?: string | null
          trade_id: string
        }
        Update: {
          created_at?: string | null
          event_type?: Database["public"]["Enums"]["trade_event_type"]
          id?: string
          notes?: string | null
          pnl_realized?: number | null
          price?: number
          quantity?: number | null
          timestamp?: string | null
          trade_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trade_events_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "trades"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_mistakes: {
        Row: {
          mistake_id: string
          trade_id: string
        }
        Insert: {
          mistake_id: string
          trade_id: string
        }
        Update: {
          mistake_id?: string
          trade_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trade_mistakes_mistake_id_fkey"
            columns: ["mistake_id"]
            isOneToOne: false
            referencedRelation: "mistake_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_mistakes_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "trades"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_patterns: {
        Row: {
          pattern_id: string
          trade_id: string
        }
        Insert: {
          pattern_id: string
          trade_id: string
        }
        Update: {
          pattern_id?: string
          trade_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trade_patterns_pattern_id_fkey"
            columns: ["pattern_id"]
            isOneToOne: false
            referencedRelation: "pattern_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_patterns_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "trades"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_volume: {
        Row: {
          trade_id: string
          volume_id: string
        }
        Insert: {
          trade_id: string
          volume_id: string
        }
        Update: {
          trade_id?: string
          volume_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trade_volume_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "trades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_volume_volume_id_fkey"
            columns: ["volume_id"]
            isOneToOne: false
            referencedRelation: "volume_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      trades: {
        Row: {
          closed_at: string | null
          closure_reason: string | null
          confidence_score: number | null
          created_at: string | null
          current_price: number | null
          dhan_order_id: string | null
          entry_price: number
          entry_time: string
          id: string
          notes: string | null
          pnl: number | null
          pnl_percent: number | null
          quantity: number
          rating: number | null
          segment: Database["public"]["Enums"]["market_segment"]
          status: Database["public"]["Enums"]["trade_status"] | null
          stop_loss: number | null
          study_id: string | null
          symbol: string
          targets: Json | null
          trade_type: Database["public"]["Enums"]["trade_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          closed_at?: string | null
          closure_reason?: string | null
          confidence_score?: number | null
          created_at?: string | null
          current_price?: number | null
          dhan_order_id?: string | null
          entry_price: number
          entry_time?: string
          id?: string
          notes?: string | null
          pnl?: number | null
          pnl_percent?: number | null
          quantity: number
          rating?: number | null
          segment: Database["public"]["Enums"]["market_segment"]
          status?: Database["public"]["Enums"]["trade_status"] | null
          stop_loss?: number | null
          study_id?: string | null
          symbol: string
          targets?: Json | null
          trade_type: Database["public"]["Enums"]["trade_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          closed_at?: string | null
          closure_reason?: string | null
          confidence_score?: number | null
          created_at?: string | null
          current_price?: number | null
          dhan_order_id?: string | null
          entry_price?: number
          entry_time?: string
          id?: string
          notes?: string | null
          pnl?: number | null
          pnl_percent?: number | null
          quantity?: number
          rating?: number | null
          segment?: Database["public"]["Enums"]["market_segment"]
          status?: Database["public"]["Enums"]["trade_status"] | null
          stop_loss?: number | null
          study_id?: string | null
          symbol?: string
          targets?: Json | null
          trade_type?: Database["public"]["Enums"]["trade_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_study_id_fkey"
            columns: ["study_id"]
            isOneToOne: false
            referencedRelation: "studies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          alert_frequency_minutes: number | null
          auto_sync_portfolio: boolean | null
          created_at: string | null
          default_sl_percent: number | null
          dhan_client_id: string | null
          id: string
          telegram_chat_id: string | null
          theme: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alert_frequency_minutes?: number | null
          auto_sync_portfolio?: boolean | null
          created_at?: string | null
          default_sl_percent?: number | null
          dhan_client_id?: string | null
          id?: string
          telegram_chat_id?: string | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alert_frequency_minutes?: number | null
          auto_sync_portfolio?: boolean | null
          created_at?: string | null
          default_sl_percent?: number | null
          dhan_client_id?: string | null
          id?: string
          telegram_chat_id?: string | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      volume_tags: {
        Row: {
          description: string | null
          id: string
          name: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      weekly_reports: {
        Row: {
          avg_gain: number | null
          avg_loss: number | null
          best_trade_pnl: number | null
          common_mistakes: Json | null
          data: Json | null
          generated_at: string | null
          id: string
          losing_trades: number | null
          segment: Database["public"]["Enums"]["market_segment"]
          top_setups: Json | null
          total_pnl: number | null
          total_trades: number | null
          user_id: string
          week_end: string
          week_start: string
          win_rate: number | null
          winning_trades: number | null
          worst_trade_pnl: number | null
        }
        Insert: {
          avg_gain?: number | null
          avg_loss?: number | null
          best_trade_pnl?: number | null
          common_mistakes?: Json | null
          data?: Json | null
          generated_at?: string | null
          id?: string
          losing_trades?: number | null
          segment: Database["public"]["Enums"]["market_segment"]
          top_setups?: Json | null
          total_pnl?: number | null
          total_trades?: number | null
          user_id: string
          week_end: string
          week_start: string
          win_rate?: number | null
          winning_trades?: number | null
          worst_trade_pnl?: number | null
        }
        Update: {
          avg_gain?: number | null
          avg_loss?: number | null
          best_trade_pnl?: number | null
          common_mistakes?: Json | null
          data?: Json | null
          generated_at?: string | null
          id?: string
          losing_trades?: number | null
          segment?: Database["public"]["Enums"]["market_segment"]
          top_setups?: Json | null
          total_pnl?: number | null
          total_trades?: number | null
          user_id?: string
          week_end?: string
          week_start?: string
          win_rate?: number | null
          winning_trades?: number | null
          worst_trade_pnl?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      alert_condition:
        | "PRICE_GT"
        | "PRICE_LT"
        | "PERCENT_CHANGE_GT"
        | "PERCENT_CHANGE_LT"
        | "VOLUME_SPIKE"
        | "CUSTOM"
      alert_recurrence: "ONCE" | "DAILY" | "CONTINUOUS"
      app_role: "admin" | "client"
      market_segment:
        | "Equity_Intraday"
        | "Equity_Positional"
        | "Futures"
        | "Options"
        | "Commodities"
      study_category:
        | "Technical"
        | "Fundamental"
        | "News"
        | "Sentiment"
        | "Other"
      trade_event_type:
        | "ENTRY"
        | "SL_HIT"
        | "TARGET1_HIT"
        | "TARGET2_HIT"
        | "TARGET3_HIT"
        | "PARTIAL_EXIT"
        | "SL_MODIFIED"
        | "TARGET_MODIFIED"
        | "CLOSED"
      trade_status: "PENDING" | "OPEN" | "CLOSED" | "CANCELLED"
      trade_type: "BUY" | "SELL"
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
      alert_condition: [
        "PRICE_GT",
        "PRICE_LT",
        "PERCENT_CHANGE_GT",
        "PERCENT_CHANGE_LT",
        "VOLUME_SPIKE",
        "CUSTOM",
      ],
      alert_recurrence: ["ONCE", "DAILY", "CONTINUOUS"],
      app_role: ["admin", "client"],
      market_segment: [
        "Equity_Intraday",
        "Equity_Positional",
        "Futures",
        "Options",
        "Commodities",
      ],
      study_category: [
        "Technical",
        "Fundamental",
        "News",
        "Sentiment",
        "Other",
      ],
      trade_event_type: [
        "ENTRY",
        "SL_HIT",
        "TARGET1_HIT",
        "TARGET2_HIT",
        "TARGET3_HIT",
        "PARTIAL_EXIT",
        "SL_MODIFIED",
        "TARGET_MODIFIED",
        "CLOSED",
      ],
      trade_status: ["PENDING", "OPEN", "CLOSED", "CANCELLED"],
      trade_type: ["BUY", "SELL"],
    },
  },
} as const
