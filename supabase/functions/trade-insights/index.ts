import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const userId = claimsData.claims.sub;

    // Read user's AI config using service role
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: userSettings, error: settingsErr } = await serviceClient
      .from("user_settings")
      .select("ai_provider, ai_api_key")
      .eq("user_id", userId)
      .single();

    if (settingsErr) throw settingsErr;

    const aiProvider = userSettings?.ai_provider;
    const aiApiKey = userSettings?.ai_api_key;

    if (!aiProvider || !aiApiKey) {
      return new Response(JSON.stringify({
        error: "no_ai_key",
        message: "Configure your AI API key in Settings → Integrations to unlock AI-powered insights.",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { period = "30d" } = await req.json().catch(() => ({}));

    // Determine date filter
    const daysMap: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90, "all": 9999 };
    const days = daysMap[period] || 30;
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    // Fetch closed trades
    let query = supabase
      .from("trades")
      .select("id, segment, trade_type, quantity, entry_price, stop_loss, pnl, pnl_percent, entry_time, closed_at, confidence_score, holding_period, timeframe, targets, review_rating, review_rules_followed, review_execution_quality")
      .eq("user_id", userId)
      .eq("status", "CLOSED");

    if (days < 9999) {
      query = query.gte("closed_at", sinceDate.toISOString());
    }

    const { data: trades, error: tradesErr } = await query;
    if (tradesErr) throw tradesErr;

    if (!trades || trades.length < 3) {
      return new Response(JSON.stringify({
        insights: [{
          title: "Not enough data",
          description: "Close at least 3 trades to get AI-powered insights about your trading patterns.",
          category: "info",
          severity: "info",
        }],
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Fetch patterns and mistakes for these trades
    const tradeIds = trades.map((t: any) => t.id);
    const [patternsRes, mistakesRes] = await Promise.all([
      supabase.from("trade_patterns").select("trade_id, pattern_id, pattern_tags(name)").in("trade_id", tradeIds),
      supabase.from("trade_mistakes").select("trade_id, mistake_id, mistake_tags(name)").in("trade_id", tradeIds),
    ]);

    // Build aggregated stats (no raw data sent to AI)
    const totalTrades = trades.length;
    const wins = trades.filter((t: any) => (t.pnl || 0) > 0);
    const losses = trades.filter((t: any) => (t.pnl || 0) < 0);
    const winRate = ((wins.length / totalTrades) * 100).toFixed(1);

    const segments: Record<string, { total: number; wins: number; totalPnl: number }> = {};
    trades.forEach((t: any) => {
      if (!segments[t.segment]) segments[t.segment] = { total: 0, wins: 0, totalPnl: 0 };
      segments[t.segment].total++;
      if ((t.pnl || 0) > 0) segments[t.segment].wins++;
      segments[t.segment].totalPnl += t.pnl || 0;
    });

    const hourBuckets: Record<string, { total: number; wins: number }> = {};
    trades.forEach((t: any) => {
      const hour = new Date(t.entry_time).getHours();
      const bucket = hour < 10 ? "9-10AM" : hour < 12 ? "10-12PM" : hour < 14 ? "12-2PM" : "2-3:30PM";
      if (!hourBuckets[bucket]) hourBuckets[bucket] = { total: 0, wins: 0 };
      hourBuckets[bucket].total++;
      if ((t.pnl || 0) > 0) hourBuckets[bucket].wins++;
    });

    const dayBuckets: Record<string, { total: number; wins: number }> = {};
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    trades.forEach((t: any) => {
      const day = dayNames[new Date(t.entry_time).getDay()];
      if (!dayBuckets[day]) dayBuckets[day] = { total: 0, wins: 0 };
      dayBuckets[day].total++;
      if ((t.pnl || 0) > 0) dayBuckets[day].wins++;
    });

    const patternStats: Record<string, { total: number; wins: number }> = {};
    (patternsRes.data || []).forEach((p: any) => {
      const name = p.pattern_tags?.name || "Unknown";
      if (!patternStats[name]) patternStats[name] = { total: 0, wins: 0 };
      patternStats[name].total++;
      const trade = trades.find((t: any) => t.id === p.trade_id);
      if (trade && (trade.pnl || 0) > 0) patternStats[name].wins++;
    });

    const mistakeStats: Record<string, number> = {};
    (mistakesRes.data || []).forEach((m: any) => {
      const name = m.mistake_tags?.name || "Unknown";
      mistakeStats[name] = (mistakeStats[name] || 0) + 1;
    });

    const confTrades = trades.filter((t: any) => t.confidence_score != null);
    const highConf = confTrades.filter((t: any) => t.confidence_score >= 7);
    const lowConf = confTrades.filter((t: any) => t.confidence_score <= 4);
    const highConfWinRate = highConf.length ? ((highConf.filter((t: any) => (t.pnl || 0) > 0).length / highConf.length) * 100).toFixed(1) : null;
    const lowConfWinRate = lowConf.length ? ((lowConf.filter((t: any) => (t.pnl || 0) > 0).length / lowConf.length) * 100).toFixed(1) : null;

    const avgWin = wins.length ? (wins.reduce((a: number, t: any) => a + (t.pnl || 0), 0) / wins.length).toFixed(0) : "0";
    const avgLoss = losses.length ? Math.abs(losses.reduce((a: number, t: any) => a + (t.pnl || 0), 0) / losses.length).toFixed(0) : "0";

    let maxWinStreak = 0, maxLossStreak = 0, curWin = 0, curLoss = 0;
    const sorted = [...trades].sort((a: any, b: any) => new Date(a.closed_at).getTime() - new Date(b.closed_at).getTime());
    sorted.forEach((t: any) => {
      if ((t.pnl || 0) > 0) { curWin++; curLoss = 0; maxWinStreak = Math.max(maxWinStreak, curWin); }
      else { curLoss++; curWin = 0; maxLossStreak = Math.max(maxLossStreak, curLoss); }
    });

    const stats = {
      period,
      totalTrades,
      winRate: `${winRate}%`,
      wins: wins.length,
      losses: losses.length,
      avgWin: `₹${avgWin}`,
      avgLoss: `₹${avgLoss}`,
      profitFactor: Number(avgLoss) > 0 ? ((Number(avgWin) * wins.length) / (Number(avgLoss) * losses.length)).toFixed(2) : "N/A",
      segmentBreakdown: Object.entries(segments).map(([seg, d]) => ({
        segment: seg, trades: d.total, winRate: `${((d.wins / d.total) * 100).toFixed(1)}%`, totalPnl: `₹${d.totalPnl.toFixed(0)}`,
      })),
      timeOfDayBreakdown: Object.entries(hourBuckets).map(([slot, d]) => ({
        slot, trades: d.total, winRate: `${((d.wins / d.total) * 100).toFixed(1)}%`,
      })),
      dayOfWeekBreakdown: Object.entries(dayBuckets).map(([day, d]) => ({
        day, trades: d.total, winRate: `${((d.wins / d.total) * 100).toFixed(1)}%`,
      })),
      topPatterns: Object.entries(patternStats).sort((a, b) => b[1].total - a[1].total).slice(0, 5)
        .map(([name, d]) => ({ pattern: name, trades: d.total, winRate: `${((d.wins / d.total) * 100).toFixed(1)}%` })),
      topMistakes: Object.entries(mistakeStats).sort((a, b) => b[1] - a[1]).slice(0, 5)
        .map(([name, count]) => ({ mistake: name, occurrences: count })),
      confidenceAnalysis: highConfWinRate || lowConfWinRate ? {
        highConfidenceWinRate: highConfWinRate ? `${highConfWinRate}%` : "N/A",
        lowConfidenceWinRate: lowConfWinRate ? `${lowConfWinRate}%` : "N/A",
        highConfCount: highConf.length, lowConfCount: lowConf.length,
      } : null,
      streaks: { maxWinStreak, maxLossStreak },
    };

    const systemPrompt = `You are an expert trading performance coach for Indian stock markets (NSE/BSE). Analyze the trader's anonymized statistics and provide exactly 3-5 specific, actionable insights. Focus on patterns that can immediately improve their performance.

Rules:
- Be specific with numbers from the data (e.g., "Your win rate in Options is 72% vs 45% in Futures")
- Each insight must have a clear action the trader can take
- Use Indian market context (mention NSE trading hours 9:15-3:30, segments like F&O)
- Categories: "behavioral" (discipline, overtrading), "timing" (time/day patterns), "risk" (position sizing, R:R), "pattern" (setup effectiveness), "strength" (what's working well)
- Severity: "success" (doing well, keep it up), "warning" (needs attention), "info" (neutral observation)
- Keep descriptions under 2 sentences each
- Currency is INR (₹)`;

    const userPrompt = `Here are my trading statistics for the last ${period}:\n\n${JSON.stringify(stats, null, 2)}\n\nProvide 3-5 specific insights.`;

    const insightsSchema = {
      type: "object" as const,
      properties: {
        insights: {
          type: "array" as const,
          items: {
            type: "object" as const,
            properties: {
              title: { type: "string" as const },
              description: { type: "string" as const },
              category: { type: "string" as const, enum: ["behavioral", "timing", "risk", "pattern", "strength"] },
              severity: { type: "string" as const, enum: ["success", "warning", "info"] },
            },
            required: ["title", "description", "category", "severity"],
            additionalProperties: false,
          },
        },
      },
      required: ["insights"],
      additionalProperties: false,
    };

    let insights;

    if (aiProvider === "gemini") {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${aiApiKey}`;
      const geminiBody = {
        contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}\n\nReturn a JSON object with an "insights" array. Each item has: title, description, category (behavioral|timing|risk|pattern|strength), severity (success|warning|info).` }] }],
        generationConfig: { responseMimeType: "application/json", responseSchema: insightsSchema },
      };

      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiBody),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        console.error("Gemini error:", resp.status, errText);
        if (resp.status === 400 && errText.includes("API_KEY_INVALID")) {
          return new Response(JSON.stringify({ error: "Invalid Gemini API key. Please check your key in Settings → Integrations." }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`Gemini API error: ${resp.status}`);
      }

      const geminiResult = await resp.json();
      const text = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const parsed = JSON.parse(text);
        insights = parsed.insights;
      }
    } else if (aiProvider === "openai") {
      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${aiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [{
            type: "function",
            function: {
              name: "provide_insights",
              description: "Return trading performance insights",
              parameters: insightsSchema,
            },
          }],
          tool_choice: { type: "function", function: { name: "provide_insights" } },
        }),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        console.error("OpenAI error:", resp.status, errText);
        if (resp.status === 401) {
          return new Response(JSON.stringify({ error: "Invalid OpenAI API key. Please check your key in Settings → Integrations." }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`OpenAI API error: ${resp.status}`);
      }

      const openaiResult = await resp.json();
      const toolCall = openaiResult.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        const parsed = JSON.parse(toolCall.function.arguments);
        insights = parsed.insights;
      }
    } else {
      return new Response(JSON.stringify({ error: `Unsupported AI provider: ${aiProvider}` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!insights) {
      insights = [{
        title: "Analysis Complete",
        description: "Your trading data has been analyzed. Keep tracking your trades for more detailed insights.",
        category: "info",
        severity: "info",
      }];
    }

    return new Response(JSON.stringify({ insights, stats, provider: aiProvider }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("trade-insights error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
