import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ════════════════════════════════════════════════════════════════════
//  TELEGRAM WEBHOOK HANDLER
//  Handles: Bot commands (/pnl, /positions, /briefing, /help)
//           Inline button callbacks (snooze, delete alert, etc.)
// ════════════════════════════════════════════════════════════════════

const SEPARATOR = "━━━━━━━━━━━━━━━━━━━━━━";

function fmt(val: number | null | undefined, fallback = "—"): string {
  if (val === null || val === undefined || Number.isNaN(val)) return fallback;
  return `₹${val.toLocaleString("en-IN")}`;
}

function fmtPct(val: number | null | undefined, fallback = "—"): string {
  if (val === null || val === undefined || Number.isNaN(val)) return fallback;
  const sign = val >= 0 ? "+" : "";
  return `${sign}${val.toFixed(2)}%`;
}

function pnlEmoji(pnl: number): string {
  if (pnl > 0) return "🟢";
  if (pnl < 0) return "🔴";
  return "⚪";
}

function istTimestamp(): string {
  return new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata", dateStyle: "short", timeStyle: "short",
  });
}

async function sendReply(token: string, chatId: string | number, text: string, replyMarkup?: any): Promise<void> {
  const body: any = {
    chat_id: chatId,
    text,
    parse_mode: "Markdown",
    disable_web_page_preview: true,
  };
  if (replyMarkup) body.reply_markup = replyMarkup;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function answerCallback(token: string, callbackQueryId: string, text: string): Promise<void> {
  await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text, show_alert: false }),
  });
}

async function editMessageReplyMarkup(token: string, chatId: string | number, messageId: number, replyMarkup?: any): Promise<void> {
  await fetch(`https://api.telegram.org/bot${token}/editMessageReplyMarkup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      reply_markup: replyMarkup || { inline_keyboard: [] },
    }),
  });
}

// ════════════════════════════════════════════════════════════════════
//  USER LOOKUP: Find user by Telegram chat_id
// ════════════════════════════════════════════════════════════════════

async function findUserByChatId(supabase: any, chatId: string): Promise<string | null> {
  // Check telegram_chats table first
  const { data: chatRow } = await supabase
    .from("telegram_chats")
    .select("user_id")
    .eq("chat_id", chatId)
    .eq("enabled", true)
    .limit(1)
    .maybeSingle();

  if (chatRow?.user_id) return chatRow.user_id;

  // Fallback: check user_settings
  const { data: settingsRow } = await supabase
    .from("user_settings")
    .select("user_id")
    .eq("telegram_chat_id", chatId)
    .maybeSingle();

  return settingsRow?.user_id || null;
}

// ════════════════════════════════════════════════════════════════════
//  COMMAND HANDLERS
// ════════════════════════════════════════════════════════════════════

async function handlePnlCommand(supabase: any, userId: string, token: string, chatId: string | number): Promise<void> {
  const today = new Date().toISOString().split("T")[0];

  const { data: trades } = await supabase
    .from("trades")
    .select("symbol, pnl, pnl_percent, status, trade_type, segment")
    .eq("user_id", userId)
    .gte("entry_time", `${today}T00:00:00`)
    .order("entry_time", { ascending: false })
    .limit(50);

  if (!trades || trades.length === 0) {
    await sendReply(token, chatId, `📊 *TODAY'S P&L*\n${SEPARATOR}\n\nNo trades today.\n\n⏱️ ${istTimestamp()} IST`);
    return;
  }

  const closedTrades = trades.filter((t: any) => t.status === "CLOSED");
  const openTrades = trades.filter((t: any) => t.status !== "CLOSED" && t.status !== "CANCELLED");
  const realizedPnl = closedTrades.reduce((sum: number, t: any) => sum + (t.pnl || 0), 0);
  const unrealizedPnl = openTrades.reduce((sum: number, t: any) => sum + (t.pnl || 0), 0);
  const totalPnl = realizedPnl + unrealizedPnl;
  const winCount = closedTrades.filter((t: any) => (t.pnl || 0) > 0).length;
  const lossCount = closedTrades.filter((t: any) => (t.pnl || 0) < 0).length;
  const winRate = closedTrades.length > 0 ? ((winCount / closedTrades.length) * 100).toFixed(0) : "—";

  let msg = `📊 *TODAY'S P&L*\n${SEPARATOR}\n\n`;
  msg += `${pnlEmoji(totalPnl)} *Net: ${fmt(totalPnl)}*\n\n`;
  msg += `✅ Realized: ${fmt(realizedPnl)}\n`;
  msg += `📈 Unrealized: ${fmt(unrealizedPnl)}\n\n`;
  msg += `📋 Trades: ${trades.length} (${closedTrades.length} closed)\n`;
  msg += `🎯 Win Rate: ${winRate}% (${winCount}W / ${lossCount}L)\n`;

  // Top 3 trades
  const sorted = [...closedTrades].sort((a: any, b: any) => Math.abs(b.pnl || 0) - Math.abs(a.pnl || 0)).slice(0, 3);
  if (sorted.length > 0) {
    msg += `\n${SEPARATOR}\n\n📌 *Notable Trades*\n`;
    for (const t of sorted) {
      msg += `${pnlEmoji(t.pnl)} ${t.symbol}: ${fmt(t.pnl)} (${fmtPct(t.pnl_percent)})\n`;
    }
  }

  msg += `\n⏱️ ${istTimestamp()} IST`;
  await sendReply(token, chatId, msg);
}

async function handlePositionsCommand(supabase: any, userId: string, token: string, chatId: string | number): Promise<void> {
  const { data: trades } = await supabase
    .from("trades")
    .select("symbol, entry_price, current_price, pnl, pnl_percent, trade_type, segment, stop_loss, trailing_sl_current, trailing_sl_active, quantity")
    .eq("user_id", userId)
    .in("status", ["OPEN", "PENDING"])
    .order("entry_time", { ascending: false })
    .limit(20);

  if (!trades || trades.length === 0) {
    await sendReply(token, chatId, `📋 *OPEN POSITIONS*\n${SEPARATOR}\n\nNo open positions.\n\n⏱️ ${istTimestamp()} IST`);
    return;
  }

  const totalUnrealized = trades.reduce((sum: number, t: any) => sum + (t.pnl || 0), 0);

  let msg = `📋 *OPEN POSITIONS* (${trades.length})\n${SEPARATOR}\n\n`;
  msg += `${pnlEmoji(totalUnrealized)} *Total Unrealized: ${fmt(totalUnrealized)}*\n\n`;

  for (const t of trades) {
    const side = t.trade_type === "BUY" ? "🟢" : "🔴";
    const slText = t.trailing_sl_active && t.trailing_sl_current
      ? `TSL: ${fmt(t.trailing_sl_current)}`
      : t.stop_loss ? `SL: ${fmt(t.stop_loss)}` : "";
    msg += `${side} *${t.symbol}*\n`;
    msg += `   Entry: ${fmt(t.entry_price)} | LTP: ${fmt(t.current_price)}\n`;
    msg += `   ${pnlEmoji(t.pnl || 0)} P&L: ${fmt(t.pnl)} (${fmtPct(t.pnl_percent)})`;
    if (slText) msg += ` | ${slText}`;
    msg += "\n\n";
  }

  msg += `⏱️ ${istTimestamp()} IST`;
  await sendReply(token, chatId, msg);
}

async function handleBriefingCommand(supabase: any, userId: string, token: string, chatId: string | number): Promise<void> {
  // Get yesterday's and today's trade stats
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  const [todayResult, yesterdayResult, openResult, alertsResult] = await Promise.all([
    supabase.from("trades").select("pnl, status").eq("user_id", userId).gte("entry_time", `${today}T00:00:00`),
    supabase.from("trades").select("pnl, status").eq("user_id", userId).gte("entry_time", `${yesterday}T00:00:00`).lt("entry_time", `${today}T00:00:00`),
    supabase.from("trades").select("symbol, pnl").eq("user_id", userId).in("status", ["OPEN", "PENDING"]),
    supabase.from("alerts").select("id").eq("user_id", userId).eq("active", true),
  ]);

  const todayTrades = todayResult.data || [];
  const yesterdayTrades = yesterdayResult.data || [];
  const openPositions = openResult.data || [];
  const activeAlerts = alertsResult.data || [];

  const todayPnl = todayTrades.filter((t: any) => t.status === "CLOSED").reduce((s: number, t: any) => s + (t.pnl || 0), 0);
  const yesterdayPnl = yesterdayTrades.filter((t: any) => t.status === "CLOSED").reduce((s: number, t: any) => s + (t.pnl || 0), 0);
  const unrealizedPnl = openPositions.reduce((s: number, t: any) => s + (t.pnl || 0), 0);

  let msg = `☀️ *MORNING BRIEFING*\n${SEPARATOR}\n\n`;
  msg += `📅 ${new Date().toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", weekday: "long", day: "numeric", month: "short" })}\n\n`;
  msg += `📊 *Yesterday:* ${pnlEmoji(yesterdayPnl)} ${fmt(yesterdayPnl)} (${yesterdayTrades.length} trades)\n`;
  msg += `📊 *Today so far:* ${pnlEmoji(todayPnl)} ${fmt(todayPnl)} (${todayTrades.length} trades)\n\n`;
  msg += `📋 Open Positions: ${openPositions.length}\n`;
  msg += `📈 Unrealized P&L: ${pnlEmoji(unrealizedPnl)} ${fmt(unrealizedPnl)}\n`;
  msg += `🔔 Active Alerts: ${activeAlerts.length}\n`;

  if (openPositions.length > 0) {
    msg += `\n${SEPARATOR}\n\n📌 *Carry-Forward*\n`;
    for (const p of openPositions.slice(0, 5)) {
      msg += `${pnlEmoji(p.pnl || 0)} ${p.symbol}: ${fmt(p.pnl)}\n`;
    }
    if (openPositions.length > 5) msg += `_...and ${openPositions.length - 5} more_\n`;
  }

  msg += `\n⏱️ ${istTimestamp()} IST`;
  await sendReply(token, chatId, msg);
}

async function handleHelpCommand(token: string, chatId: string | number): Promise<void> {
  let msg = `📖 *TRADEBOOK COMMANDS*\n${SEPARATOR}\n\n`;
  msg += `📊 /pnl — Today's P&L summary\n`;
  msg += `📋 /positions — Open positions\n`;
  msg += `☀️ /briefing — Morning briefing\n`;
  msg += `❓ /help — Show this menu\n`;
  msg += `\n💡 _You can also interact with inline buttons on alert and trade notifications._`;
  await sendReply(token, chatId, msg);
}

// ════════════════════════════════════════════════════════════════════
//  CALLBACK HANDLERS (Interactive Buttons)
// ════════════════════════════════════════════════════════════════════

async function handleCallbackQuery(supabase: any, token: string, callback: any): Promise<void> {
  const callbackData = callback.data || "";
  const chatId = callback.message?.chat?.id;
  const messageId = callback.message?.message_id;
  const callbackQueryId = callback.id;

  if (!callbackData || !chatId) {
    await answerCallback(token, callbackQueryId, "Invalid action");
    return;
  }

  const userId = await findUserByChatId(supabase, String(chatId));
  if (!userId) {
    await answerCallback(token, callbackQueryId, "Account not linked");
    return;
  }

  // Parse callback data: "action:id" or "action:id:param"
  const parts = callbackData.split(":");
  const action = parts[0];
  const entityId = parts[1];

  switch (action) {
    case "snooze_alert": {
      const minutes = parseInt(parts[2] || "15", 10);
      const snoozeUntil = new Date(Date.now() + minutes * 60 * 1000).toISOString();
      const { error } = await supabase
        .from("alerts")
        .update({ snooze_until: snoozeUntil })
        .eq("id", entityId)
        .eq("user_id", userId);

      if (error) {
        await answerCallback(token, callbackQueryId, "Failed to snooze");
      } else {
        await answerCallback(token, callbackQueryId, `⏸️ Snoozed for ${minutes}m`);
        await editMessageReplyMarkup(token, chatId, messageId, {
          inline_keyboard: [[{ text: `⏸️ Snoozed ${minutes}m`, callback_data: "noop" }]],
        });
      }
      break;
    }
    case "delete_alert": {
      const { error } = await supabase
        .from("alerts")
        .delete()
        .eq("id", entityId)
        .eq("user_id", userId);

      if (error) {
        await answerCallback(token, callbackQueryId, "Failed to delete");
      } else {
        await answerCallback(token, callbackQueryId, "🗑️ Alert deleted");
        await editMessageReplyMarkup(token, chatId, messageId, {
          inline_keyboard: [[{ text: "🗑️ Deleted", callback_data: "noop" }]],
        });
      }
      break;
    }
    case "close_trade": {
      // Mark trade as closed
      const { data: trade, error: fetchErr } = await supabase
        .from("trades")
        .select("current_price, entry_price, quantity, trade_type")
        .eq("id", entityId)
        .eq("user_id", userId)
        .maybeSingle();

      if (fetchErr || !trade) {
        await answerCallback(token, callbackQueryId, "Trade not found");
        break;
      }

      const exitPrice = trade.current_price || trade.entry_price;
      const pnl = trade.trade_type === "BUY"
        ? (exitPrice - trade.entry_price) * trade.quantity
        : (trade.entry_price - exitPrice) * trade.quantity;
      const pnlPct = trade.entry_price > 0
        ? ((exitPrice - trade.entry_price) / trade.entry_price) * 100 * (trade.trade_type === "BUY" ? 1 : -1)
        : 0;

      const { error } = await supabase
        .from("trades")
        .update({
          status: "CLOSED",
          closed_at: new Date().toISOString(),
          closure_reason: "MANUAL",
          pnl: pnl,
          pnl_percent: pnlPct,
        })
        .eq("id", entityId)
        .eq("user_id", userId);

      if (error) {
        await answerCallback(token, callbackQueryId, "Failed to close");
      } else {
        await answerCallback(token, callbackQueryId, `📒 Trade closed at ${fmt(exitPrice)}`);
        await editMessageReplyMarkup(token, chatId, messageId, {
          inline_keyboard: [[{ text: `📒 Closed @ ${fmt(exitPrice)}`, callback_data: "noop" }]],
        });
      }
      break;
    }
    case "noop": {
      await answerCallback(token, callbackQueryId, "");
      break;
    }
    default: {
      await answerCallback(token, callbackQueryId, "Unknown action");
    }
  }
}

// ════════════════════════════════════════════════════════════════════
//  MAIN HANDLER
// ════════════════════════════════════════════════════════════════════

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const SYSTEM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") || "";

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const update = await req.json();

    // ── Handle callback queries (button presses) ──
    if (update.callback_query) {
      const chatId = String(update.callback_query.message?.chat?.id || "");
      // Resolve which bot token to use
      let botToken = SYSTEM_BOT_TOKEN;
      const userId = await findUserByChatId(supabase, chatId);
      if (userId) {
        const { data: settings } = await supabase
          .from("user_settings")
          .select("telegram_bot_token")
          .eq("user_id", userId)
          .maybeSingle();
        if (settings?.telegram_bot_token) botToken = settings.telegram_bot_token;
      }
      await handleCallbackQuery(supabase, botToken, update.callback_query);
      return new Response("OK", { status: 200 });
    }

    // ── Handle messages (commands) ──
    const message = update.message;
    if (!message?.text) {
      return new Response("OK", { status: 200 });
    }

    const chatId = String(message.chat.id);
    const text = message.text.trim();

    // Resolve bot token for this chat
    let botToken = SYSTEM_BOT_TOKEN;
    const userId = await findUserByChatId(supabase, chatId);
    if (userId) {
      const { data: settings } = await supabase
        .from("user_settings")
        .select("telegram_bot_token")
        .eq("user_id", userId)
        .maybeSingle();
      if (settings?.telegram_bot_token) botToken = settings.telegram_bot_token;
    }

    if (!botToken) {
      console.error("No bot token available for response");
      return new Response("OK", { status: 200 });
    }

    // Check if it's a verification code (TS-XXXX format)
    if (text.startsWith("TS-") && text.length > 5) {
      // Forward to telegram-verify logic
      const { data: settings } = await supabase
        .from("user_settings")
        .select("user_id, telegram_link_expires_at")
        .eq("telegram_link_code", text)
        .maybeSingle();

      if (!settings) {
        await sendReply(botToken, chatId, "❌ Invalid verification code. Please generate a new one from Settings.");
        return new Response("OK", { status: 200 });
      }

      const expiresAt = new Date(settings.telegram_link_expires_at);
      if (expiresAt < new Date()) {
        await sendReply(botToken, chatId, "❌ Verification code expired. Please generate a new one.");
        return new Response("OK", { status: 200 });
      }

      await supabase
        .from("user_settings")
        .update({
          telegram_chat_id: chatId,
          telegram_verified_at: new Date().toISOString(),
          telegram_enabled: true,
          telegram_link_code: null,
          telegram_link_expires_at: null,
        })
        .eq("user_id", settings.user_id);

      await sendReply(botToken, chatId, "✅ *Connected!*\n\nYour Telegram is now linked to TradeBook.\n\nType /help to see available commands.");
      return new Response("OK", { status: 200 });
    }

    // Command routing
    const command = text.split(" ")[0].toLowerCase().replace(/@\w+$/, ""); // strip @botname

    if (!userId && command !== "/start" && command !== "/help") {
      await sendReply(botToken, chatId, "❌ Account not linked.\n\nGo to Settings → Integrations → Telegram to connect your account.");
      return new Response("OK", { status: 200 });
    }

    switch (command) {
      case "/start":
        await sendReply(botToken, chatId, "👋 *Welcome to TradeBook!*\n\nTo link your account, go to Settings → Integrations → Telegram and paste the verification code here.\n\nType /help to see available commands.");
        break;
      case "/pnl":
        await handlePnlCommand(supabase, userId!, botToken, chatId);
        break;
      case "/positions":
        await handlePositionsCommand(supabase, userId!, botToken, chatId);
        break;
      case "/briefing":
        await handleBriefingCommand(supabase, userId!, botToken, chatId);
        break;
      case "/help":
        await handleHelpCommand(botToken, chatId);
        break;
      default:
        // Ignore non-command messages
        break;
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return new Response("OK", { status: 200 }); // Always return 200 to Telegram
  }
});
