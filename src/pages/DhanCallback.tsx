import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DhanCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Connecting to Dhan...");

  useEffect(() => {
    const tokenId = searchParams.get("tokenId");
    const consentId = searchParams.get("consentId") || localStorage.getItem("dhan_consent_id");

    if (!tokenId) {
      setStatus("error");
      setMessage("Missing tokenId. Please try again from Settings.");
      return;
    }

    if (!consentId) {
      setStatus("error");
      setMessage("Missing consentId. Please try again from Settings.");
      return;
    }

    const exchangeToken = async () => {
      try {
        // Step 1: Resolve user_id from consent_id via backend
        const { data: resolveData, error: resolveError } = await supabase.functions.invoke("dhan-auth", {
          body: {
            action: "resolve-consent",
            consent_id: consentId,
          },
        });

        if (resolveError) throw resolveError;
        if (!resolveData?.success || !resolveData?.user_id) {
          throw new Error(resolveData?.error || "Could not identify user from consent. Please reconnect from Settings.");
        }

        const userId = resolveData.user_id;

        // Step 2: Exchange token using resolved user_id
        const { data, error } = await supabase.functions.invoke("dhan-auth", {
          body: {
            action: "exchange-token",
            user_id: userId,
            consent_id: consentId,
            token_id: tokenId,
          },
        });

        if (error) throw error;

        if (data?.success) {
          setStatus("success");
          setMessage(`Connected as ${data.account_name}!`);
          localStorage.removeItem("dhan_consent_id");
          setTimeout(() => navigate("/settings"), 2000);
        } else {
          throw new Error(data?.error || "Token exchange failed");
        }
      } catch (err) {
        console.error("Dhan callback error:", err);
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Failed to connect. Please try again.");
      }
    };

    exchangeToken();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <h2 className="text-xl font-semibold">Connecting to Dhan...</h2>
            <p className="text-muted-foreground">Please wait while we complete the authorization.</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-12 h-12 text-profit mx-auto" />
            <h2 className="text-xl font-semibold text-profit">{message}</h2>
            <p className="text-muted-foreground">Redirecting to Settings...</p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-12 h-12 text-loss mx-auto" />
            <h2 className="text-xl font-semibold text-loss">Connection Failed</h2>
            <p className="text-muted-foreground">{message}</p>
            <Button onClick={() => navigate("/settings")} variant="outline">
              Back to Settings
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
