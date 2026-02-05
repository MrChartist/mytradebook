 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers":
     "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
 };
 
 const DHAN_API_URL = "https://api.dhan.co/v2";
 
 Deno.serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
   const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
   const supabase = createClient(supabaseUrl, supabaseServiceKey);
 
   try {
     const body = await req.json();
     const { action, user_id, client_id, access_token } = body;
 
     if (!action) {
       throw new Error("Action is required (verify, disconnect)");
     }
 
     if (action === "verify") {
       // Verify Dhan credentials by calling profile API
       if (!user_id) throw new Error("user_id is required");
       if (!client_id) throw new Error("client_id is required");
       if (!access_token) throw new Error("access_token is required");
 
       console.log(`Verifying Dhan credentials for user ${user_id}, client ${client_id}`);
 
       // Call Dhan profile API to verify token
       const response = await fetch(`${DHAN_API_URL}/profile`, {
         method: "GET",
         headers: {
           "Accept": "application/json",
           "Content-Type": "application/json",
           "access-token": access_token,
         },
       });
 
       console.log("Dhan profile API response status:", response.status);
 
       if (!response.ok) {
         const errorText = await response.text();
         console.error("Dhan profile API error:", errorText);
         return new Response(
           JSON.stringify({
             success: false,
             error: response.status === 401 
               ? "Invalid access token. Please check your credentials."
               : `Dhan API error: ${response.status}`,
           }),
           { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
         );
       }
 
       const profileData = await response.json();
       console.log("Dhan profile:", JSON.stringify(profileData).slice(0, 200));
 
       // Extract account name from profile
       const accountName = profileData?.data?.name || 
                           profileData?.name || 
                           `Dhan Account (${client_id})`;
 
       // Save credentials to user_settings
       const { error: updateError } = await supabase
         .from("user_settings")
         .update({
           dhan_client_id: client_id,
           dhan_access_token: access_token,
           dhan_verified_at: new Date().toISOString(),
           dhan_enabled: true,
           dhan_account_name: accountName,
         })
         .eq("user_id", user_id);
 
       if (updateError) throw updateError;
 
       return new Response(
         JSON.stringify({
           success: true,
           message: "Dhan connected successfully",
           account_name: accountName,
           profile: profileData?.data || profileData,
         }),
         { headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     if (action === "disconnect") {
       // Disconnect Dhan
       if (!user_id) throw new Error("user_id is required");
 
       const { error } = await supabase
         .from("user_settings")
         .update({
           dhan_access_token: null,
           dhan_verified_at: null,
           dhan_enabled: false,
           dhan_account_name: null,
           // Keep client_id for reference
         })
         .eq("user_id", user_id);
 
       if (error) throw error;
 
       return new Response(
         JSON.stringify({ success: true, message: "Dhan disconnected" }),
         { headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     throw new Error(`Unknown action: ${action}`);
   } catch (error) {
     console.error("Dhan verify error:", error);
     return new Response(
       JSON.stringify({
         success: false,
         error: error instanceof Error ? error.message : "Unknown error",
       }),
       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   }
 });