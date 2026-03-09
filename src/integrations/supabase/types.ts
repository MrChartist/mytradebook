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
      achievements: {
        Row: {
          category: string
          description: string
          icon: string
          id: string
          key: string
          sort_order: number
          threshold: number
          title: string
        }
        Insert: {
          category?: string
          description: string
          icon?: string
          id?: string
          key: string
          sort_order?: number
          threshold?: number
          title: string
        }
        Update: {
          category?: string
          description?: string
          icon?: string
          id?: string
          key?: string
          sort_order?: number
          threshold?: number
          title?: string
        }
        Relationships: []
      }
      alerts: {
        Row: {
          active: boolean | null
          active_hours_only: boolean | null
          batch_id: string | null
          chain_children: Json | null
          chart_link: string | null
          check_interval_minutes: number | null
          condition_type: Database["public"]["Enums"]["alert_condition"]
          cooldown_minutes: number | null
          created_at: string | null
          delivery_in_app: boolean | null
          evaluation_metrics: Json | null
          exchange: string | null
          exchange_segment: string | null
          expires_at: string | null
          id: string
          instrument_id: string | null
          last_checked_at: string | null
          last_triggered: string | null
          linked_study_id: string | null
          notes: string | null
          parameters: Json | null
          previous_ltp: number | null
          priority: string | null
          recurrence: Database["public"]["Enums"]["alert_recurrence"] | null
          scanner_id: string | null
          scope: string | null
          security_id: string | null
          snooze_until: string | null
          symbol: string
          telegram_enabled: boolean | null
          threshold: number | null
          trigger_count: number | null
          user_id: string
          watchlist_id: string | null
          webhook_enabled: boolean | null
        }
        Insert: {
          active?: boolean | null
          active_hours_only?: boolean | null
          batch_id?: string | null
          chain_children?: Json | null
          chart_link?: string | null
          check_interval_minutes?: number | null
          condition_type: Database["public"]["Enums"]["alert_condition"]
          cooldown_minutes?: number | null
          created_at?: string | null
          delivery_in_app?: boolean | null
          evaluation_metrics?: Json | null
          exchange?: string | null
          exchange_segment?: string | null
          expires_at?: string | null
          id?: string
          instrument_id?: string | null
          last_checked_at?: string | null
          last_triggered?: string | null
          linked_study_id?: string | null
          notes?: string | null
          parameters?: Json | null
          previous_ltp?: number | null
          priority?: string | null
          recurrence?: Database["public"]["Enums"]["alert_recurrence"] | null
          scanner_id?: string | null
          scope?: string | null
          security_id?: string | null
          snooze_until?: string | null
          symbol: string
          telegram_enabled?: boolean | null
          threshold?: number | null
          trigger_count?: number | null
          user_id: string
          watchlist_id?: string | null
          webhook_enabled?: boolean | null
        }
        Update: {
          active?: boolean | null
          active_hours_only?: boolean | null
          batch_id?: string | null
          chain_children?: Json | null
          chart_link?: string | null
          check_interval_minutes?: number | null
          condition_type?: Database["public"]["Enums"]["alert_condition"]
          cooldown_minutes?: number | null
          created_at?: string | null
          delivery_in_app?: boolean | null
          evaluation_metrics?: Json | null
          exchange?: string | null
          exchange_segment?: string | null
          expires_at?: string | null
          id?: string
          instrument_id?: string | null
          last_checked_at?: string | null
          last_triggered?: string | null
          linked_study_id?: string | null
          notes?: string | null
          parameters?: Json | null
          previous_ltp?: number | null
          priority?: string | null
          recurrence?: Database["public"]["Enums"]["alert_recurrence"] | null
          scanner_id?: string | null
          scope?: string | null
          security_id?: string | null
          snooze_until?: string | null
          symbol?: string
          telegram_enabled?: boolean | null
          threshold?: number | null
          trigger_count?: number | null
          user_id?: string
          watchlist_id?: string | null
          webhook_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_linked_study_id_fkey"
            columns: ["linked_study_id"]
            isOneToOne: false
            referencedRelation: "studies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_scanner_id_fkey"
            columns: ["scanner_id"]
            isOneToOne: false
            referencedRelation: "scanner_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_watchlist_id_fkey"
            columns: ["watchlist_id"]
            isOneToOne: false
            referencedRelation: "watchlists"
            referencedColumns: ["id"]
          },
        ]
      }
      candlestick_tags: {
        Row: {
          bullish: boolean | null
          description: string | null
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          bullish?: boolean | null
          description?: string | null
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          bullish?: boolean | null
          description?: string | null
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      capital_transactions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          notes: string | null
          transaction_date: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          notes?: string | null
          transaction_date?: string
          type?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          notes?: string | null
          transaction_date?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_journal_entries: {
        Row: {
          created_at: string
          entry_date: string
          id: string
          lessons_learned: string | null
          market_outlook: string | null
          mood: string | null
          post_market_review: string | null
          pre_market_plan: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entry_date: string
          id?: string
          lessons_learned?: string | null
          market_outlook?: string | null
          mood?: string | null
          post_market_review?: string | null
          pre_market_plan?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entry_date?: string
          id?: string
          lessons_learned?: string | null
          market_outlook?: string | null
          mood?: string | null
          post_market_review?: string | null
          pre_market_plan?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      instrument_master: {
        Row: {
          display_name: string | null
          exchange: string
          exchange_segment: string
          expiry: string | null
          instrument_type: string
          lot_size: number | null
          option_type: string | null
          security_id: string
          strike: number | null
          tick_size: number | null
          trading_symbol: string
          underlying_symbol: string | null
          updated_at: string
        }
        Insert: {
          display_name?: string | null
          exchange: string
          exchange_segment: string
          expiry?: string | null
          instrument_type: string
          lot_size?: number | null
          option_type?: string | null
          security_id: string
          strike?: number | null
          tick_size?: number | null
          trading_symbol: string
          underlying_symbol?: string | null
          updated_at?: string
        }
        Update: {
          display_name?: string | null
          exchange?: string
          exchange_segment?: string
          expiry?: string | null
          instrument_type?: string
          lot_size?: number | null
          option_type?: string | null
          security_id?: string
          strike?: number | null
          tick_size?: number | null
          trading_symbol?: string
          underlying_symbol?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      instrument_sync_log: {
        Row: {
          completed_at: string | null
          error_message: string | null
          id: string
          inserted_rows: number | null
          started_at: string
          status: string
          sync_type: string | null
          total_rows: number | null
          updated_rows: number | null
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          inserted_rows?: number | null
          started_at?: string
          status?: string
          sync_type?: string | null
          total_rows?: number | null
          updated_rows?: number | null
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          inserted_rows?: number | null
          started_at?: string
          status?: string
          sync_type?: string | null
          total_rows?: number | null
          updated_rows?: number | null
        }
        Relationships: []
      }
      mistake_tags: {
        Row: {
          id: string
          name: string
          severity: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          name: string
          severity?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          severity?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          subscribed_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string | null
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      pattern_tags: {
        Row: {
          category: string | null
          description: string | null
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          description?: string | null
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          description?: string | null
          id?: string
          name?: string
          user_id?: string | null
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
          referral_code: string | null
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
          referral_code?: string | null
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
          referral_code?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      public_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          disclaimer: string | null
          display_name: string | null
          id: string
          is_public: boolean
          monthly_stats: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          disclaimer?: string | null
          display_name?: string | null
          id?: string
          is_public?: boolean
          monthly_stats?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          disclaimer?: string | null
          display_name?: string | null
          id?: string
          is_public?: boolean
          monthly_stats?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          code: string
          created_at: string
          id: string
          referred_user_id: string | null
          referrer_id: string
          reward_applied: boolean
          status: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          referred_user_id?: string | null
          referrer_id: string
          reward_applied?: boolean
          status?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          referred_user_id?: string | null
          referrer_id?: string
          reward_applied?: boolean
          status?: string
        }
        Relationships: []
      }
      saved_scanner_presets: {
        Row: {
          created_at: string | null
          filters: Json
          id: string
          name: string
          sort_by: string | null
          sort_order: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          filters?: Json
          id?: string
          name: string
          sort_by?: string | null
          sort_order?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          filters?: Json
          id?: string
          name?: string
          sort_by?: string | null
          sort_order?: string | null
          user_id?: string
        }
        Relationships: []
      }
      scanner_definitions: {
        Row: {
          active: boolean | null
          conditions: Json
          created_at: string | null
          description: string | null
          exchange: string | null
          id: string
          is_system: boolean | null
          last_result_count: number | null
          last_run_at: string | null
          name: string
          run_interval_minutes: number | null
          scan_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          conditions?: Json
          created_at?: string | null
          description?: string | null
          exchange?: string | null
          id?: string
          is_system?: boolean | null
          last_result_count?: number | null
          last_run_at?: string | null
          name: string
          run_interval_minutes?: number | null
          scan_type?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          conditions?: Json
          created_at?: string | null
          description?: string | null
          exchange?: string | null
          id?: string
          is_system?: boolean | null
          last_result_count?: number | null
          last_run_at?: string | null
          name?: string
          run_interval_minutes?: number | null
          scan_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      scanner_results: {
        Row: {
          exchange: string | null
          id: string
          matched_at: string | null
          metadata: Json | null
          scanner_id: string
          security_id: string | null
          symbol: string
        }
        Insert: {
          exchange?: string | null
          id?: string
          matched_at?: string | null
          metadata?: Json | null
          scanner_id: string
          security_id?: string | null
          symbol: string
        }
        Update: {
          exchange?: string | null
          id?: string
          matched_at?: string | null
          metadata?: Json | null
          scanner_id?: string
          security_id?: string | null
          symbol?: string
        }
        Relationships: [
          {
            foreignKeyName: "scanner_results_scanner_id_fkey"
            columns: ["scanner_id"]
            isOneToOne: false
            referencedRelation: "scanner_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_trades: {
        Row: {
          closed_at: string | null
          combined_pnl: number | null
          combined_pnl_percent: number | null
          created_at: string | null
          id: string
          name: string
          notes: string | null
          segment: string
          status: string
          strategy_type: string
          symbol: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          closed_at?: string | null
          combined_pnl?: number | null
          combined_pnl_percent?: number | null
          created_at?: string | null
          id?: string
          name: string
          notes?: string | null
          segment?: string
          status?: string
          strategy_type?: string
          symbol: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          closed_at?: string | null
          combined_pnl?: number | null
          combined_pnl_percent?: number | null
          created_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          segment?: string
          status?: string
          strategy_type?: string
          symbol?: string
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
          links: Json | null
          notes: string | null
          pattern_duration: string | null
          pattern_end_date: string | null
          pattern_start_date: string | null
          status: string | null
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
          links?: Json | null
          notes?: string | null
          pattern_duration?: string | null
          pattern_end_date?: string | null
          pattern_start_date?: string | null
          status?: string | null
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
          links?: Json | null
          notes?: string | null
          pattern_duration?: string | null
          pattern_end_date?: string | null
          pattern_start_date?: string | null
          status?: string | null
          symbol?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      study_duration_categories: {
        Row: {
          created_at: string | null
          id: string
          is_system: boolean | null
          name: string
          sort_order: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_system?: boolean | null
          name: string
          sort_order?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_system?: boolean | null
          name?: string
          sort_order?: number | null
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          canceled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          payment_provider: string | null
          plan: string
          provider_customer_id: string | null
          provider_subscription_id: string | null
          status: string
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          payment_provider?: string | null
          plan?: string
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          payment_provider?: string | null
          plan?: string
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      telegram_chats: {
        Row: {
          bot_token: string | null
          bot_username: string | null
          chat_id: string
          created_at: string
          enabled: boolean
          id: string
          label: string
          last_verified_at: string | null
          notification_types: Json | null
          segments: string[]
          user_id: string
          verification_status: string | null
        }
        Insert: {
          bot_token?: string | null
          bot_username?: string | null
          chat_id: string
          created_at?: string
          enabled?: boolean
          id?: string
          label?: string
          last_verified_at?: string | null
          notification_types?: Json | null
          segments?: string[]
          user_id: string
          verification_status?: string | null
        }
        Update: {
          bot_token?: string | null
          bot_username?: string | null
          chat_id?: string
          created_at?: string
          enabled?: boolean
          id?: string
          label?: string
          last_verified_at?: string | null
          notification_types?: Json | null
          segments?: string[]
          user_id?: string
          verification_status?: string | null
        }
        Relationships: []
      }
      telegram_delivery_log: {
        Row: {
          attempt_number: number
          chat_id: string
          created_at: string
          error_message: string | null
          id: string
          notification_type: string
          response_data: Json | null
          segment: string | null
          success: boolean
          user_id: string
        }
        Insert: {
          attempt_number?: number
          chat_id: string
          created_at?: string
          error_message?: string | null
          id?: string
          notification_type?: string
          response_data?: Json | null
          segment?: string | null
          success?: boolean
          user_id: string
        }
        Update: {
          attempt_number?: number
          chat_id?: string
          created_at?: string
          error_message?: string | null
          id?: string
          notification_type?: string
          response_data?: Json | null
          segment?: string | null
          success?: boolean
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
      trade_templates: {
        Row: {
          auto_track_enabled: boolean | null
          created_at: string | null
          default_sl_percent: number | null
          holding_period: string | null
          id: string
          name: string
          notes_template: string | null
          segment: string
          tags: string[] | null
          telegram_post_enabled: boolean | null
          timeframe: string | null
          trade_type: string
          trailing_sl_enabled: boolean | null
          trailing_sl_percent: number | null
          trailing_sl_points: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_track_enabled?: boolean | null
          created_at?: string | null
          default_sl_percent?: number | null
          holding_period?: string | null
          id?: string
          name: string
          notes_template?: string | null
          segment: string
          tags?: string[] | null
          telegram_post_enabled?: boolean | null
          timeframe?: string | null
          trade_type?: string
          trailing_sl_enabled?: boolean | null
          trailing_sl_percent?: number | null
          trailing_sl_points?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_track_enabled?: boolean | null
          created_at?: string | null
          default_sl_percent?: number | null
          holding_period?: string | null
          id?: string
          name?: string
          notes_template?: string | null
          segment?: string
          tags?: string[] | null
          telegram_post_enabled?: boolean | null
          timeframe?: string | null
          trade_type?: string
          trailing_sl_enabled?: boolean | null
          trailing_sl_percent?: number | null
          trailing_sl_points?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
          auto_track_enabled: boolean | null
          chart_images: Json | null
          chart_link: string | null
          closed_at: string | null
          closure_reason: string | null
          coaching_feedback: string | null
          confidence_score: number | null
          contract_key: string | null
          created_at: string | null
          created_from_alert_id: string | null
          current_price: number | null
          dhan_order_id: string | null
          emotion_tag: string | null
          entry_price: number | null
          entry_time: string
          exchange_segment: string | null
          highest_since_entry: number | null
          holding_period: string | null
          id: string
          instrument_token: string | null
          last_trail_anchor_price: number | null
          last_tsl_notified_at: string | null
          lowest_since_entry: number | null
          notes: string | null
          pnl: number | null
          pnl_percent: number | null
          quantity: number
          rating: number | null
          review_execution_quality: number | null
          review_rating: number | null
          review_rules_followed: boolean | null
          review_what_failed: string | null
          review_what_worked: string | null
          reviewed_at: string | null
          security_id: string | null
          segment: Database["public"]["Enums"]["market_segment"]
          status: Database["public"]["Enums"]["trade_status"] | null
          stop_loss: number | null
          strategy_id: string | null
          study_id: string | null
          symbol: string
          targets: Json | null
          telegram_post_enabled: boolean | null
          timeframe: string | null
          trade_type: Database["public"]["Enums"]["trade_type"]
          trailing_sl_active: boolean | null
          trailing_sl_current: number | null
          trailing_sl_enabled: boolean | null
          trailing_sl_percent: number | null
          trailing_sl_points: number | null
          trailing_sl_trigger_price: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_track_enabled?: boolean | null
          chart_images?: Json | null
          chart_link?: string | null
          closed_at?: string | null
          closure_reason?: string | null
          coaching_feedback?: string | null
          confidence_score?: number | null
          contract_key?: string | null
          created_at?: string | null
          created_from_alert_id?: string | null
          current_price?: number | null
          dhan_order_id?: string | null
          emotion_tag?: string | null
          entry_price?: number | null
          entry_time?: string
          exchange_segment?: string | null
          highest_since_entry?: number | null
          holding_period?: string | null
          id?: string
          instrument_token?: string | null
          last_trail_anchor_price?: number | null
          last_tsl_notified_at?: string | null
          lowest_since_entry?: number | null
          notes?: string | null
          pnl?: number | null
          pnl_percent?: number | null
          quantity: number
          rating?: number | null
          review_execution_quality?: number | null
          review_rating?: number | null
          review_rules_followed?: boolean | null
          review_what_failed?: string | null
          review_what_worked?: string | null
          reviewed_at?: string | null
          security_id?: string | null
          segment: Database["public"]["Enums"]["market_segment"]
          status?: Database["public"]["Enums"]["trade_status"] | null
          stop_loss?: number | null
          strategy_id?: string | null
          study_id?: string | null
          symbol: string
          targets?: Json | null
          telegram_post_enabled?: boolean | null
          timeframe?: string | null
          trade_type: Database["public"]["Enums"]["trade_type"]
          trailing_sl_active?: boolean | null
          trailing_sl_current?: number | null
          trailing_sl_enabled?: boolean | null
          trailing_sl_percent?: number | null
          trailing_sl_points?: number | null
          trailing_sl_trigger_price?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_track_enabled?: boolean | null
          chart_images?: Json | null
          chart_link?: string | null
          closed_at?: string | null
          closure_reason?: string | null
          coaching_feedback?: string | null
          confidence_score?: number | null
          contract_key?: string | null
          created_at?: string | null
          created_from_alert_id?: string | null
          current_price?: number | null
          dhan_order_id?: string | null
          emotion_tag?: string | null
          entry_price?: number | null
          entry_time?: string
          exchange_segment?: string | null
          highest_since_entry?: number | null
          holding_period?: string | null
          id?: string
          instrument_token?: string | null
          last_trail_anchor_price?: number | null
          last_tsl_notified_at?: string | null
          lowest_since_entry?: number | null
          notes?: string | null
          pnl?: number | null
          pnl_percent?: number | null
          quantity?: number
          rating?: number | null
          review_execution_quality?: number | null
          review_rating?: number | null
          review_rules_followed?: boolean | null
          review_what_failed?: string | null
          review_what_worked?: string | null
          reviewed_at?: string | null
          security_id?: string | null
          segment?: Database["public"]["Enums"]["market_segment"]
          status?: Database["public"]["Enums"]["trade_status"] | null
          stop_loss?: number | null
          strategy_id?: string | null
          study_id?: string | null
          symbol?: string
          targets?: Json | null
          telegram_post_enabled?: boolean | null
          timeframe?: string | null
          trade_type?: Database["public"]["Enums"]["trade_type"]
          trailing_sl_active?: boolean | null
          trailing_sl_current?: number | null
          trailing_sl_enabled?: boolean | null
          trailing_sl_percent?: number | null
          trailing_sl_points?: number | null
          trailing_sl_trigger_price?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_created_from_alert_id_fkey"
            columns: ["created_from_alert_id"]
            isOneToOne: false
            referencedRelation: "alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategy_trades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_study_id_fkey"
            columns: ["study_id"]
            isOneToOne: false
            referencedRelation: "studies"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_rules: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          rule_text: string
          sort_order: number | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          rule_text: string
          sort_order?: number | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          rule_text?: string
          sort_order?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          progress: number
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          progress?: number
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          progress?: number
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
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
          ai_api_key: string | null
          ai_provider: string | null
          alert_frequency_minutes: number | null
          auto_sync_portfolio: boolean | null
          created_at: string | null
          dashboard_density: string | null
          dashboard_focus_mode: boolean | null
          dashboard_layout: Json | null
          default_sl_percent: number | null
          dhan_access_token: string | null
          dhan_account_name: string | null
          dhan_api_key: string | null
          dhan_api_secret: string | null
          dhan_client_id: string | null
          dhan_consent_id: string | null
          dhan_enabled: boolean | null
          dhan_token_expiry: string | null
          dhan_verified_at: string | null
          id: string
          notification_preferences: Json | null
          ra_disclaimer: string | null
          ra_public_mode: boolean | null
          starting_capital: number | null
          telegram_bot_token: string | null
          telegram_bot_username: string | null
          telegram_chat_id: string | null
          telegram_enabled: boolean | null
          telegram_link_code: string | null
          telegram_link_expires_at: string | null
          telegram_message_templates: Json | null
          telegram_verified_at: string | null
          theme: string | null
          timezone: string | null
          truedata_enabled: boolean | null
          truedata_password: string | null
          truedata_username: string | null
          truedata_verified_at: string | null
          tsl_profiles: Json | null
          updated_at: string | null
          user_id: string
          webhook_secret: string | null
          webhook_url: string | null
        }
        Insert: {
          ai_api_key?: string | null
          ai_provider?: string | null
          alert_frequency_minutes?: number | null
          auto_sync_portfolio?: boolean | null
          created_at?: string | null
          dashboard_density?: string | null
          dashboard_focus_mode?: boolean | null
          dashboard_layout?: Json | null
          default_sl_percent?: number | null
          dhan_access_token?: string | null
          dhan_account_name?: string | null
          dhan_api_key?: string | null
          dhan_api_secret?: string | null
          dhan_client_id?: string | null
          dhan_consent_id?: string | null
          dhan_enabled?: boolean | null
          dhan_token_expiry?: string | null
          dhan_verified_at?: string | null
          id?: string
          notification_preferences?: Json | null
          ra_disclaimer?: string | null
          ra_public_mode?: boolean | null
          starting_capital?: number | null
          telegram_bot_token?: string | null
          telegram_bot_username?: string | null
          telegram_chat_id?: string | null
          telegram_enabled?: boolean | null
          telegram_link_code?: string | null
          telegram_link_expires_at?: string | null
          telegram_message_templates?: Json | null
          telegram_verified_at?: string | null
          theme?: string | null
          timezone?: string | null
          truedata_enabled?: boolean | null
          truedata_password?: string | null
          truedata_username?: string | null
          truedata_verified_at?: string | null
          tsl_profiles?: Json | null
          updated_at?: string | null
          user_id: string
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Update: {
          ai_api_key?: string | null
          ai_provider?: string | null
          alert_frequency_minutes?: number | null
          auto_sync_portfolio?: boolean | null
          created_at?: string | null
          dashboard_density?: string | null
          dashboard_focus_mode?: boolean | null
          dashboard_layout?: Json | null
          default_sl_percent?: number | null
          dhan_access_token?: string | null
          dhan_account_name?: string | null
          dhan_api_key?: string | null
          dhan_api_secret?: string | null
          dhan_client_id?: string | null
          dhan_consent_id?: string | null
          dhan_enabled?: boolean | null
          dhan_token_expiry?: string | null
          dhan_verified_at?: string | null
          id?: string
          notification_preferences?: Json | null
          ra_disclaimer?: string | null
          ra_public_mode?: boolean | null
          starting_capital?: number | null
          telegram_bot_token?: string | null
          telegram_bot_username?: string | null
          telegram_chat_id?: string | null
          telegram_enabled?: boolean | null
          telegram_link_code?: string | null
          telegram_link_expires_at?: string | null
          telegram_message_templates?: Json | null
          telegram_verified_at?: string | null
          theme?: string | null
          timezone?: string | null
          truedata_enabled?: boolean | null
          truedata_password?: string | null
          truedata_username?: string | null
          truedata_verified_at?: string | null
          tsl_profiles?: Json | null
          updated_at?: string | null
          user_id?: string
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      volume_tags: {
        Row: {
          description: string | null
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      watchlist_items: {
        Row: {
          added_at: string | null
          exchange: string | null
          exchange_segment: string | null
          id: string
          notes: string | null
          security_id: string | null
          sort_order: number | null
          symbol: string
          watchlist_id: string
        }
        Insert: {
          added_at?: string | null
          exchange?: string | null
          exchange_segment?: string | null
          id?: string
          notes?: string | null
          security_id?: string | null
          sort_order?: number | null
          symbol: string
          watchlist_id: string
        }
        Update: {
          added_at?: string | null
          exchange?: string | null
          exchange_segment?: string | null
          id?: string
          notes?: string | null
          security_id?: string | null
          sort_order?: number | null
          symbol?: string
          watchlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlist_items_watchlist_id_fkey"
            columns: ["watchlist_id"]
            isOneToOne: false
            referencedRelation: "watchlists"
            referencedColumns: ["id"]
          },
        ]
      }
      watchlists: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
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
      cleanup_old_deleted_records: {
        Args: { days_old?: number }
        Returns: {
          deleted_count: number
          table_name: string
        }[]
      }
      cleanup_old_telegram_logs: {
        Args: { days_old?: number }
        Returns: {
          deleted_count: number
          table_name: string
        }[]
      }
      get_fno_underlyings: {
        Args: never
        Returns: {
          underlying_symbol: string
        }[]
      }
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
        | "PRICE_CROSS_ABOVE"
        | "PRICE_CROSS_BELOW"
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
        | "TSL_UPDATED"
        | "TSL_HIT"
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
        "PRICE_CROSS_ABOVE",
        "PRICE_CROSS_BELOW",
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
        "TSL_UPDATED",
        "TSL_HIT",
      ],
      trade_status: ["PENDING", "OPEN", "CLOSED", "CANCELLED"],
      trade_type: ["BUY", "SELL"],
    },
  },
} as const
