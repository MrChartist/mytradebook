 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
 };
 
 interface InstrumentRow {
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
 
// Dhan scrip master compact CSV - single file with all instruments
// This is the correct working URL (the separate equity URL returns 403)
const DHAN_COMPACT_CSV_URL = "https://images.dhan.co/api-data/api-scrip-master.csv";
 
 // Parse CSV line handling quoted fields
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
 
 // Map Dhan exchange segment codes to our format
 function mapExchangeSegment(segment: string): { exchange: string; segment: string } {
   const mapping: Record<string, { exchange: string; segment: string }> = {
     NSE_EQ: { exchange: "NSE", segment: "NSE_EQ" },
     NSE_FNO: { exchange: "NFO", segment: "NSE_FNO" },
     BSE_EQ: { exchange: "BSE", segment: "BSE_EQ" },
     BSE_FNO: { exchange: "BSE", segment: "BSE_FNO" },
     MCX_COMM: { exchange: "MCX", segment: "MCX_COMM" },
     NSE_CURRENCY: { exchange: "NSE", segment: "NSE_CURRENCY" },
     BSE_CURRENCY: { exchange: "BSE", segment: "BSE_CURRENCY" },
     MCX_FO: { exchange: "MCX", segment: "MCX_FO" },
     IDX_I: { exchange: "NSE", segment: "IDX_I" },
   };
   return mapping[segment] || { exchange: segment.split("_")[0], segment };
 }
 
 // Map Dhan instrument types to our simplified format
 function mapInstrumentType(instrType: string): string {
   const mapping: Record<string, string> = {
     EQUITY: "EQ",
     EQ: "EQ",
     FUTSTK: "FUT",
     FUTIDX: "FUT",
     FUTCUR: "FUT",
     FUTCOM: "FUT",
     OPTSTK: "OPT",
     OPTIDX: "OPT",
     OPTCUR: "OPT",
     OPTFUT: "OPT",
     OPTCOM: "OPT",
     INDEX: "INDEX",
     COMMODITY: "COMMODITY",
   };
   return mapping[instrType] || instrType;
 }
 
// Fetch and parse Dhan compact CSV (contains all instruments)
async function fetchDhanCompactCSV(): Promise<InstrumentRow[]> {
   const instruments: InstrumentRow[] = [];
  const equityCount = { nse: 0, bse: 0 };
  const fnoCount = { nse: 0, mcx: 0 };
   
  console.log("Fetching compact CSV from Dhan:", DHAN_COMPACT_CSV_URL);
  const response = await fetch(DHAN_COMPACT_CSV_URL, {
    headers: {
      "User-Agent": "Lovable-TradeBook/1.0",
      "Accept": "text/csv,*/*",
    },
  });
   
   if (!response.ok) {
    throw new Error(`Failed to fetch compact CSV: ${response.status} ${response.statusText}`);
   }
   
   const csvText = await response.text();
  console.log(`Downloaded CSV size: ${(csvText.length / 1024 / 1024).toFixed(2)} MB`);
  
   const lines = csvText.split("\n").filter((line) => line.trim());
   
   if (lines.length < 2) {
    throw new Error("CSV appears empty");
   }
   
   // Parse header
   const header = parseCSVLine(lines[0]);
   const colIndex: Record<string, number> = {};
   header.forEach((col, idx) => {
     colIndex[col.toUpperCase().replace(/[^A-Z0-9_]/g, "_")] = idx;
   });
   
  console.log("CSV columns:", Object.keys(colIndex).join(", "));
  console.log(`Total rows to process: ${lines.length - 1}`);
   
  // Compact CSV columns:
  // SEM_EXM_EXCH_ID, SEM_SEGMENT, SEM_SMST_SECURITY_ID, SEM_INSTRUMENT_NAME,
  // SEM_EXPIRY_CODE, SEM_EXPIRY_DATE, SEM_STRIKE_PRICE, SEM_OPTION_TYPE,
  // SEM_TRADING_SYMBOL, SEM_CUSTOM_SYMBOL, SEM_LOT_UNITS, SEM_TICK_SIZE
  
  // Get column indices
  const idx = {
    exchange: colIndex["SEM_EXM_EXCH_ID"] ?? 0,
    segment: colIndex["SEM_SEGMENT"] ?? 1,
    securityId: colIndex["SEM_SMST_SECURITY_ID"] ?? 2,
    instrumentName: colIndex["SEM_INSTRUMENT_NAME"] ?? 3,
    expiryCode: colIndex["SEM_EXPIRY_CODE"] ?? 4,
    expiryDate: colIndex["SEM_EXPIRY_DATE"] ?? 5,
    strikePrice: colIndex["SEM_STRIKE_PRICE"] ?? 6,
    optionType: colIndex["SEM_OPTION_TYPE"] ?? 7,
    tradingSymbol: colIndex["SEM_TRADING_SYMBOL"] ?? 8,
    customSymbol: colIndex["SEM_CUSTOM_SYMBOL"] ?? 9,
    lotUnits: colIndex["SEM_LOT_UNITS"] ?? 10,
    tickSize: colIndex["SEM_TICK_SIZE"] ?? 11,
  };
  
   const today = new Date();
   today.setHours(0, 0, 0, 0);
   
  let skippedExpired = 0;
  let skippedOther = 0;
  
   for (let i = 1; i < lines.length; i++) {
     try {
       const row = parseCSVLine(lines[i]);
      if (row.length < 10) continue;
       
      const exchangeCode = row[idx.exchange]?.trim();
      const segment = row[idx.segment]?.trim();
      const securityId = row[idx.securityId]?.trim();
       
      // Skip invalid security IDs
      if (!securityId || securityId === "0" || securityId === "") continue;
       
      // Determine exchange segment and filter
       let exchangeSegment = "";
       let exchange = "";
       
      if (exchangeCode === "NSE" && segment === "E") {
        // NSE Equity
        exchangeSegment = "NSE_EQ";
        exchange = "NSE";
        equityCount.nse++;
      } else if (exchangeCode === "NSE" && segment === "D") {
        // NSE Derivatives (F&O)
        exchangeSegment = "NSE_FNO";
        exchange = "NFO";
        fnoCount.nse++;
      } else if (exchangeCode === "MCX" && (segment === "D" || segment === "M")) {
        // MCX Commodities
        exchangeSegment = "MCX_COMM";
         exchange = "MCX";
        fnoCount.mcx++;
      } else if (exchangeCode === "NSE" && segment === "I") {
        // NSE Index
         exchangeSegment = "IDX_I";
         exchange = "NSE";
       } else {
        // Skip BSE, Currency, etc. for now
        skippedOther++;
        continue;
       }
       
      const tradingSymbol = row[idx.tradingSymbol]?.trim() || "";
      const customSymbol = row[idx.customSymbol]?.trim() || tradingSymbol;
      const instrumentName = row[idx.instrumentName]?.trim() || "";
      const expiryStr = row[idx.expiryDate]?.trim() || "";
      const strikeStr = row[idx.strikePrice]?.trim() || "";
      const optionType = row[idx.optionType]?.trim() || "";
      const lotSize = parseInt(row[idx.lotUnits]) || 1;
      const tickSize = parseFloat(row[idx.tickSize]) || 0.05;
       
       if (!tradingSymbol) continue;
       
      // Extract underlying symbol from custom symbol (e.g., "NIFTY 27FEB25 23000 CE" -> "NIFTY")
      const underlyingSymbol = customSymbol?.split(" ")[0] || tradingSymbol.split(/\d/)[0] || tradingSymbol;
      
       // Parse expiry date and filter expired contracts
       let expiry: string | null = null;
       if (expiryStr && expiryStr !== "0" && expiryStr !== "") {
         try {
          let expiryDate: Date | null = null;
          
          if (/^\d+$/.test(expiryStr) && expiryStr.length > 10) {
            // Very large numbers - garbage, skip expiry
            expiry = null;
          } else if (expiryStr.includes("-") && expiryStr.length === 10) {
            // ISO format: YYYY-MM-DD
            expiryDate = new Date(expiryStr + "T00:00:00Z");
          } else if (expiryStr.includes("-") && /[A-Za-z]/.test(expiryStr)) {
            // Format: DD-Mon-YYYY
            expiryDate = new Date(expiryStr);
          } else if (/^\d{8}$/.test(expiryStr)) {
            // Format: YYYYMMDD
            const y = expiryStr.slice(0, 4);
            const m = expiryStr.slice(4, 6);
            const d = expiryStr.slice(6, 8);
            expiryDate = new Date(`${y}-${m}-${d}T00:00:00Z`);
          }
          
          if (expiryDate && !isNaN(expiryDate.getTime())) {
            const year = expiryDate.getFullYear();
            if (year >= 2020 && year <= 2100) {
              // Skip expired contracts
              if (expiryDate < today) {
                skippedExpired++;
                continue;
              }
              expiry = expiryDate.toISOString().split("T")[0];
            }
          }
         } catch {
           // Keep null if parse fails
         }
       }
       
       const strike = strikeStr && strikeStr !== "0" ? parseFloat(strikeStr) : null;
       
      // Clean up trading symbol for equities (remove -EQ suffix)
      const cleanTradingSymbol = segment === "E" 
        ? tradingSymbol.replace(/-EQ$/, "") 
        : tradingSymbol;
      
       instruments.push({
         security_id: securityId,
         exchange_segment: exchangeSegment,
         exchange: exchange,
         instrument_type: mapInstrumentType(instrumentName),
        trading_symbol: cleanTradingSymbol,
         display_name: customSymbol || tradingSymbol,
         underlying_symbol: underlyingSymbol || null,
         expiry: expiry,
         strike: strike,
         option_type: optionType || null,
         lot_size: lotSize,
         tick_size: tickSize,
       });
     } catch (e) {
       console.warn(`Row ${i} parse error:`, e);
     }
   }
   
  console.log(`Parsing complete:
    - NSE Equity: ${equityCount.nse}
    - NSE F&O: ${fnoCount.nse}
    - MCX: ${fnoCount.mcx}
    - Skipped expired: ${skippedExpired}
    - Skipped other segments: ${skippedOther}
    - Total instruments: ${instruments.length}`);
  
   return instruments;
 }
 
 Deno.serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
   const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
   const supabase = createClient(supabaseUrl, supabaseServiceKey);
 
   try {
    console.log("Starting instrument sync from Dhan scrip master...");
    const startTime = Date.now();
     
     // Create sync log entry
     const { data: logEntry, error: logError } = await supabase
       .from("instrument_sync_log")
       .insert({ status: "running", sync_type: "manual" })
       .select()
       .single();
     
     if (logError) {
       console.error("Failed to create sync log:", logError);
     }
     
     const logId = logEntry?.id;
     
    // Fetch all instruments from single compact CSV
    const allInstruments = await fetchDhanCompactCSV();
    
    console.log(`Total instruments to sync: ${allInstruments.length}`);
    
    if (allInstruments.length === 0) {
      throw new Error("No instruments parsed from Dhan CSV");
    }
     
    // Batch upsert in smaller chunks to avoid timeout
    const BATCH_SIZE = 200;
     let inserted = 0;
     let updated = 0;
    let errors = 0;
     
    for (let i = 0; i < allInstruments.length; i += BATCH_SIZE) {
      const batch = allInstruments.slice(i, i + BATCH_SIZE);
       
       const { error: upsertError } = await supabase
         .from("instrument_master")
         .upsert(
           batch.map((inst) => ({
             ...inst,
             updated_at: new Date().toISOString(),
           })),
           { onConflict: "security_id" }
         );
       
       if (upsertError) {
        console.error(`Batch upsert error at row ${i}:`, upsertError.message);
        errors++;
       } else {
         inserted += batch.length;
       }
      
      // Log progress every 10 batches
      if ((i / BATCH_SIZE) % 10 === 0) {
        console.log(`Progress: ${i + batch.length}/${allInstruments.length} rows processed`);
      }
     }
     
    const duration = Date.now() - startTime;
    console.log(`Sync completed in ${duration}ms: ${inserted} instruments upserted, ${errors} batch errors`);
    
     // Update sync log
     if (logId) {
       await supabase
         .from("instrument_sync_log")
         .update({
          status: errors > 0 ? "partial" : "completed",
           completed_at: new Date().toISOString(),
          total_rows: allInstruments.length,
           inserted_rows: inserted,
          error_message: errors > 0 ? `${errors} batch errors` : null,
         })
         .eq("id", logId);
     }
     
     return new Response(
       JSON.stringify({
         success: true,
        message: `Synced ${inserted} instruments from Dhan`,
        total_parsed: allInstruments.length,
        inserted: inserted,
        errors: errors,
        duration_ms: duration,
       }),
       { headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   } catch (error) {
     console.error("Instrument sync failed:", error);
     
    // Update sync log with error
    try {
      const { data: logs } = await supabase
        .from("instrument_sync_log")
        .select("id")
        .eq("status", "running")
        .order("started_at", { ascending: false })
        .limit(1);
      
      if (logs && logs[0]) {
        await supabase
          .from("instrument_sync_log")
          .update({
            status: "failed",
            completed_at: new Date().toISOString(),
            error_message: error instanceof Error ? error.message : "Unknown error",
          })
          .eq("id", logs[0].id);
      }
    } catch {
      // Ignore log update errors
    }
    
     return new Response(
       JSON.stringify({
         success: false,
         error: error instanceof Error ? error.message : "Unknown error",
       }),
       {
         status: 500,
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       }
     );
   }
 });