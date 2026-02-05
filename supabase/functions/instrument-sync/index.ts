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
     OPTCOM: "OPT",
     INDEX: "INDEX",
     COMMODITY: "COMMODITY",
   };
   return mapping[instrType] || instrType;
 }
 
// Generate comprehensive instrument list for NSE + NFO + MCX
function generateInstrumentMaster(): InstrumentRow[] {
  const instruments: InstrumentRow[] = [];
  
  // NSE Equity - Comprehensive list of ~500 stocks
  const NSE_STOCKS = [
    // Nifty 50
    "RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", "HINDUNILVR", "ITC", "SBIN", "BHARTIARTL", "KOTAKBANK",
    "LT", "AXISBANK", "ASIANPAINT", "MARUTI", "TITAN", "BAJFINANCE", "SUNPHARMA", "WIPRO", "HCLTECH", "NTPC",
    "TATAMOTORS", "ULTRACEMCO", "POWERGRID", "NESTLEIND", "ONGC", "ADANIENT", "ADANIPORTS", "JSWSTEEL", "COALINDIA", "BAJAJFINSV",
    "TATASTEEL", "HINDALCO", "DRREDDY", "GRASIM", "TECHM", "BPCL", "EICHERMOT", "DIVISLAB", "CIPLA", "BRITANNIA",
    "HEROMOTOCO", "M&M", "BAJAJ-AUTO", "INDUSINDBK", "TATACONSUM", "APOLLOHOSP", "SBILIFE", "HDFCLIFE", "LTIM", "UPL",
    // Nifty Next 50
    "ADANIGREEN", "AMBUJACEM", "AUROPHARMA", "BAJAJHLDNG", "BANKBARODA", "BEL", "BERGEPAINT", "BIOCON", "BOSCHLTD", "CANBK",
    "CHOLAFIN", "COLPAL", "CONCOR", "DABUR", "DLF", "DMART", "GAIL", "GODREJCP", "HAVELLS", "HINDZINC",
    "ICICIPRULI", "ICICIGI", "IDEA", "IDFCFIRSTB", "IGL", "INDIGO", "IOC", "IRCTC", "JINDALSTEL", "JSWENERGY",
    "LICI", "LUPIN", "MARICO", "MCDOWELL-N", "MPHASIS", "MUTHOOTFIN", "NAUKRI", "OBEROIRLTY", "OFSS", "PAGEIND",
    "PAYTM", "PGHH", "PIDILITIND", "PNB", "POLYCAB", "RECLTD", "SAIL", "SBICARD", "SHREECEM", "SHRIRAMFIN",
    "SIEMENS", "SRF", "TATAPOWER", "TORNTPHARM", "TRENT", "UNIONBANK", "VEDL", "VBL", "VOLTAS", "ZOMATO",
    // Nifty Midcap Select + Popular stocks
    "ABCAPITAL", "ACC", "AARTIIND", "ABB", "ABBOTINDIA", "AUBANK", "BALKRISIND", "BALRAMCHIN", "BANDHANBNK", "BATAINDIA",
    "BHARATFORG", "BHEL", "BLUEDART", "CANFINHOME", "CESC", "CGPOWER", "CHAMBLFERT", "CUMMINSIND", "DEEPAKNTR", "DIXON",
    "ESCORTS", "EXIDEIND", "FEDERALBNK", "FLUOROCHEM", "FORTIS", "GLENMARK", "GMRINFRA", "GODREJPROP", "GRANULES", "GSPL",
    "GUJGASLTD", "HAL", "HATSUN", "HINDCOPPER", "HINDPETRO", "HONAUT", "IPCALAB", "IRFC", "ISEC", "JKCEMENT",
    "JSL", "JUBLFOOD", "KAJARIACER", "KEI", "KPITTECH", "LAURUSLABS", "LICHSGFIN", "LTTS", "MANAPPURAM", "MAXHEALTH",
    "MCX", "METROPOLIS", "MFSL", "MGL", "MOTHERSON", "MRF", "NATIONALUM", "NAVINFLUOR", "NBCC", "NCC",
    "NHPC", "NMDC", "PATANJALI", "PERSISTENT", "PETRONET", "PIIND", "PFC", "PHOENIXLTD", "PRESTIGE", "PVRINOX",
    "RAMCOCEM", "RBLBANK", "RELAXO", "RVNL", "SOLARINDS", "SONACOMS", "STARHEALTH", "SUMICHEM", "SUNDARMFIN", "SUNTV",
    "SUPREMEIND", "SYNGENE", "TATACHEM", "TATACOMM", "TATAELXSI", "TATAINVEST", "TVSMOTOR", "THERMAX", "TIMKEN", "TIINDIA",
    "TORNTPOWER", "TTML", "UBL", "WHIRLPOOL", "ZEEL", "ZYDUSLIFE", "SJVN", "COCHINSHIP", "GRSE", "MAZAGONDOCK",
    // Additional popular stocks
    "APOLLOTYRE", "ASHOKLEY", "ASTRAL", "ATUL", "BASF", "BSE", "CDSL", "CLEAN", "COFORGE", "CROMPTON",
    "CYIENT", "DELHIVERY", "ECLERX", "ELGIEQUIP", "EMAMILTD", "ENDURANCE", "EQUITASBNK", "FSL", "GICRE", "GNFC",
    "GRAPHITE", "GRINDWELL", "HEG", "HFCL", "HOMEFIRST", "INDHOTEL", "INDUSTOWER", "INTELLECT", "IRB", "IRCON",
    "JAMNAAUTO", "JINDALSAW", "JKTYRE", "JSWINFRA", "KALPATPOWR", "KALYANKJIL", "KANSAINER", "KEC", "KFINTECH", "KIOCL",
    "KIRLOSENG", "LALPATHLAB", "LATENTVIEW", "LEMONTREE", "LINDEINDIA", "LODHA", "LTFOODS", "MAPMYINDIA", "MAZDOCK", "METROBRAND",
    "MMTC", "MOIL", "MOTILALOFS", "NATCOPHARM", "NETWORK18", "NLCINDIA", "OLECTRA", "ORIENTELEC", "PNBHOUSING", "POWERINDIA",
    "PTC", "RADICO", "RAIN", "RAYMOND", "REDINGTON", "RHIM", "ROSSARI", "ROUTE", "SAFARI", "SANOFI",
    "SCHAEFFLER", "SHOPERSTOP", "SKFINDIA", "SOBHA", "SONATSOFTW", "SPARC", "STAR", "SUNDRMFAST", "SUZLON", "SYMPHONY",
    "TANLA", "TATATECH", "TEAMLEASE", "TEJASNET", "THYROCARE", "TITAGARH", "TRIDENT", "TRIVENI", "UCOBANK", "UJJIVANSFB",
    "UTIAMC", "VGUARD", "VINATIORGA", "WOCKPHARMA", "YESBANK", "ZEEMEDIA", "ZENSARTECH", "HUDCO", "RAILTEL", "RITES",
    "NBCC", "IRCON", "EXIDEIND", "AMARARAJA", "BALKRISIND", "CEAT", "PAGEIND", "ARVIND", "ABFRL", "JUBLFOOD",
    "BATA", "MARICO", "DABUR", "COLPAL", "PGHH", "ATGL", "MGL", "PETRONET", "GSPL", "HPCL", "CASTROLIND",
    "PIIND", "BAYERCROP", "RALLIS", "DHANUKA", "GSFC", "FACT", "CHAMBAL", "COROMANDEL", "DEEPAKFERT", "FINEORG",
    "AARTIIND", "TATACHEM", "ALKYLAMINE", "ATUL", "SUDARSCHEM", "ANURAS", "BIOCON", "SYNGENE", "GLAND", "ALKEM",
    "TORNTPHARM", "LUPIN", "GLENMARK", "LAURUSLABS", "GRANULES", "ABBOTINDIA", "PFIZER", "GLAXO"
  ];
  
  // Remove duplicates
  const uniqueNseStocks = [...new Set(NSE_STOCKS)];
  
  // Add NSE Equity stocks
  uniqueNseStocks.forEach((symbol, idx) => {
    instruments.push({
      security_id: `NSE_EQ_${idx + 1}`,
      exchange_segment: "NSE_EQ",
      exchange: "NSE",
      instrument_type: "EQ",
      trading_symbol: symbol,
      display_name: symbol,
      underlying_symbol: null,
      expiry: null,
      strike: null,
      option_type: null,
      lot_size: 1,
      tick_size: 0.05,
    });
  });
  
  // Add Indices
  const INDICES = [
    { symbol: "NIFTY", name: "Nifty 50" },
    { symbol: "BANKNIFTY", name: "Bank Nifty" },
    { symbol: "FINNIFTY", name: "Fin Nifty" },
    { symbol: "MIDCPNIFTY", name: "Midcap Nifty" },
    { symbol: "NIFTYNXT50", name: "Nifty Next 50" },
  ];
  
  INDICES.forEach((idx, i) => {
    instruments.push({
      security_id: `IDX_${i + 1}`,
      exchange_segment: "IDX_I",
      exchange: "NSE",
      instrument_type: "INDEX",
      trading_symbol: idx.symbol,
      display_name: idx.name,
      underlying_symbol: null,
      expiry: null,
      strike: null,
      option_type: null,
      lot_size: 1,
      tick_size: 0.05,
    });
  });
  
  // NFO Underlyings (F&O eligible stocks)
  const NFO_STOCKS = [
    "RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", "SBIN", "BHARTIARTL", "KOTAKBANK", "LT", "AXISBANK",
    "ASIANPAINT", "MARUTI", "TITAN", "BAJFINANCE", "SUNPHARMA", "WIPRO", "HCLTECH", "NTPC", "TATAMOTORS", "ULTRACEMCO",
    "POWERGRID", "ONGC", "ADANIENT", "JSWSTEEL", "COALINDIA", "TATASTEEL", "HINDALCO", "DRREDDY", "TECHM", "BPCL",
    "EICHERMOT", "DIVISLAB", "CIPLA", "BRITANNIA", "HEROMOTOCO", "M&M", "BAJAJ-AUTO", "INDUSINDBK", "TATACONSUM", "APOLLOHOSP",
    "SBILIFE", "HDFCLIFE", "RECLTD", "PFC", "IRFC", "NHPC", "SJVN", "BEL", "HAL", "BHEL", "GAIL", "IOC",
    "VEDL", "SAIL", "NMDC", "BANKBARODA", "CANBK", "PNB", "IDEA", "ZEEL", "TATAPOWER", "TATAELXSI", "PERSISTENT",
    "COFORGE", "MPHASIS", "NAUKRI", "ZOMATO", "IRCTC", "RVNL", "DLF", "GODREJPROP", "OBEROIRLTY", "POLYCAB",
    "HAVELLS", "SIEMENS", "ABB", "CGPOWER", "DIXON", "ESCORTS", "MOTHERSON", "BALKRISIND", "MRF", "APOLLOTYRE",
    "TVSMOTOR", "JUBLFOOD", "MARICO", "DABUR", "COLPAL", "BERGEPAINT", "INDIGO", "GMRINFRA", "ADANIGREEN", "MGL",
    "IGL", "PETRONET", "PIIND", "GNFC", "DEEPAKNTR", "SRF", "AARTIIND", "TATACHEM", "AUROPHARMA", "BIOCON",
    "LUPIN", "IPCALAB", "ALKEM", "TORNTPHARM", "LAURUSLABS", "GRANULES", "CHOLAFIN", "MUTHOOTFIN", "LICHSGFIN", "MANAPPURAM",
    "FEDERALBNK", "AUBANK", "IDFCFIRSTB", "RBLBANK", "BANDHANBNK", "SHRIRAMFIN", "VOLTAS", "CROMPTON", "WHIRLPOOL", "TRENT"
  ];
  
  const uniqueNfoStocks = [...new Set(NFO_STOCKS)];
  
  // Add NFO equity underlyings
  uniqueNfoStocks.forEach((symbol, idx) => {
    instruments.push({
      security_id: `NFO_UND_${idx + 1}`,
      exchange_segment: "NSE_FNO",
      exchange: "NFO",
      instrument_type: "EQ",
      trading_symbol: symbol,
      display_name: `${symbol} (F&O)`,
      underlying_symbol: symbol,
      expiry: null,
      strike: null,
      option_type: null,
      lot_size: null,
      tick_size: 0.05,
    });
  });
  
  // Add Index underlyings for NFO
  INDICES.forEach((idx, i) => {
    instruments.push({
      security_id: `NFO_IDX_${i + 1}`,
      exchange_segment: "NSE_FNO",
      exchange: "NFO",
      instrument_type: "INDEX",
      trading_symbol: idx.symbol,
      display_name: `${idx.name} (F&O)`,
      underlying_symbol: idx.symbol,
      expiry: null,
      strike: null,
      option_type: null,
      lot_size: idx.symbol === "BANKNIFTY" ? 15 : idx.symbol === "NIFTY" ? 25 : 25,
      tick_size: 0.05,
    });
  });
  
  // MCX Commodities
  const MCX_COMMODITIES = [
    { symbol: "GOLD", name: "Gold", lotSize: 100 },
    { symbol: "GOLDM", name: "Gold Mini", lotSize: 10 },
    { symbol: "GOLDPETAL", name: "Gold Petal", lotSize: 1 },
    { symbol: "SILVER", name: "Silver", lotSize: 30 },
    { symbol: "SILVERM", name: "Silver Mini", lotSize: 5 },
    { symbol: "SILVERMIC", name: "Silver Micro", lotSize: 1 },
    { symbol: "CRUDEOIL", name: "Crude Oil", lotSize: 100 },
    { symbol: "CRUDEOILM", name: "Crude Oil Mini", lotSize: 10 },
    { symbol: "NATURALGAS", name: "Natural Gas", lotSize: 1250 },
    { symbol: "COPPER", name: "Copper", lotSize: 2500 },
    { symbol: "ZINC", name: "Zinc", lotSize: 5000 },
    { symbol: "ALUMINIUM", name: "Aluminium", lotSize: 5000 },
    { symbol: "LEAD", name: "Lead", lotSize: 5000 },
    { symbol: "NICKEL", name: "Nickel", lotSize: 1500 },
    { symbol: "MENTHAOIL", name: "Mentha Oil", lotSize: 360 },
    { symbol: "COTTON", name: "Cotton", lotSize: 25 },
  ];
  
  MCX_COMMODITIES.forEach((comm, idx) => {
    instruments.push({
      security_id: `MCX_${idx + 1}`,
      exchange_segment: "MCX_COMM",
      exchange: "MCX",
      instrument_type: "COMMODITY",
      trading_symbol: comm.symbol,
      display_name: comm.name,
      underlying_symbol: comm.symbol,
      expiry: null,
      strike: null,
      option_type: null,
      lot_size: comm.lotSize,
      tick_size: 1,
    });
  });
  
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
     console.log("Starting instrument sync...");
     
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
     
    // Generate comprehensive instrument list
    const instruments = generateInstrumentMaster();
     console.log(`Parsed ${instruments.length} instruments from CSV`);
     
     // Batch upsert in chunks of 500
     const BATCH_SIZE = 500;
     let inserted = 0;
     let updated = 0;
     
    for (let i = 0; i < instruments.length; i += BATCH_SIZE) {
      const batch = instruments.slice(i, i + BATCH_SIZE);
       
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
       } else {
         inserted += batch.length;
       }
       
       // Small delay to avoid overwhelming the DB
       await new Promise((resolve) => setTimeout(resolve, 100));
     }
     
     // Update sync log
     if (logId) {
       await supabase
         .from("instrument_sync_log")
         .update({
           status: "completed",
           completed_at: new Date().toISOString(),
           total_rows: instruments.length,
           inserted_rows: inserted,
         })
         .eq("id", logId);
     }
     
     console.log(`Sync completed: ${inserted} instruments upserted`);
     
     return new Response(
       JSON.stringify({
         success: true,
         message: `Synced ${inserted} instruments`,
         total_parsed: instruments.length,
         inserted: inserted,
       }),
       { headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   } catch (error) {
     console.error("Instrument sync failed:", error);
     
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