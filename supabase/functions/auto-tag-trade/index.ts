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

    const { trade } = await req.json();
    if (!trade) {
      return new Response(JSON.stringify({ error: "No trade data" }), { status: 400, headers: corsHeaders });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const tradeContext = `
Symbol: ${trade.symbol}
Segment: ${trade.segment}
Trade Type: ${trade.trade_type}
Entry Time: ${trade.entry_time}
Entry Price: ${trade.entry_price}
Quantity: ${trade.quantity}
Stop Loss: ${trade.stop_loss || "Not set"}
Timeframe: ${trade.timeframe || "Not specified"}
Holding Period: ${trade.holding_period || "Not specified"}
Notes: ${trade.notes || "None"}
    `.trim();

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a trading tag suggestion engine for Indian stock markets (NSE/BSE). Based on a trade's characteristics, suggest 3-5 relevant tags from these categories:

Setup Types: Gap Up Opening, Gap Down Opening, Breakout, Breakdown, Pullback Entry, Range Breakout, Trend Following, Mean Reversion, Momentum Play, Opening Range Breakout, VWAP Bounce, Earnings Play, News Based, Sector Rotation, Short Squeeze, Support Bounce, Resistance Rejection
Timeframes: Scalp (<15min), Intraday, BTST, Swing (2-5 days), Positional (>1 week)
Market Context: Trending Market, Sideways Market, Volatile Day, Low Volume Day, Expiry Day, Budget Day, RBI Policy Day, FII Heavy Buying, FII Heavy Selling

Only suggest tags that are clearly relevant based on the trade data. Be selective.`,
          },
          {
            role: "user",
            content: `Suggest tags for this trade:\n\n${tradeContext}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_tags",
              description: "Return suggested tags for the trade",
              parameters: {
                type: "object",
                properties: {
                  tags: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        category: { type: "string", enum: ["setup", "timeframe", "context"] },
                        confidence: { type: "number", description: "0-1 confidence score" },
                      },
                      required: ["name", "category", "confidence"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["tags"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_tags" } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI request failed");
    }

    const result = await aiResponse.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];

    let tags = [];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      tags = parsed.tags || [];
    }

    return new Response(JSON.stringify({ tags }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("auto-tag error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
