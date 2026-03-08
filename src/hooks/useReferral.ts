import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

function generateCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export function useReferral() {
  const { user } = useAuth();

  // Get or create referral code from profiles table
  const { data: referralCode } = useQuery({
    queryKey: ["referral-code", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      // Check existing code
      const { data: profile } = await supabase
        .from("profiles")
        .select("referral_code")
        .eq("user_id", user.id)
        .single();

      const existingCode = (profile as Record<string, unknown> | null)?.referral_code as string | null;
      if (existingCode) return existingCode;

      // Generate and save
      const code = generateCode();
      await supabase
        .from("profiles")
        .update({ referral_code: code } as Record<string, unknown>)
        .eq("user_id", user.id);
      return code;
    },
    enabled: !!user?.id,
  });

  const { data: referrals = [] } = useQuery({
    queryKey: ["referrals", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  const referralLink = referralCode
    ? `${window.location.origin}/login?ref=${referralCode}`
    : null;

  const totalReferred = referrals.length;
  const successfulReferrals = referrals.filter((r) => r.status === "completed").length;

  return {
    referralCode,
    referralLink,
    referrals,
    totalReferred,
    successfulReferrals,
  };
}
