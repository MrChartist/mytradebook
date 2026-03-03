import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const uid = user.id;

    // Fetch all user data in parallel
    const [
      trades,
      tradeEvents,
      alerts,
      studies,
      journal,
      watchlists,
      watchlistItems,
      capitalTx,
      templates,
      tradingRules,
      weeklyReports,
      strategies,
      profile,
      settings,
      telegramChats,
    ] = await Promise.all([
      supabase.from("trades").select("*").eq("user_id", uid),
      supabase.from("trade_events").select("*").in(
        "trade_id",
        (await supabase.from("trades").select("id").eq("user_id", uid)).data?.map((t: { id: string }) => t.id) ?? []
      ),
      supabase.from("alerts").select("*").eq("user_id", uid),
      supabase.from("studies").select("*").eq("user_id", uid),
      supabase.from("daily_journal_entries").select("*").eq("user_id", uid),
      supabase.from("watchlists").select("*").eq("user_id", uid),
      supabase.from("watchlist_items").select("*"),
      supabase.from("capital_transactions").select("*").eq("user_id", uid),
      supabase.from("trade_templates").select("*").eq("user_id", uid),
      supabase.from("trading_rules").select("*").eq("user_id", uid),
      supabase.from("weekly_reports").select("*").eq("user_id", uid),
      supabase.from("strategy_trades").select("*").eq("user_id", uid),
      supabase.from("profiles").select("*").eq("user_id", uid).single(),
      supabase.from("user_settings").select("id, user_id, default_sl_percent, alert_frequency_minutes, auto_sync_portfolio, starting_capital, theme, timezone, dashboard_layout, tsl_profiles, ra_public_mode, ra_disclaimer").eq("user_id", uid).single(),
      supabase.from("telegram_chats").select("id, user_id, chat_id, label, enabled, segments, notification_types, verification_status").eq("user_id", uid),
    ]);

    // Filter watchlist items to only user's watchlists
    const userWatchlistIds = new Set(watchlists.data?.map((w: { id: string }) => w.id) ?? []);
    const filteredWatchlistItems = watchlistItems.data?.filter((i: { watchlist_id: string }) => userWatchlistIds.has(i.watchlist_id)) ?? [];

    const backup = {
      exported_at: new Date().toISOString(),
      version: "1.0",
      user_email: user.email,
      profile: profile.data,
      settings: settings.data,
      trades: trades.data ?? [],
      trade_events: tradeEvents.data ?? [],
      alerts: alerts.data ?? [],
      studies: studies.data ?? [],
      daily_journal: journal.data ?? [],
      watchlists: watchlists.data ?? [],
      watchlist_items: filteredWatchlistItems,
      capital_transactions: capitalTx.data ?? [],
      trade_templates: templates.data ?? [],
      trading_rules: tradingRules.data ?? [],
      weekly_reports: weeklyReports.data ?? [],
      strategy_trades: strategies.data ?? [],
      telegram_chats: telegramChats.data ?? [],
    };

    return new Response(JSON.stringify(backup, null, 2), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="tradebook-backup-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (err) {
    console.error("Export error:", err);
    return new Response(JSON.stringify({ error: "Export failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
