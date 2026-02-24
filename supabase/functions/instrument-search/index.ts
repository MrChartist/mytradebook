import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateUserAuth } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Content-Type": "application/json",
};

const VALID_EXCHANGES = ["ALL", "NSE", "BSE", "NFO", "MCX"];
const VALID_INSTRUMENT_TYPES = ["ALL", "EQ", "FUT", "OPT", "INDEX", "COMMODITY"];
const MAX_QUERY_LENGTH = 100;
const MAX_LIMIT = 100;
const MIN_LIMIT = 1;
const DEFAULT_LIMIT = 50;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate user JWT
  const { userId, error: authError } = await validateUserAuth(req);
  if (authError) return authError;

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const authHeader = req.headers.get("Authorization")!;
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: authHeader },
    },
  });

  try {
    const body = await req.json();

    // Input validation
    const query = typeof body.query === "string" ? body.query.trim().slice(0, MAX_QUERY_LENGTH) : "";
    const exchange = typeof body.exchange === "string" && VALID_EXCHANGES.includes(body.exchange)
      ? body.exchange
      : "ALL";
    const instrument_type = typeof body.instrument_type === "string" && VALID_INSTRUMENT_TYPES.includes(body.instrument_type)
      ? body.instrument_type
      : "ALL";
    const rawLimit = typeof body.limit === "number" ? body.limit : DEFAULT_LIMIT;
    const limit = Math.max(MIN_LIMIT, Math.min(MAX_LIMIT, Math.floor(rawLimit)));

    console.log("Search params:", { query, exchange, instrument_type, limit, userId });

    let dbQuery = supabase
      .from("instrument_master")
      .select("*")
      .limit(limit);

    // Apply exchange filter
    if (exchange !== "ALL") {
      dbQuery = dbQuery.eq("exchange", exchange);
    }

    // Apply instrument type filter
    if (instrument_type !== "ALL") {
      dbQuery = dbQuery.eq("instrument_type", instrument_type);
    }

    // Apply text search if query provided - sanitize for ILIKE
    if (query) {
      // Escape ILIKE special characters to prevent pattern injection
      const sanitized = query.toUpperCase().replace(/[%_\\]/g, "\\$&");
      dbQuery = dbQuery.or(
        `trading_symbol.ilike.%${sanitized}%,display_name.ilike.%${sanitized}%`
      );
    }

    // Order by trading symbol for consistency
    dbQuery = dbQuery.order("trading_symbol", { ascending: true });

    const { data, error } = await dbQuery;

    if (error) {
      console.error("Search query error:", error);
      throw error;
    }

    console.log(`Found ${data?.length || 0} instruments`);

    return new Response(
      JSON.stringify({
        success: true,
        instruments: data || [],
        count: data?.length || 0,
      }),
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Instrument search failed:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Search failed",
        instruments: [],
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});
