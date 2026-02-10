import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DHAN_CSV_URL = "https://images.dhan.co/api-data/api-scrip-master.csv";

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function mapInstrumentType(instrType: string): string {
  const m: Record<string, string> = {
    EQUITY: "EQ", EQ: "EQ",
    FUTSTK: "FUT", FUTIDX: "FUT", FUTCUR: "FUT", FUTCOM: "FUT",
    OPTSTK: "OPT", OPTIDX: "OPT", OPTCUR: "OPT", OPTFUT: "OPT", OPTCOM: "OPT",
    INDEX: "INDEX", COMMODITY: "COMMODITY",
  };
  return m[instrType] || instrType;
}

// Parse various date formats from Dhan CSV
function parseExpiryDate(dateStr: string): Date | null {
  if (!dateStr || dateStr === "0" || dateStr === "NA" || dateStr === "") return null;
  
  // Try YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const d = new Date(dateStr + "T00:00:00Z");
    return isNaN(d.getTime()) ? null : d;
  }
  // Try DD-Mon-YYYY or DD/Mon/YYYY 
  if (/^\d{1,2}[-\/][A-Za-z]{3}[-\/]\d{4}$/.test(dateStr)) {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  }
  // Try epoch milliseconds (large numbers)
  if (/^\d{10,13}$/.test(dateStr)) {
    const ts = parseInt(dateStr);
    const d = new Date(ts > 9999999999 ? ts : ts * 1000);
    return isNaN(d.getTime()) ? null : d;
  }
  // Try generic Date parse
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log("Starting instrument sync...");
    const startTime = Date.now();

    // Create sync log
    const { data: logEntry } = await supabase
      .from("instrument_sync_log")
      .insert({ status: "running", sync_type: "manual" })
      .select("id")
      .single();
    const logId = logEntry?.id;

    // Fetch CSV
    console.log("Fetching CSV from:", DHAN_CSV_URL);
    const response = await fetch(DHAN_CSV_URL, {
      headers: { "User-Agent": "TradeBook/1.0", "Accept": "text/csv,*/*" },
    });
    if (!response.ok) throw new Error(`CSV fetch failed: ${response.status}`);

    const csvText = await response.text();
    console.log(`CSV size: ${(csvText.length / 1024 / 1024).toFixed(1)} MB`);

    const lines = csvText.split("\n").filter((l) => l.trim());
    if (lines.length < 2) throw new Error("CSV empty");

    // Parse header to get column indices
    const header = parseCSVLine(lines[0]);
    const col: Record<string, number> = {};
    header.forEach((c, i) => { col[c.trim()] = i; });
    console.log("Columns:", header.join(", "));

    const idxExch = col["SEM_EXM_EXCH_ID"] ?? 0;
    const idxSeg = col["SEM_SEGMENT"] ?? 1;
    const idxSecId = col["SEM_SMST_SECURITY_ID"] ?? 2;
    const idxInstr = col["SEM_INSTRUMENT_NAME"] ?? 3;
    const idxExpDate = col["SEM_EXPIRY_DATE"] ?? col["SEM_EXPIRY_CODE"] ?? 5;
    const idxStrike = col["SEM_STRIKE_PRICE"] ?? 9;
    const idxOptType = col["SEM_OPTION_TYPE"] ?? 10;
    const idxTradSym = col["SEM_TRADING_SYMBOL"] ?? 5;
    const idxCustomSym = col["SEM_CUSTOM_SYMBOL"] ?? 7;
    const idxLot = col["SEM_LOT_UNITS"] ?? 6;
    const idxTick = col["SEM_TICK_SIZE"] ?? 11;
    const idxSeries = col["SEM_SERIES"];
    const idxSymName = col["SM_SYMBOL_NAME"];

    // Calculate cutoff: keep derivatives expiring within next 90 days only
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() + 90);

    interface InstrRow {
      security_id: string;
      exchange_segment: string;
      exchange: string;
      instrument_type: string;
      trading_symbol: string;
      display_name: string;
      underlying_symbol: string | null;
      expiry: string | null;
      strike: number | null;
      option_type: string | null;
      lot_size: number | null;
      tick_size: number | null;
    }

    const instruments: InstrRow[] = [];
    let stats = { nseEq: 0, nseFno: 0, mcx: 0, expired: 0, skipped: 0 };

    for (let i = 1; i < lines.length; i++) {
      try {
        const row = parseCSVLine(lines[i]);
        if (row.length < 8) continue;

        const exchCode = row[idxExch]?.trim();
        const segment = row[idxSeg]?.trim();
        const securityId = row[idxSecId]?.trim();

        if (!securityId || securityId === "0") continue;

        // Determine exchange segment - only keep NSE EQ, NSE FNO, MCX
        let exchangeSegment = "";
        let exchange = "";

        if (exchCode === "NSE" && segment === "E") {
          // NSE Equity - only keep EQ series (not BE, BL, etc.)
          const series = idxSeries !== undefined ? row[idxSeries]?.trim() : "";
          if (series && series !== "EQ" && series !== "") {
            stats.skipped++;
            continue;
          }
          exchangeSegment = "NSE_EQ";
          exchange = "NSE";
          stats.nseEq++;
        } else if (exchCode === "NSE" && segment === "D") {
          exchangeSegment = "NSE_FNO";
          exchange = "NFO";
        } else if (exchCode === "MCX" && (segment === "D" || segment === "M")) {
          exchangeSegment = "MCX_COMM";
          exchange = "MCX";
        } else if (exchCode === "NSE" && segment === "I") {
          exchangeSegment = "IDX_I";
          exchange = "NSE";
          // Indexes - always keep
        } else {
          stats.skipped++;
          continue;
        }

        const tradingSymbol = row[idxTradSym]?.trim() || "";
        const customSymbol = row[idxCustomSym]?.trim() || tradingSymbol;
        const instrumentName = row[idxInstr]?.trim() || "";
        const expiryStr = row[idxExpDate]?.trim() || "";
        const strikeStr = row[idxStrike]?.trim() || "";
        const optionType = row[idxOptType]?.trim() || "";
        const lotSize = parseInt(row[idxLot]) || 1;
        const tickSize = parseFloat(row[idxTick]) || 0.05;

        if (!tradingSymbol) continue;

        // Parse expiry and aggressively filter derivatives
        let expiry: string | null = null;
        if (expiryStr && expiryStr !== "0" && expiryStr !== "NA") {
          const expiryDate = parseExpiryDate(expiryStr);
          if (expiryDate) {
            const year = expiryDate.getFullYear();
            if (year >= 2020 && year <= 2100) {
              // Skip expired contracts
              if (expiryDate < today) {
                stats.expired++;
                continue;
              }
              // For F&O/MCX: only keep next 90 days
              if ((exchangeSegment === "NSE_FNO" || exchangeSegment === "MCX_COMM") && expiryDate > cutoff) {
                stats.skipped++;
                continue;
              }
              expiry = expiryDate.toISOString().split("T")[0];
            }
          }
          // If derivative has no parseable expiry, skip it (likely garbage)
          if (!expiry && (exchangeSegment === "NSE_FNO" || exchangeSegment === "MCX_COMM")) {
            stats.skipped++;
            continue;
          }
        }

        if (exchangeSegment === "NSE_FNO") stats.nseFno++;
        if (exchangeSegment === "MCX_COMM") stats.mcx++;

        const strike = strikeStr && strikeStr !== "0" && strikeStr !== "0.00" ? parseFloat(strikeStr) : null;
        const cleanSymbol = segment === "E" ? tradingSymbol.replace(/-EQ$/, "") : tradingSymbol;
        const symName = idxSymName !== undefined ? row[idxSymName]?.trim() : null;
        const underlying = symName || customSymbol?.split(" ")[0] || cleanSymbol.split(/\d/)[0] || cleanSymbol;

        instruments.push({
          security_id: securityId,
          exchange_segment: exchangeSegment,
          exchange,
          instrument_type: mapInstrumentType(instrumentName),
          trading_symbol: cleanSymbol,
          display_name: customSymbol || tradingSymbol,
          underlying_symbol: underlying || null,
          expiry,
          strike,
          option_type: optionType || null,
          lot_size: lotSize,
          tick_size: tickSize,
        });
      } catch {
        // Skip bad rows silently
      }
    }

    console.log(`Parsed: NSE_EQ=${stats.nseEq}, NSE_FNO=${stats.nseFno}, MCX=${stats.mcx}, Expired=${stats.expired}, Skipped=${stats.skipped}, Total=${instruments.length}`);

    if (instruments.length === 0) throw new Error("No instruments parsed");

    // Batch upsert - larger batches for speed
    const BATCH = 500;
    let inserted = 0;
    let errors = 0;

    for (let i = 0; i < instruments.length; i += BATCH) {
      const batch = instruments.slice(i, i + BATCH);
      const { error } = await supabase
        .from("instrument_master")
        .upsert(
          batch.map((inst) => ({ ...inst, updated_at: new Date().toISOString() })),
          { onConflict: "security_id" }
        );
      if (error) {
        console.error(`Batch error at ${i}:`, error.message);
        errors++;
      } else {
        inserted += batch.length;
      }
    }

    const duration = Date.now() - startTime;
    console.log(`Done: ${inserted} upserted, ${errors} errors, ${duration}ms`);

    if (logId) {
      await supabase.from("instrument_sync_log").update({
        status: errors > 0 ? "partial" : "completed",
        completed_at: new Date().toISOString(),
        total_rows: instruments.length,
        inserted_rows: inserted,
        error_message: errors > 0 ? `${errors} batch errors` : null,
      }).eq("id", logId);
    }

    return new Response(
      JSON.stringify({ success: true, inserted, total_parsed: instruments.length, errors, duration_ms: duration }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Sync failed:", error);
    // Mark any running logs as failed
    try {
      const { data: logs } = await supabase.from("instrument_sync_log")
        .select("id").eq("status", "running").order("started_at", { ascending: false }).limit(1);
      if (logs?.[0]) {
        await supabase.from("instrument_sync_log").update({
          status: "failed", completed_at: new Date().toISOString(),
          error_message: error instanceof Error ? error.message : "Unknown error",
        }).eq("id", logs[0].id);
      }
    } catch { /* ignore */ }

    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
