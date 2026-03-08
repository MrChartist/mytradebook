import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Fetch user's recent closed trades
    const { data: trades } = await supabase
      .from("trades")
      .select("symbol, segment, trade_type, pnl, entry_time, closed_at")
      .eq("user_id", user.id)
      .eq("status", "CLOSED")
      .order("closed_at", { ascending: false })
      .limit(100);

    if (!trades || trades.length < 5) {
      return new Response(JSON.stringify({ suggestions: [], message: "Need at least 5 closed trades for suggestions." }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Analyze patterns
    const symbolCounts: Record<string, number> = {};
    const segmentCounts: Record<string, number> = {};
    trades.forEach((t) => {
      symbolCounts[t.symbol] = (symbolCounts[t.symbol] || 0) + 1;
      segmentCounts[t.segment] = (segmentCounts[t.segment] || 0) + 1;
    });

    const topSymbols = Object.entries(symbolCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([sym, count]) => `${sym} (${count} trades)`);

    const tradeSummary = `Top traded: ${topSymbols.join(", ")}. Total trades: ${trades.length}. Segments: ${Object.entries(segmentCounts).map(([s, c]) => `${s.replace(/_/g, " ")}: ${c}`).join(", ")}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a trading assistant. Based on the user's trading patterns, suggest 3-5 price alerts they should set. Return structured suggestions." },
          { role: "user", content: `Based on my trading history:\n${tradeSummary}\n\nSuggest specific price alerts I should set. For each, provide the symbol, condition (above/below), a reasonable price level based on typical trading ranges, and a brief reason.` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "suggest_alerts",
            description: "Return alert suggestions based on trading patterns",
            parameters: {
              type: "object",
              properties: {
                suggestions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      symbol: { type: "string" },
                      condition: { type: "string", enum: ["PRICE_GT", "PRICE_LT"] },
                      reason: { type: "string" },
                    },
                    required: ["symbol", "condition", "reason"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["suggestions"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "suggest_alerts" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let suggestions = [];
    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        suggestions = parsed.suggestions || [];
      } catch { /* fallback empty */ }
    }

    return new Response(JSON.stringify({ suggestions }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("suggest-alerts error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
