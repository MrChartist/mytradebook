import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Content-Type": "application/json",
};

/**
 * Validate JWT from Authorization header and return user ID.
 * Returns { userId, error }. If error is set, return it as-is.
 */
export async function validateUserAuth(req: Request): Promise<{
  userId: string | null;
  error: Response | null;
}> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      userId: null,
      error: new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: corsHeaders }
      ),
    };
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await supabase.auth.getClaims(token);

  if (error || !data?.claims) {
    return {
      userId: null,
      error: new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: corsHeaders }
      ),
    };
  }

  return { userId: data.claims.sub as string, error: null };
}

/**
 * Validate that a cron/system call has a valid Authorization header.
 * Cron jobs via pg_net send the anon key as Bearer token.
 */
export function validateCronAuth(req: Request): Response | null {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: corsHeaders }
    );
  }
  // Accept any valid Bearer token (anon key from pg_net cron, or service role)
  // The key validation is that the header exists and is properly formatted
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token || token.length < 10) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: corsHeaders }
    );
  }
  return null; // authorized
}
