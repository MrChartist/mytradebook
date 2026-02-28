 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers":
     "authorization, x-client-info, apikey, content-type",
 };
 
 Deno.serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
   const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
   
   // Get auth header from request
   const authHeader = req.headers.get("Authorization");
   const supabase = createClient(supabaseUrl, supabaseAnonKey, {
     global: {
       headers: authHeader ? { Authorization: authHeader } : {},
     },
   });
 
   try {
     const { query, exchange, instrument_type, limit = 50 } = await req.json();
 
     console.log("Search params:", { query, exchange, instrument_type, limit });
 
     let dbQuery = supabase
       .from("instrument_master")
       .select("*")
       .limit(Math.min(limit, 100));
 
     // Apply exchange filter
     if (exchange && exchange !== "ALL") {
       dbQuery = dbQuery.eq("exchange", exchange);
     }
 
     // Apply instrument type filter
     if (instrument_type && instrument_type !== "ALL") {
       dbQuery = dbQuery.eq("instrument_type", instrument_type);
     }
 
     // Apply text search if query provided
     if (query && query.trim()) {
       const searchTerm = query.trim().toUpperCase();
       // Use ILIKE for case-insensitive partial matching
       dbQuery = dbQuery.or(
         `trading_symbol.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%`
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
       { headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   } catch (error) {
     console.error("Instrument search failed:", error);
 
     return new Response(
       JSON.stringify({
         success: false,
         error: error instanceof Error ? error.message : "Unknown error",
         instruments: [],
       }),
       {
         status: 500,
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       }
     );
   }
 });