 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers":
     "authorization, x-client-info, apikey, content-type",
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
 
 // Dhan scrip master CSV URLs
 const DHAN_CSV_URLS = {
   NSE_EQ: "https://images.dhan.co/api-data/api-scrip-master-equity.csv",
   NSE_FNO: "https://images.dhan.co/api-data/api-scrip-master-detailed.csv",
 };
 
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
 
 // Fetch and parse Dhan equity CSV
 async function fetchEquityCSV(): Promise<InstrumentRow[]> {
   const instruments: InstrumentRow[] = [];
   
   console.log("Fetching NSE equity CSV from Dhan...");
   const response = await fetch(DHAN_CSV_URLS.NSE_EQ);
   
   if (!response.ok) {
     throw new Error(`Failed to fetch equity CSV: ${response.status}`);
   }
   
   const csvText = await response.text();
   const lines = csvText.split("\n").filter((line) => line.trim());
   
   if (lines.length < 2) {
     throw new Error("Equity CSV appears empty");
   }
   
   // Parse header
   const header = parseCSVLine(lines[0]);
   const colIndex: Record<string, number> = {};
   header.forEach((col, idx) => {
     colIndex[col.toUpperCase().replace(/[^A-Z0-9_]/g, "_")] = idx;
   });
   
   console.log("Equity CSV columns:", Object.keys(colIndex).slice(0, 15));
   
   // Dhan equity CSV columns (typical):
   // SEM_EXM_EXCH_ID, SEM_SEGMENT, SEM_SMST_SECURITY_ID, SEM_INSTRUMENT_NAME, 
   // SEM_EXPIRY_CODE, SEM_EXPIRY_DATE, SEM_STRIKE_PRICE, SEM_OPTION_TYPE,
   // SEM_TRADING_SYMBOL, SEM_CUSTOM_SYMBOL, SEM_LOT_UNITS, SEM_TICK_SIZE
   
   for (let i = 1; i < lines.length; i++) {
     try {
       const row = parseCSVLine(lines[i]);
       if (row.length < 5) continue;
       
       // Get security ID - the key identifier for Dhan API
       const securityId = row[colIndex["SEM_SMST_SECURITY_ID"]] || row[2];
       if (!securityId || securityId === "0") continue;
       
       // Get segment - filter for NSE_EQ only
       const segment = row[colIndex["SEM_SEGMENT"]] || row[1];
       if (segment !== "E") continue; // E = Equity segment
       
       // Get exchange
       const exchangeCode = row[colIndex["SEM_EXM_EXCH_ID"]] || row[0];
       if (exchangeCode !== "NSE") continue; // Only NSE for now
       
       const tradingSymbol = row[colIndex["SEM_TRADING_SYMBOL"]] || row[8] || "";
       const customSymbol = row[colIndex["SEM_CUSTOM_SYMBOL"]] || row[9] || tradingSymbol;
       const instrumentName = row[colIndex["SEM_INSTRUMENT_NAME"]] || row[3] || "EQUITY";
       const lotSize = parseInt(row[colIndex["SEM_LOT_UNITS"]] || row[10]) || 1;
       const tickSize = parseFloat(row[colIndex["SEM_TICK_SIZE"]] || row[11]) || 0.05;
       
       if (!tradingSymbol) continue;
       
       instruments.push({
         security_id: securityId,
         exchange_segment: "NSE_EQ",
         exchange: "NSE",
         instrument_type: mapInstrumentType(instrumentName),
         trading_symbol: tradingSymbol.replace(/-EQ$/, ""),
         display_name: customSymbol || tradingSymbol,
         underlying_symbol: null,
         expiry: null,
         strike: null,
         option_type: null,
         lot_size: lotSize,
         tick_size: tickSize,
       });
     } catch (e) {
       console.warn(`Row ${i} parse error:`, e);
     }
   }
   
   console.log(`Parsed ${instruments.length} NSE equity instruments`);
   return instruments;
 }
 
 // Fetch and parse Dhan F&O detailed CSV
 async function fetchFNOCSV(): Promise<InstrumentRow[]> {
   const instruments: InstrumentRow[] = [];
   
   console.log("Fetching F&O CSV from Dhan...");
   const response = await fetch(DHAN_CSV_URLS.NSE_FNO);
   
   if (!response.ok) {
     throw new Error(`Failed to fetch FNO CSV: ${response.status}`);
   }
   
   const csvText = await response.text();
   const lines = csvText.split("\n").filter((line) => line.trim());
   
   if (lines.length < 2) {
     throw new Error("FNO CSV appears empty");
   }
   
   // Parse header
   const header = parseCSVLine(lines[0]);
   const colIndex: Record<string, number> = {};
   header.forEach((col, idx) => {
     colIndex[col.toUpperCase().replace(/[^A-Z0-9_]/g, "_")] = idx;
   });
   
   console.log("F&O CSV columns:", Object.keys(colIndex).slice(0, 15));
   
   // Track current date for filtering expired contracts
   const today = new Date();
   today.setHours(0, 0, 0, 0);
   
   for (let i = 1; i < lines.length; i++) {
     try {
       const row = parseCSVLine(lines[i]);
       if (row.length < 5) continue;
       
       const securityId = row[colIndex["SEM_SMST_SECURITY_ID"]] || row[2];
       if (!securityId || securityId === "0") continue;
       
       const segment = row[colIndex["SEM_SEGMENT"]] || row[1];
       const exchangeCode = row[colIndex["SEM_EXM_EXCH_ID"]] || row[0];
       
       // Filter for NSE F&O and MCX
       let exchangeSegment = "";
       let exchange = "";
       
       if (exchangeCode === "NSE" && (segment === "D" || segment === "E")) {
         // D = Derivatives, E = Equity (for indices)
         exchangeSegment = "NSE_FNO";
         exchange = "NFO";
       } else if (exchangeCode === "MCX") {
         exchangeSegment = "MCX_COMM";
         exchange = "MCX";
       } else if (exchangeCode === "NSE" && segment === "I") {
         // I = Index
         exchangeSegment = "IDX_I";
         exchange = "NSE";
       } else {
         continue; // Skip other segments
       }
       
       const tradingSymbol = row[colIndex["SEM_TRADING_SYMBOL"]] || row[8] || "";
       const customSymbol = row[colIndex["SEM_CUSTOM_SYMBOL"]] || row[9] || tradingSymbol;
       const instrumentName = row[colIndex["SEM_INSTRUMENT_NAME"]] || row[3] || "";
       const expiryStr = row[colIndex["SEM_EXPIRY_DATE"]] || row[5] || "";
       const strikeStr = row[colIndex["SEM_STRIKE_PRICE"]] || row[6] || "";
       const optionType = row[colIndex["SEM_OPTION_TYPE"]] || row[7] || "";
       const lotSize = parseInt(row[colIndex["SEM_LOT_UNITS"]] || row[10]) || 1;
       const tickSize = parseFloat(row[colIndex["SEM_TICK_SIZE"]] || row[11]) || 0.05;
       const underlyingSymbol = row[colIndex["SM_SYMBOL_NAME"]] || customSymbol?.split(" ")[0] || tradingSymbol;
       
       if (!tradingSymbol) continue;
       
       // Parse expiry date and filter expired contracts
       let expiry: string | null = null;
       if (expiryStr && expiryStr !== "0" && expiryStr !== "") {
         try {
          // Dhan uses various formats: "2026-02-27", "27-Feb-2026", or timestamp
          let expiryDate: Date | null = null;
          
          // Check if it's a pure number (likely wrong data, skip)
          if (/^\d+$/.test(expiryStr) && expiryStr.length > 10) {
            // Skip extremely large numbers that are likely garbage
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
            // Sanity check: year should be reasonable (2020-2100)
            if (year >= 2020 && year <= 2100) {
              // Skip expired contracts
              if (expiryDate < today) continue;
              expiry = expiryDate.toISOString().split("T")[0];
            }
           }
         } catch {
           // Keep null if parse fails
         }
       }
       
       const strike = strikeStr && strikeStr !== "0" ? parseFloat(strikeStr) : null;
       
       instruments.push({
         security_id: securityId,
         exchange_segment: exchangeSegment,
         exchange: exchange,
         instrument_type: mapInstrumentType(instrumentName),
         trading_symbol: tradingSymbol,
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
   
   console.log(`Parsed ${instruments.length} F&O instruments`);
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
     
    // Fetch instruments from Dhan CSVs in parallel
    const [equityInstruments, fnoInstruments] = await Promise.all([
      fetchEquityCSV().catch((e) => {
        console.error("Equity CSV fetch failed:", e);
        return [] as InstrumentRow[];
      }),
      fetchFNOCSV().catch((e) => {
        console.error("F&O CSV fetch failed:", e);
        return [] as InstrumentRow[];
      }),
    ]);
    
    const allInstruments = [...equityInstruments, ...fnoInstruments];
    console.log(`Total instruments fetched: ${allInstruments.length}`);
    
    if (allInstruments.length === 0) {
      throw new Error("No instruments fetched from Dhan CSVs");
    }
     
     // Batch upsert in chunks of 500
     const BATCH_SIZE = 500;
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
         console.error(`Batch upsert error at ${i}:`, upsertError);
        errors++;
       } else {
         inserted += batch.length;
       }
     }
     
    const duration = Date.now() - startTime;
    console.log(`Sync completed in ${duration}ms: ${inserted} instruments upserted, ${errors} batch errors`);
    
     // Update sync log
     if (logId) {
       await supabase
         .from("instrument_sync_log")
         .update({
           status: "completed",
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
        equity_count: equityInstruments.length,
        fno_count: fnoInstruments.length,
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