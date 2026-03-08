import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { trade } = await req.json();
    if (!trade) throw new Error("Missing trade data");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const direction = trade.trade_type === "BUY" ? "LONG" : "SHORT";
    const pnl = trade.pnl ?? 0;
    const pnlPct = trade.pnl_percent ?? 0;
    const outcome = pnl >= 0 ? "PROFITABLE" : "LOSS";
    const riskUsed = trade.entry_price && trade.stop_loss
      ? `${Math.abs(((trade.entry_price - trade.stop_loss) / trade.entry_price) * 100).toFixed(2)}%`
      : "Not set";

    const prompt = `You are a professional trading coach analyzing a completed trade. Give specific, actionable coaching feedback in 3-5 bullet points. Be direct but encouraging. Focus on what the trader can improve.

TRADE DETAILS:
- Symbol: ${trade.symbol}
- Segment: ${trade.segment?.replace(/_/g, " ")}
- Direction: ${direction}
- Entry Price: ₹${trade.entry_price}
- Exit Price: ₹${trade.current_price || "N/A"}
- Quantity: ${trade.quantity}
- P&L: ₹${pnl.toLocaleString()} (${pnlPct.toFixed(1)}%)
- Outcome: ${outcome}
- Stop Loss: ${trade.stop_loss ? `₹${trade.stop_loss}` : "Not set"}
- Risk: ${riskUsed}
- Timeframe: ${trade.timeframe || "Not specified"}
- Holding Period: ${trade.holding_period || "Not specified"}
- Entry Time: ${trade.entry_time}
- Exit Time: ${trade.closed_at || "N/A"}
- Confidence: ${trade.confidence_score ?? "Not rated"}/5
- Emotion: ${trade.emotion_tag || "Not tagged"}
- Notes: ${trade.notes || "None"}
- Closure Reason: ${trade.closure_reason || "None"}
${trade.review_what_worked ? `- What Worked: ${trade.review_what_worked}` : ""}
${trade.review_what_failed ? `- What Failed: ${trade.review_what_failed}` : ""}
${trade.review_rules_followed !== null ? `- Rules Followed: ${trade.review_rules_followed ? "Yes" : "No"}` : ""}

Provide coaching in this format:
**Overall Assessment:** One sentence summary
**Key Observations:**
- [observation 1]
- [observation 2]
**What to Improve:**
- [actionable tip 1]
- [actionable tip 2]
**Next Time:**
- [specific recommendation for similar trades]`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an expert trading coach specializing in Indian stock markets (NSE/BSE). Analyze trades and provide concise, actionable coaching feedback. Use ₹ for currency. Keep responses under 200 words." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const feedback = data.choices?.[0]?.message?.content || "Unable to generate coaching feedback.";

    return new Response(JSON.stringify({ feedback }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("trade-coach error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
