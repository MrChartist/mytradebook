/**
 * Import Demo Trades, Alerts & Studies for chartistmr@gmail.com
 * Run: node scripts/import_demo_data.mjs
 * 
 * Uses Supabase JS client with service role key to bypass RLS.
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://uqwwpkdahrmhkfgypuqp.supabase.co";
// We use the anon key + user auth approach. First get servicerole from env or hardcode project ref
// Actually let's use the REST API approach with the service_role key from supabase secrets

// Try to get service role key
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
    console.error("❌ SUPABASE_SERVICE_ROLE_KEY env var is required.");
    console.error("Run: set SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>");
    console.error("You can find it in Supabase Dashboard > Settings > API > service_role key");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

// Get user_id for chartistmr@gmail.com
async function getUserId() {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;
    const user = data.users.find(u => u.email === "chartistmr@gmail.com");
    if (!user) throw new Error("User chartistmr@gmail.com not found!");
    return user.id;
}

// ─── TRADES DATA ───────────────────────────────────────────
function getTrades(userId) {
    return [
        // ══ NOVEMBER 2024 ══
        { user_id: userId, symbol: "NIFTY", segment: "Options", trade_type: "BUY", quantity: 50, entry_price: 100, stop_loss: 60, targets: [130, 150, 175], status: "CLOSED", entry_time: "2024-11-10T09:38:00+05:30", closed_at: "2024-11-10T11:34:00+05:30", pnl: 2100, pnl_percent: 42, closure_reason: "TARGET_HIT", notes: "NIFTY 25550CE | T1 done at 142. Trail SL at cost.", rating: 8 },
        { user_id: userId, symbol: "PERSISTENT", segment: "Options", trade_type: "BUY", quantity: 25, entry_price: 141, stop_loss: 100, targets: [175, 195], status: "CLOSED", entry_time: "2024-11-11T09:57:00+05:30", closed_at: "2024-11-12T12:48:00+05:30", pnl: 2350, pnl_percent: 66.7, closure_reason: "TARGET_HIT", notes: "PERSISTENT 6000CE | Entry 141→235. Spot 5980→6163.", rating: 9 },
        { user_id: userId, symbol: "INDUSINDBK", segment: "Options", trade_type: "BUY", quantity: 50, entry_price: 24.75, stop_loss: 17.75, targets: [29, 35, 40], status: "CLOSED", entry_time: "2024-11-11T11:14:00+05:30", closed_at: "2024-11-12T09:34:00+05:30", pnl: 1840, pnl_percent: 148.7, closure_reason: "TARGET_HIT", notes: "INDUSINDBK 820CE | 25→61.55 All targets done. Spot 825→872.", rating: 9 },
        { user_id: userId, symbol: "BHARATFORG", segment: "Options", trade_type: "BUY", quantity: 25, entry_price: 45, stop_loss: 30, targets: [60, 70, 80], status: "CLOSED", entry_time: "2024-11-11T13:19:00+05:30", closed_at: "2024-11-11T13:32:00+05:30", pnl: -375, pnl_percent: -33.3, closure_reason: "SL_HIT", notes: "BHARATFORG 1360CE | SL hit due to result-based movement.", rating: 8 },
        { user_id: userId, symbol: "BIOCON", segment: "Options", trade_type: "BUY", quantity: 50, entry_price: 11.5, stop_loss: 6, targets: [18, 25], status: "CLOSED", entry_time: "2024-11-12T14:06:00+05:30", closed_at: "2024-11-13T10:58:00+05:30", pnl: 725, pnl_percent: 126, closure_reason: "TARGET_HIT", notes: "BIOCON 400CE | 11-12→26 Boom. Spot 400→422.", rating: 8 },
        { user_id: userId, symbol: "SONACOMS", segment: "Options", trade_type: "BUY", quantity: 50, entry_price: 10, stop_loss: 5, targets: [15, 18, 22], status: "CLOSED", entry_time: "2024-11-19T11:07:00+05:30", closed_at: "2024-11-20T12:31:00+05:30", pnl: 350, pnl_percent: 70, closure_reason: "TARGET_HIT", notes: "SONACOMS 500CE | 10→17 On fire 🔥", rating: 8 },
        { user_id: userId, symbol: "CHOLAFIN", segment: "Options", trade_type: "BUY", quantity: 25, entry_price: 37, stop_loss: 27, targets: [50, 60, 75], status: "CLOSED", entry_time: "2024-11-20T12:35:00+05:30", closed_at: "2024-11-26T09:49:00+05:30", pnl: 425, pnl_percent: 45.9, closure_reason: "TARGET_HIT", notes: "CHOLAFIN DEC 1700CE | T1 54 done. Trail SL above cost.", rating: 8 },
        { user_id: userId, symbol: "EICHERMOT", segment: "Options", trade_type: "BUY", quantity: 10, entry_price: 262, stop_loss: 175, targets: [375, 475, 575], status: "CLOSED", entry_time: "2024-11-20T13:02:00+05:30", closed_at: "2024-11-24T10:44:00+05:30", pnl: 1130, pnl_percent: 43.1, closure_reason: "TARGET_HIT", notes: "EICHERMOT 7000CE | 250-275→375 T1 done ✅", rating: 9 },
        { user_id: userId, symbol: "NIFTY", segment: "Options", trade_type: "BUY", quantity: 50, entry_price: 267, stop_loss: 200, targets: [325, 375, 410], status: "CLOSED", entry_time: "2024-11-24T12:51:00+05:30", closed_at: "2024-11-24T15:09:00+05:30", pnl: -3350, pnl_percent: -25.1, closure_reason: "SL_HIT", notes: "NIFTY 26050CE DEC | Failed to push above 26000. SL hit.", rating: 7 },
        { user_id: userId, symbol: "VBL", segment: "Options", trade_type: "BUY", quantity: 50, entry_price: 15.5, stop_loss: 9, targets: [19, 23, 27], status: "CLOSED", entry_time: "2024-11-25T15:16:00+05:30", closed_at: "2024-11-26T11:45:00+05:30", pnl: 675, pnl_percent: 87.7, closure_reason: "TARGET_HIT", notes: "VBL 445CE | 14→29 all targets done ~80%+ gain!", rating: 8 },
        { user_id: userId, symbol: "GLENMARK", segment: "Options", trade_type: "BUY", quantity: 25, entry_price: 75, stop_loss: 50, targets: [100, 125, 150], status: "CLOSED", entry_time: "2024-11-26T12:33:00+05:30", closed_at: "2024-11-27T09:45:00+05:30", pnl: 625, pnl_percent: 33.3, closure_reason: "TARGET_HIT", notes: "GLENMARK 1900CE | 75→100 T1 done ✅", rating: 8 },
        { user_id: userId, symbol: "SRF", segment: "Options", trade_type: "BUY", quantity: 25, entry_price: 56, stop_loss: 30, targets: [85, 95, 105], status: "CLOSED", entry_time: "2024-11-27T10:33:00+05:30", closed_at: "2024-11-28T11:57:00+05:30", pnl: 725, pnl_percent: 51.8, closure_reason: "TARGET_HIT", notes: "SRF 2900CE | First target done. 2X eventually.", rating: 8 },
        { user_id: userId, symbol: "MOTHERSON", segment: "Equity_Positional", trade_type: "BUY", quantity: 100, entry_price: 113, stop_loss: 108, targets: [120, 130, 140], status: "CLOSED", entry_time: "2024-11-27T10:00:00+05:30", closed_at: "2024-12-01T11:28:00+05:30", pnl: 800, pnl_percent: 7.1, closure_reason: "TARGET_HIT", notes: "MOTHERSON Positional | Spot 113→121. 115CE 3.5→7.43.", rating: 8 },

        // ══ DECEMBER 2024 ══
        { user_id: userId, symbol: "PERSISTENT", segment: "Options", trade_type: "BUY", quantity: 25, entry_price: 165, stop_loss: 120, targets: [196, 215, 235], status: "CLOSED", entry_time: "2024-12-04T09:22:00+05:30", closed_at: "2024-12-04T12:31:00+05:30", pnl: 875, pnl_percent: 21.2, closure_reason: "TARGET_HIT", notes: "PERSISTENT 6500CE | 160-170→200 T1 done. Setup 8.25.", rating: 8 },
        { user_id: userId, symbol: "INDUSTOWER", segment: "Options", trade_type: "BUY", quantity: 50, entry_price: 14.5, stop_loss: 9.25, targets: [20, 24, 28], status: "CLOSED", entry_time: "2024-12-05T12:37:00+05:30", closed_at: "2024-12-08T12:34:00+05:30", pnl: -175, pnl_percent: -24.1, closure_reason: "SL_HIT", notes: "INDUSTOWER 410CE | SL hit at 11. Trail SL was 11.", rating: 8 },
        { user_id: userId, symbol: "EICHERMOT", segment: "Options", trade_type: "BUY", quantity: 25, entry_price: 118, stop_loss: 80, targets: [145, 165, 185], status: "CLOSED", entry_time: "2024-12-10T10:01:00+05:30", closed_at: "2024-12-11T09:24:00+05:30", pnl: 975, pnl_percent: 33, closure_reason: "TARGET_HIT", notes: "EICHERMOT 7300CE | 115-125→157. Spot 7240→7333. Setup 8.75.", rating: 9 },
        { user_id: userId, symbol: "ADANIENT", segment: "Options", trade_type: "BUY", quantity: 25, entry_price: 53, stop_loss: 35, targets: [80, 90, 100], status: "CLOSED", entry_time: "2024-12-11T13:50:00+05:30", closed_at: "2024-12-16T09:32:00+05:30", pnl: -450, pnl_percent: -34, closure_reason: "SL_HIT", notes: "ADANIENT 2300CE | SL hit at 35. Setup 8.5.", rating: 9 },
        { user_id: userId, symbol: "ASHOKLEY", segment: "Options", trade_type: "BUY", quantity: 100, entry_price: 2.66, stop_loss: 1.60, targets: [3.5, 4.5, 5.5], status: "CLOSED", entry_time: "2024-12-11T09:39:00+05:30", closed_at: "2024-12-22T09:00:00+05:30", pnl: 576, pnl_percent: 217, closure_reason: "TARGET_HIT", notes: "ASHOKLEY 165CE | 2.5→8.42 🔥 All targets! Spot 163→174. Setup 8.75.", rating: 9 },
        { user_id: userId, symbol: "IDFCFIRSTB", segment: "Options", trade_type: "BUY", quantity: 100, entry_price: 0.77, stop_loss: 0.30, targets: [1.2, 1.6, 2.0], status: "CLOSED", entry_time: "2024-12-11T14:05:00+05:30", closed_at: "2024-12-15T14:03:00+05:30", pnl: 69, pnl_percent: 89.6, closure_reason: "TARGET_HIT", notes: "IDFCFIRSTB 85CE | 0.77→1.46 almost 2X done. Setup 8.75.", rating: 9 },
        { user_id: userId, symbol: "BLUESTARCO", segment: "Options", trade_type: "BUY", quantity: 100, entry_price: 6.2, stop_loss: 1, targets: [10, 12, 14, 18, 25], status: "CLOSED", entry_time: "2024-12-15T09:26:00+05:30", closed_at: "2024-12-18T11:56:00+05:30", pnl: 580, pnl_percent: 93.5, closure_reason: "TARGET_HIT", notes: "BLUESTARCO 1900CE | 5→12 🔥 Hero Zero type.", rating: 9 },
        { user_id: userId, symbol: "PHOENIXLTD", segment: "Options", trade_type: "BUY", quantity: 25, entry_price: 28, stop_loss: 12, targets: [48, 60, 80], status: "CLOSED", entry_time: "2024-12-15T14:15:00+05:30", closed_at: "2024-12-21T09:00:00+05:30", pnl: 500, pnl_percent: 71.4, closure_reason: "TARGET_HIT", notes: "PHOENIXLTD 1800CE Positional | 25-31→48 T1 done ✅. Setup 8.75.", rating: 9 },
        { user_id: userId, symbol: "KEI", segment: "Options", trade_type: "BUY", quantity: 25, entry_price: 76, stop_loss: 45, targets: [89, 98, 108], status: "CLOSED", entry_time: "2024-12-19T09:00:00+05:30", closed_at: "2024-12-22T09:00:00+05:30", pnl: 5675, pnl_percent: 299, closure_reason: "TARGET_HIT", notes: "KEI 4200CE | 76→303! 4.25X = 425% gain 🎯 Perfect catch!", rating: 10 },
        { user_id: userId, symbol: "MANAPPURAM", segment: "Options", trade_type: "BUY", quantity: 100, entry_price: 2.15, stop_loss: 0.5, targets: [4, 5, 6, 7], status: "CLOSED", entry_time: "2024-12-19T09:00:00+05:30", closed_at: "2024-12-24T09:00:00+05:30", pnl: 1185, pnl_percent: 551, closure_reason: "TARGET_HIT", notes: "MANAPPURAM 300CE | 2→14 = 7X! Hero Zero type. Setup 8.75.", rating: 10 },
        { user_id: userId, symbol: "NMDC", segment: "Options", trade_type: "BUY", quantity: 100, entry_price: 1.9, stop_loss: 0.8, targets: [3, 4, 5, 6], status: "CLOSED", entry_time: "2024-12-22T09:00:00+05:30", closed_at: "2024-12-30T09:29:00+05:30", pnl: 295, pnl_percent: 155, closure_reason: "TARGET_HIT", notes: "NMDC JAN 80CE | 1.90→4.85 ✅ Top gainer F&O. Setup 8.75.", rating: 9 },
        { user_id: userId, symbol: "JSWSTEEL", segment: "Options", trade_type: "BUY", quantity: 25, entry_price: 37, stop_loss: 25, targets: [48, 56, 76], status: "CLOSED", entry_time: "2024-12-29T09:00:00+05:30", closed_at: "2024-12-31T09:16:00+05:30", pnl: 650, pnl_percent: 70.3, closure_reason: "TARGET_HIT", notes: "JSWSTEEL JAN 1100CE | 37→63 two targets. Top gainer 4% pre-open.", rating: 8 },
        { user_id: userId, symbol: "AXISBANK", segment: "Options", trade_type: "BUY", quantity: 25, entry_price: 29, stop_loss: 20, targets: [40, 50], status: "CLOSED", entry_time: "2024-12-30T10:23:00+05:30", closed_at: "2024-12-31T15:13:00+05:30", pnl: 425, pnl_percent: 58.6, closure_reason: "TARGET_HIT", notes: "AXISBANK 1240CE | 29→46 target done ✅. Setup 8.25.", rating: 8 },

        // ══ JANUARY 2025 ══
        { user_id: userId, symbol: "INDUSINDBK", segment: "Options", trade_type: "BUY", quantity: 50, entry_price: 19.8, stop_loss: 12, targets: [27, 35, 45], status: "CLOSED", entry_time: "2025-01-01T09:00:00+05:30", closed_at: "2025-01-06T09:00:00+05:30", pnl: 1010, pnl_percent: 102, closure_reason: "TARGET_HIT", notes: "INDUSINDBK 900CE | 18-20→40 done. 2X! Setup 8.75.", rating: 9 },
        { user_id: userId, symbol: "TORNTPOWER", segment: "Options", trade_type: "BUY", quantity: 50, entry_price: 16.5, stop_loss: 9, targets: [22, 28, 38], status: "CLOSED", entry_time: "2025-01-02T09:00:00+05:30", closed_at: "2025-01-02T15:00:00+05:30", pnl: 1070, pnl_percent: 129.7, closure_reason: "TARGET_HIT", notes: "TORNTPOWER 1400CE | 16.5→37.90 🔥 Spot 1350→1396. Setup 8.5.", rating: 9 },
        { user_id: userId, symbol: "PETRONET", segment: "Options", trade_type: "BUY", quantity: 100, entry_price: 2.4, stop_loss: 1, targets: [3.5, 5, 7], status: "CLOSED", entry_time: "2025-01-02T09:00:00+05:30", closed_at: "2025-01-07T09:00:00+05:30", pnl: 360, pnl_percent: 150, closure_reason: "TARGET_HIT", notes: "PETRONET 27JAN 300CE | 2.2-2.5→6 ~2.5X. Setup 8.75.", rating: 9 },
        { user_id: userId, symbol: "ICICIBANK", segment: "Options", trade_type: "BUY", quantity: 25, entry_price: 27.5, stop_loss: 17, targets: [40, 50], status: "CLOSED", entry_time: "2025-01-06T09:00:00+05:30", closed_at: "2025-01-08T09:00:00+05:30", pnl: 688, pnl_percent: 100, closure_reason: "TARGET_HIT", notes: "ICICIBANK 1400CE | 27-28→55. 2X! 9-month channel breakout. Setup 8.5.", rating: 9 },
        { user_id: userId, symbol: "TORNTPHARM", segment: "Options", trade_type: "BUY", quantity: 25, entry_price: 34, stop_loss: 20, targets: [50, 60, 70], status: "CLOSED", entry_time: "2025-01-06T09:00:00+05:30", closed_at: "2025-01-07T09:00:00+05:30", pnl: 1775, pnl_percent: 208.8, closure_reason: "TARGET_HIT", notes: "TORNTPHARM 4000CE | 30-38→105 done! Spot 3900→4060. Setup 8.75.", rating: 9 },
        { user_id: userId, symbol: "COLPAL", segment: "Options", trade_type: "BUY", quantity: 50, entry_price: 11, stop_loss: 2, targets: [20, 30], status: "CLOSED", entry_time: "2025-01-19T09:00:00+05:30", closed_at: "2025-01-19T15:00:00+05:30", pnl: 1950, pnl_percent: 354.5, closure_reason: "TARGET_HIT", notes: "COLPAL 2200CE | 12→50 🚀 4X in minutes! Benchmark day. Setup 8.5.", rating: 10 },
        { user_id: userId, symbol: "BANKINDIA", segment: "Options", trade_type: "BUY", quantity: 100, entry_price: 4, stop_loss: 2.8, targets: [5, 6, 7], status: "CLOSED", entry_time: "2025-01-16T09:00:00+05:30", closed_at: "2025-01-19T09:00:00+05:30", pnl: 625, pnl_percent: 156.3, closure_reason: "TARGET_HIT", notes: "BANKINDIA 155CE | 4→10.25 ~150%+ Cup & Handle pattern. Setup 9.", rating: 9 },
        { user_id: userId, symbol: "BEL", segment: "Options", trade_type: "BUY", quantity: 50, entry_price: 14, stop_loss: 8, targets: [25, 35], status: "CLOSED", entry_time: "2025-01-16T09:00:00+05:30", closed_at: "2025-01-28T09:00:00+05:30", pnl: 1400, pnl_percent: 200, closure_reason: "TARGET_HIT", notes: "BEL 420CE FEB | 12-16→42 = 3X! BEL 10% UC. Spot 405→450. Setup 8.75.", rating: 9 },
        { user_id: userId, symbol: "MARUTI", segment: "Options", trade_type: "BUY", quantity: 10, entry_price: 174, stop_loss: 135, targets: [200, 220, 240], status: "CLOSED", entry_time: "2025-01-16T09:00:00+05:30", closed_at: "2025-01-16T15:00:00+05:30", pnl: 610, pnl_percent: 35.1, closure_reason: "TARGET_HIT", notes: "MARUTI 16000CE Intraday | 170-180→235 all targets done. Setup 8.5.", rating: 9 },
        { user_id: userId, symbol: "MAZDOCK", segment: "Options", trade_type: "BUY", quantity: 25, entry_price: 71, stop_loss: 55, targets: [85, 95, 105], status: "CLOSED", entry_time: "2025-01-09T09:00:00+05:30", closed_at: "2025-01-09T15:00:00+05:30", pnl: 675, pnl_percent: 38, closure_reason: "TARGET_HIT", notes: "MAZDOCK 2600CE | 72→98 second target ✅. Setup 8.25.", rating: 8 },
        { user_id: userId, symbol: "LTF", segment: "Options", trade_type: "BUY", quantity: 100, entry_price: 4.6, stop_loss: 3.3, targets: [6, 8, 10], status: "CLOSED", entry_time: "2025-01-15T09:00:00+05:30", closed_at: "2025-01-16T09:00:00+05:30", pnl: 380, pnl_percent: 82.6, closure_reason: "TARGET_HIT", notes: "LTF 300CE | 4.5-4.8→8.40 almost 2X ✅ Reversal. Setup 8.25.", rating: 8 },
        { user_id: userId, symbol: "COALINDIA", segment: "Options", trade_type: "BUY", quantity: 100, entry_price: 3.65, stop_loss: 1.8, targets: [5, 6, 7], status: "CLOSED", entry_time: "2025-01-14T09:00:00+05:30", closed_at: "2025-01-14T15:00:00+05:30", pnl: 135, pnl_percent: 37, closure_reason: "TARGET_HIT", notes: "COALINDIA 450CE | 3.5→5 T1 done. Risky trade.", rating: 7 },
        { user_id: userId, symbol: "VOLTAS", segment: "Options", trade_type: "BUY", quantity: 25, entry_price: 31, stop_loss: 20, targets: [45, 55, 65], status: "CLOSED", entry_time: "2025-01-23T09:00:00+05:30", closed_at: "2025-01-28T09:00:00+05:30", pnl: 350, pnl_percent: 45.2, closure_reason: "TARGET_HIT", notes: "VOLTAS 1400CE FEB | 30→45 T1 done. Setup 8.25.", rating: 8 },
        { user_id: userId, symbol: "NTPC", segment: "Options", trade_type: "BUY", quantity: 50, entry_price: 12.35, stop_loss: 8, targets: [16, 18, 20], status: "CLOSED", entry_time: "2025-01-29T09:00:00+05:30", closed_at: "2025-01-29T15:00:00+05:30", pnl: 182.5, pnl_percent: 29.6, closure_reason: "TARGET_HIT", notes: "NTPC 350CE Intraday | 12.35→16 T1 done ✅. Setup 8.75.", rating: 9 },
        { user_id: userId, symbol: "JINDALSTEL", segment: "Options", trade_type: "BUY", quantity: 25, entry_price: 41, stop_loss: 32, targets: [55, 65, 75], status: "CLOSED", entry_time: "2025-01-23T09:22:00+05:30", closed_at: "2025-01-28T09:00:00+05:30", pnl: -175, pnl_percent: -17.1, closure_reason: "SL_HIT", notes: "JINDALSTEEL 1100CE FEB | TSL hit at 34. Setup 8.75.", rating: 9 },
        { user_id: userId, symbol: "GAIL", segment: "Options", trade_type: "BUY", quantity: 200, entry_price: 0.97, stop_loss: 0.2, targets: [2, 3], status: "CLOSED", entry_time: "2025-01-21T09:00:00+05:30", closed_at: "2025-01-21T15:00:00+05:30", pnl: 216, pnl_percent: 111.3, closure_reason: "TARGET_HIT", notes: "GAIL 165CE Hero-Zero | 0.97→2.05 T1 done! Scalp. Setup 8.", rating: 8 },
    ];
}

// ─── ALERTS DATA ───────────────────────────────────────────
function getAlerts(userId) {
    return [
        { user_id: userId, symbol: "RELIANCE", condition_type: "PRICE_GT", threshold: 2650, recurrence: "ONCE", active: true, parameters: { note: "Breakout above resistance zone" } },
        { user_id: userId, symbol: "TATASTEEL", condition_type: "PRICE_LT", threshold: 140, recurrence: "ONCE", active: true, parameters: { note: "Support zone buy trigger" } },
        { user_id: userId, symbol: "HDFCBANK", condition_type: "PRICE_GT", threshold: 1850, recurrence: "ONCE", active: true, parameters: { note: "All-time high breakout watch" } },
        { user_id: userId, symbol: "INFY", condition_type: "PERCENT_CHANGE_GT", threshold: 3, recurrence: "DAILY", active: true, parameters: { note: "Big move alert for scalp" } },
        { user_id: userId, symbol: "NIFTY", condition_type: "PRICE_GT", threshold: 26500, recurrence: "ONCE", active: true, parameters: { note: "Nifty breakout above 26500 — bullish momentum" } },
        { user_id: userId, symbol: "COALINDIA", condition_type: "PRICE_GT", threshold: 430, recurrence: "ONCE", active: true, parameters: { note: "Symmetrical triangle breakout target zone" } },
        { user_id: userId, symbol: "VOLTAS", condition_type: "PRICE_GT", threshold: 1550, recurrence: "ONCE", active: true, parameters: { note: "Next resistance after double bottom breakout" } },
        { user_id: userId, symbol: "BAJFINANCE", condition_type: "PRICE_LT", threshold: 7100, recurrence: "ONCE", active: true, parameters: { note: "Key support — reversal buy candidate" } },
    ];
}

// ─── STUDIES DATA ──────────────────────────────────────────
function getStudies(userId) {
    return [
        { user_id: userId, title: "ICICIBANK - 9 Month Descending Channel Breakout", symbol: "ICICIBANK", category: "Technical", notes: "ICICI Bank spent 9 months inside a descending channel. Price rising with expanding volume — real money stepping in. Breakout above ₹1420 opens door for ₹1450 → ₹1480 → ₹1520. Support: ₹1380. This is a multi-month correction preparing for expansion.", tags: ["Channel Breakout", "Institutional Buying", "Volume Expansion"], analysis_date: "2025-01-07" },
        { user_id: userId, title: "COALINDIA - Symmetrical Triangle Pattern", symbol: "COALINDIA", category: "Technical", notes: "COALINDIA forming symmetrical triangle near 395.20 resistance. Breakout triggered massive move — 395→412 in spot, 400CE 4→14 (3.5X). Classic compression breakout pattern. Power of setting alerts early.", tags: ["Symmetrical Triangle", "Breakout", "Options Multi-bagger"], analysis_date: "2024-12-23" },
        { user_id: userId, title: "KEI Industries - Perfect Momentum Catch", symbol: "KEI", category: "Technical", notes: "KEI 4200CE entry at 76 with SL 45. Stock became top gainer. CE moved 76→303 = 4.25X = 425% gain. Example of riding momentum with trailing SL. First target 89 → trail → 120 → 150 → 303. Never moved SL backward.", tags: ["Momentum", "Trailing SL Discipline", "Multi-bagger"], analysis_date: "2024-12-22" },
        { user_id: userId, title: "ASHOKLEY - Pole & Flag at High", symbol: "ASHOKLEY", category: "Technical", notes: "ASHOKLEY Pole & Flag breakout at high. 165CE 2.5→8.42 all targets done. Spot 163→188. Pattern works like fire when breakout happens at new highs. Held for 11 days with discipline — trail SL at each target.", tags: ["Pole & Flag", "Breakout at High", "Options"], analysis_date: "2025-01-02" },
        { user_id: userId, title: "BANKINDIA - Cup & Handle Pattern", symbol: "BANKINDIA", category: "Technical", notes: "BANKINDIA cup and handle pattern crossing 154.70. 155CE bought at 4, hit 10.25 = 156% gain. Classic textbook pattern. Setup rating 9 — highest conviction trade. Volume confirmed breakout.", tags: ["Cup & Handle", "High Conviction", "Volume Confirmation"], analysis_date: "2025-01-16" },
        { user_id: userId, title: "Risk Management - Index Trading Rules", symbol: "NIFTY", category: "Other", notes: "Key learnings from Nov-Jan index trading:\n1. Always trade Index with only 2-3 lots\n2. Do not use big quantity\n3. Index moves are sharp and violent\n4. Protect capital first\n5. Discipline makes money, greed breaks accounts\n6. NIFTY failed twice (26050CE Nov 24, 26000CE Jan 8) — both SL hit. Win rate lower on index vs stocks.", tags: ["Risk Management", "Index", "Capital Protection"], analysis_date: "2025-01-09" },
        { user_id: userId, title: "VOLTAS - Double Bottom & Breakout Analysis", symbol: "VOLTAS", category: "Technical", notes: "VOLTAS 1400CE traded multiple times.\n• Dec 16: 30-40→46 (T1)\n• Jan 5: 1300CE→103, spot crossing 1449\n• Jan 7: 1400CE 30→127 all targets done!\n• Jan 23: FEB 1400CE 30→45\nDouble bottom pattern on 15-min chart. Similar to COALINDIA pattern. Repeated winners when pattern confirmed.", tags: ["Double Bottom", "Repeat Winner", "Multi-timeframe"], analysis_date: "2025-01-28" },
        { user_id: userId, title: "Scalping Discipline Framework", symbol: "NIFTY", category: "Other", notes: "Scalping Rules (from Jan 22 session):\n• Always enter with Limit order\n• Pre-define stop-loss\n• Keep trailing SL ON\n• Don't trade without SL — no exceptions\n• Keep a Book Profit (TP) order\n• Book half at target, trail remaining with TSL\n• 1-point trailing is safe; very tight may kick out early\n\nScalping is not about holding. Risk first. Profit follows.", tags: ["Scalping", "Discipline", "Rules"], analysis_date: "2025-01-22" },
    ];
}

// ─── MAIN ──────────────────────────────────────────────────
async function main() {
    try {
        console.log("🔍 Looking up user chartistmr@gmail.com...");
        const userId = await getUserId();
        console.log(`✅ Found user: ${userId}`);

        // Insert trades
        const trades = getTrades(userId);
        console.log(`\n📊 Inserting ${trades.length} trades...`);
        const { data: tradeData, error: tradeError } = await supabase
            .from("trades")
            .insert(trades)
            .select("id, symbol");
        if (tradeError) {
            console.error("❌ Trade insert error:", tradeError);
        } else {
            console.log(`✅ ${tradeData.length} trades inserted!`);
            tradeData.slice(0, 5).forEach(t => console.log(`   → ${t.symbol} (${t.id})`));
            if (tradeData.length > 5) console.log(`   ... and ${tradeData.length - 5} more`);
        }

        // Insert alerts
        const alerts = getAlerts(userId);
        console.log(`\n🔔 Inserting ${alerts.length} alerts...`);
        const { data: alertData, error: alertError } = await supabase
            .from("alerts")
            .insert(alerts)
            .select("id, symbol");
        if (alertError) {
            console.error("❌ Alert insert error:", alertError);
        } else {
            console.log(`✅ ${alertData.length} alerts inserted!`);
            alertData.forEach(a => console.log(`   → ${a.symbol} (${a.id})`));
        }

        // Insert studies
        const studies = getStudies(userId);
        console.log(`\n📝 Inserting ${studies.length} studies...`);
        const { data: studyData, error: studyError } = await supabase
            .from("studies")
            .insert(studies)
            .select("id, title");
        if (studyError) {
            console.error("❌ Study insert error:", studyError);
        } else {
            console.log(`✅ ${studyData.length} studies inserted!`);
            studyData.forEach(s => console.log(`   → ${s.title} (${s.id})`));
        }

        console.log("\n" + "═".repeat(50));
        console.log("🎉 DEMO DATA IMPORT COMPLETE!");
        console.log(`   Trades:  ${trades.length}`);
        console.log(`   Alerts:  ${alerts.length}`);
        console.log(`   Studies: ${studies.length}`);
        console.log("═".repeat(50));

    } catch (err) {
        console.error("Fatal error:", err.message);
        process.exit(1);
    }
}

main();
