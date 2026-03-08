import { useState, useEffect, useCallback } from "react";
import { PlanGate } from "@/components/PlanGate";
import { 
  Loader2, Send, RefreshCw, CheckCircle, 
  Smartphone, Database, Clock, AlertTriangle, 
  MessageCircle, Unplug, Key, Eye, EyeOff, Shield,
  Sparkles, Trash2
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useUserSettings } from "@/hooks/useUserSettings";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import TelegramSettings from "@/components/settings/TelegramSettings";
import { cn } from "@/lib/utils";

export default function IntegrationsSettings() {
  const { user } = useAuth();
  const { settings, isLoading, updateSettings } = useUserSettings();
  
  // Telegram state
  const [telegramChatId, setTelegramChatId] = useState("");
  const [savingTelegram, setSavingTelegram] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [disconnectingTelegram, setDisconnectingTelegram] = useState(false);
  
  // Dhan state
  const [dhanClientId, setDhanClientId] = useState("");
  const [dhanAccessToken, setDhanAccessToken] = useState("");
  const [showDhanToken, setShowDhanToken] = useState(false);
  const [verifyingDhan, setVerifyingDhan] = useState(false);
  const [disconnectingDhan, setDisconnectingDhan] = useState(false);
  const [dhanAuthMode, setDhanAuthMode] = useState<"token" | "apikey">("apikey");
  
  // API Key mode state
  const [dhanApiKey, setDhanApiKey] = useState("");
  const [dhanApiSecret, setDhanApiSecret] = useState("");
  const [showApiSecret, setShowApiSecret] = useState(false);
  const [connectingApiKey, setConnectingApiKey] = useState(false);
  
  // Dhan sync state
  const [syncingOrders, setSyncingOrders] = useState(false);

  // AI Provider state
  const [aiProvider, setAiProvider] = useState<"gemini" | "openai">("gemini");
  const [aiApiKey, setAiApiKey] = useState("");
  const [showAiKey, setShowAiKey] = useState(false);
  const [savingAi, setSavingAi] = useState(false);

  // Instrument Master state
  const [syncingInstruments, setSyncingInstruments] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    lastSync: string | null;
    nseEqCount: number;
    nfoCount: number;
    mcxCount: number;
    status: string | null;
    errorMessage: string | null;
  }>({ lastSync: null, nseEqCount: 0, nfoCount: 0, mcxCount: 0, status: null, errorMessage: null });

  useEffect(() => {
    if (settings) {
      setDhanClientId(settings.dhan_client_id || "");
      if (settings.ai_provider) setAiProvider(settings.ai_provider as "gemini" | "openai");
    }
  }, [settings]);
  
  // Fetch instrument sync status
  const fetchSyncStatus = useCallback(async () => {
    const { data: logs } = await supabase
      .from("instrument_sync_log")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(1);
    
    if (logs && logs.length > 0) {
      const latest = logs[0];
      setSyncStatus((prev) => ({
        ...prev,
        lastSync: latest.completed_at || latest.started_at,
        status: latest.status,
        errorMessage: latest.error_message,
      }));
    }
    
    // Get counts by segment
    const segments = ["NSE_EQ", "NSE_FNO", "MCX_COMM"];
    for (const seg of segments) {
      const { count } = await supabase
        .from("instrument_master")
        .select("*", { count: "exact", head: true })
        .eq("exchange_segment", seg);
      
      if (count !== null) {
        setSyncStatus((prev) => ({
          ...prev,
          ...(seg === "NSE_EQ" && { nseEqCount: count }),
          ...(seg === "NSE_FNO" && { nfoCount: count }),
          ...(seg === "MCX_COMM" && { mcxCount: count }),
        }));
      }
    }
  }, []);

  useEffect(() => {
    fetchSyncStatus();
  }, [fetchSyncStatus]);

  // === TELEGRAM HANDLERS ===
  const handleSaveTelegram = async () => {
    if (!user?.id || !telegramChatId.trim()) {
      toast.error("Please enter your Telegram Chat ID");
      return;
    }
    setSavingTelegram(true);
    try {
      // Test the connection first
      const { data, error } = await supabase.functions.invoke("telegram-notify", {
        body: {
          type: "custom",
          message: "✅ Connected! You'll now receive trade alerts here.",
          chat_id: telegramChatId.trim(),
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Could not send message to this Chat ID");

      // Save to user settings
      const { error: updateError } = await supabase
        .from("user_settings")
        .update({
          telegram_chat_id: telegramChatId.trim(),
          telegram_verified_at: new Date().toISOString(),
          telegram_enabled: true,
        })
        .eq("user_id", user.id);
      if (updateError) throw updateError;

      toast.success("Telegram connected successfully!");
      // Realtime subscription will auto-refresh settings
    } catch (e) {
      console.error("Telegram save error:", e);
      toast.error(e instanceof Error ? e.message : "Failed to connect. Check your Chat ID.");
    } finally {
      setSavingTelegram(false);
    }
  };

  // === DHAN HANDLERS ===
  const handleVerifyDhan = async () => {
    if (!user?.id || !dhanClientId || !dhanAccessToken) {
      toast.error("Please enter both Client ID and Access Token");
      return;
    }
    
    setVerifyingDhan(true);
    try {
      const { data, error } = await supabase.functions.invoke("dhan-verify", {
        body: {
          action: "verify",
          user_id: user.id,
          client_id: dhanClientId,
          access_token: dhanAccessToken,
        },
      });
      
      if (error) throw error;
      if (data?.success) {
        toast.success(`Connected as ${data.account_name}`);
        setDhanAccessToken(""); // Clear token from UI
        // Realtime subscription will auto-refresh settings
      } else {
        toast.error(data?.error || "Verification failed");
      }
    } catch (e) {
      console.error("Dhan verify error:", e);
      toast.error(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setVerifyingDhan(false);
    }
  };

  const handleConnectApiKey = async () => {
    if (!user?.id || !dhanApiKey || !dhanApiSecret) {
      toast.error("Please enter both API Key and API Secret");
      return;
    }
    
    setConnectingApiKey(true);
    try {
      const redirectUrl = `${window.location.origin}/dhan-callback`;
      
      const { data, error } = await supabase.functions.invoke("dhan-auth", {
        body: {
          action: "generate-consent",
          user_id: user.id,
          api_key: dhanApiKey,
          api_secret: dhanApiSecret,
          client_id: dhanClientId || "",
          redirect_url: redirectUrl,
        },
      });
      
      if (error) throw error;
      
      if (data?.success && data?.auth_url) {
        // Store consent ID for callback
        localStorage.setItem("dhan_consent_id", data.consent_id);
        // Open Dhan authorization in a new tab (iframe can't redirect to external sites)
        window.open(data.auth_url, "_blank");
        toast.info("Dhan authorization opened in a new tab. Complete it there and you'll be redirected back.");
      } else {
        toast.error(data?.error || "Failed to initiate Dhan authorization");
      }
    } catch (e) {
      console.error("Dhan API Key error:", e);
      toast.error(e instanceof Error ? e.message : "Connection failed");
    } finally {
      setConnectingApiKey(false);
    }
  };

  const handleDisconnectDhan = async () => {
    if (!user?.id) return;
    setDisconnectingDhan(true);
    try {
      const { data, error } = await supabase.functions.invoke("dhan-verify", {
        body: { action: "disconnect", user_id: user.id },
      });
      
      if (error) throw error;
      if (data?.success) {
        toast.success("Dhan disconnected");
        // Realtime subscription will auto-refresh settings
      }
    } catch (e) {
      toast.error("Failed to disconnect");
    } finally {
      setDisconnectingDhan(false);
    }
  };

  // === INSTRUMENT SYNC HANDLERS ===
  const handleInstrumentSync = async () => {
    setSyncingInstruments(true);
    setSyncStatus((prev) => ({ ...prev, status: "running", errorMessage: null }));
    
    try {
      const { data, error } = await supabase.functions.invoke("instrument-sync");
      
      if (error) {
        console.error("Instrument sync error:", error);
        toast.error("Sync failed: " + error.message);
        setSyncStatus((prev) => ({ ...prev, status: "failed", errorMessage: error.message }));
        return;
      }
      
      if (data?.success) {
        toast.success(`Synced ${data.inserted} instruments (${data.duration_ms}ms)`);
        // Refresh counts
        await fetchSyncStatus();
      } else {
        toast.error("Sync failed: " + (data?.error || "Unknown error"));
        setSyncStatus((prev) => ({ ...prev, status: "failed", errorMessage: data?.error }));
      }
    } catch (e) {
      console.error("Instrument sync error:", e);
      toast.error("Sync failed");
      setSyncStatus((prev) => ({ ...prev, status: "failed", errorMessage: String(e) }));
    } finally {
      setSyncingInstruments(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="premium-card-hover p-5 flex items-center justify-center min-h-[200px]">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground/30" />
        </div>
      </div>
    );
  }

  const isTelegramConnected = !!settings?.telegram_chat_id && !!settings?.telegram_verified_at;
  const isDhanConnected = !!settings?.dhan_verified_at && !!settings?.dhan_enabled;
  const totalInstruments = syncStatus.nseEqCount + syncStatus.nfoCount + syncStatus.mcxCount;
  const isAiConnected = !!settings?.ai_provider;

  const handleSaveAi = async () => {
    if (!aiApiKey.trim()) {
      toast.error("Please enter your API key");
      return;
    }
    // Basic format validation
    if (aiProvider === "gemini" && aiApiKey.length < 20) {
      toast.error("Invalid Gemini API key format");
      return;
    }
    if (aiProvider === "openai" && !aiApiKey.startsWith("sk-")) {
      toast.error("OpenAI keys start with 'sk-'");
      return;
    }
    setSavingAi(true);
    try {
      await updateSettings.mutateAsync({ ai_provider: aiProvider, ai_api_key: aiApiKey.trim() } as any);
      setAiApiKey("");
      toast.success(`${aiProvider === "gemini" ? "Gemini" : "OpenAI"} connected successfully!`);
    } catch {
      // error handled by hook
    } finally {
      setSavingAi(false);
    }
  };

  const handleDisconnectAi = async () => {
    setSavingAi(true);
    try {
      await updateSettings.mutateAsync({ ai_provider: null, ai_api_key: null } as any);
      toast.success("AI provider disconnected");
    } catch {
      // error handled by hook
    } finally {
      setSavingAi(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* AI Provider Integration */}
      <div className="premium-card-hover p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="icon-badge-sm bg-primary/8">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-[15px] font-semibold">AI Trade Insights</h3>
            <p className="text-[11px] text-muted-foreground/50">Connect Gemini or OpenAI for AI-powered analysis</p>
          </div>
          {isAiConnected && (
            <div className="flex items-center gap-1.5 text-profit">
              <CheckCircle className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium">{settings?.ai_provider === "gemini" ? "Gemini" : "OpenAI"}</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {isAiConnected ? (
            <>
              <div className="p-2.5 rounded-lg bg-profit/6 border border-profit/15">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-profit" />
                    <span className="text-[12px] font-medium">
                      {settings?.ai_provider === "gemini" ? "Google Gemini" : "OpenAI"} connected
                    </span>
                  </div>
                  <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-muted/40 text-muted-foreground/50">BYOK</span>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleDisconnectAi}
                disabled={savingAi}
                className="text-loss hover:text-loss h-8 text-[11px] rounded-lg border-border/20"
              >
              {savingAi ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 mr-1.5" />}
                Disconnect
              </Button>
            </>
          ) : (
            <>
              {/* Provider tabs */}
              <div className="flex gap-0.5 p-0.5 rounded-lg bg-muted/40 border border-border/15">
                <button
                  type="button"
                  onClick={() => setAiProvider("gemini")}
                  className={cn(
                    "flex-1 py-1.5 px-3 text-[12px] font-medium rounded-md transition-all duration-200",
                    aiProvider === "gemini"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground/50 hover:text-foreground"
                  )}
                >
                  Google Gemini
                </button>
                <button
                  type="button"
                  onClick={() => setAiProvider("openai")}
                  className={cn(
                    "flex-1 py-1.5 px-3 text-[12px] font-medium rounded-md transition-all duration-200",
                    aiProvider === "openai"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground/50 hover:text-foreground"
                  )}
                >
                  OpenAI
                </button>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ai-api-key" className="text-[11px] text-muted-foreground/60 font-medium uppercase tracking-wider">
                  {aiProvider === "gemini" ? "Gemini API Key" : "OpenAI API Key"}
                </Label>
                <div className="relative">
                  <Input
                    id="ai-api-key"
                    type={showAiKey ? "text" : "password"}
                    value={aiApiKey}
                    onChange={(e) => setAiApiKey(e.target.value)}
                    className="bg-muted/20 border-border/20 pr-10 h-9 text-[13px] font-mono focus:border-primary/30"
                    placeholder={aiProvider === "gemini" ? "AIza..." : "sk-..."}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowAiKey(!showAiKey)}
                  >
                    {showAiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground/40">
                  Get your key from{" "}
                  {aiProvider === "gemini" ? (
                    <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      aistudio.google.com/apikey
                    </a>
                  ) : (
                    <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      platform.openai.com/api-keys
                    </a>
                  )}
                </p>
              </div>

              <Button onClick={handleSaveAi} disabled={savingAi || !aiApiKey.trim()} className="w-full h-9 text-[13px] rounded-lg">
                {savingAi ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Key className="w-3.5 h-3.5 mr-1.5" />}
                Save & Connect
              </Button>

              <p className="text-[10px] text-muted-foreground/30 text-center">
                Your key is stored securely and only used server-side.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Telegram Integration — Multi-chat system */}
      <PlanGate plan="pro" feature="telegramNotifications" message="Upgrade to Pro to enable Telegram notifications.">
        <TelegramSettings />
      </PlanGate>

      {/* Dhan API Integration */}
      <PlanGate plan="pro" feature="brokerIntegration" message="Upgrade to Pro to connect your Dhan broker account.">
      <div className="premium-card-hover p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="icon-badge-sm bg-[hsl(210_80%_55%)]/8">
            <Smartphone className="w-4 h-4 text-[hsl(210_80%_55%)]" />
          </div>
          <div className="flex-1">
            <h3 className="text-[15px] font-semibold">Dhan Trading API</h3>
            <p className="text-[11px] text-muted-foreground/50">Live prices and order execution</p>
          </div>
          {isDhanConnected && (
            <div className="flex items-center gap-1.5 text-profit">
              <CheckCircle className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium">{settings?.dhan_account_name || "Connected"}</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {isDhanConnected ? (
            <>
              <div className="p-2.5 rounded-lg bg-profit/6 border border-profit/15">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-profit" />
                    <span className="text-[12px] font-medium">
                      {settings?.dhan_account_name} ({settings?.dhan_client_id})
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground/40">
                    Connected {settings?.dhan_verified_at 
                      ? new Date(settings.dhan_verified_at).toLocaleDateString() 
                      : ""}
                  </span>
                </div>
              </div>

              {/* Token validity display */}
              <TokenValidityCard settings={settings} userId={user?.id} />

              {/* Auto-Sync Toggle */}
              <div className="p-2.5 rounded-lg border border-border/15 bg-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <RefreshCw className="w-3.5 h-3.5 text-primary" />
                  <div>
                    <p className="text-[12px] font-medium">Auto-Sync Orders</p>
                    <p className="text-[10px] text-muted-foreground/40">
                      Import executed orders every 5 min
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings?.auto_sync_portfolio ?? true}
                  onCheckedChange={(checked) => {
                    updateSettings.mutate({ auto_sync_portfolio: checked } as any);
                  }}
                />
              </div>

              {/* Manual Sync */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-[11px] rounded-lg border-border/20"
                  onClick={async () => {
                    setSyncingOrders(true);
                    try {
                      const { data, error } = await supabase.functions.invoke("dhan-sync", {
                        body: { user_id: user?.id },
                      });
                      if (error) throw error;
                      const r = data?.results?.[0];
                      if (r) {
                        const parts: string[] = [];
                        if (r.imported > 0) parts.push(`${r.imported} imported`);
                        if (r.closed > 0) parts.push(`${r.closed} closed`);
                        if (r.priceUpdates > 0) parts.push(`${r.priceUpdates} prices updated`);
                        toast.success(parts.length > 0 ? `Synced: ${parts.join(", ")}` : "No new orders");
                      } else {
                        toast.info("No new orders to sync");
                      }
                    } catch (e: any) {
                      toast.error(e?.message || "Sync failed");
                    } finally {
                      setSyncingOrders(false);
                    }
                  }}
                  disabled={syncingOrders}
                >
                  {syncingOrders ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  Sync Now
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-[11px] rounded-lg border-border/20 text-loss hover:text-loss"
                  onClick={handleDisconnectDhan}
                  disabled={disconnectingDhan}
                >
                  {disconnectingDhan ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <Unplug className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  Disconnect
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Auth mode tabs */}
              <div className="flex gap-0.5 p-0.5 rounded-lg bg-muted/40 border border-border/15">
                <button
                  type="button"
                  onClick={() => setDhanAuthMode("apikey")}
                  className={cn(
                    "flex-1 py-1.5 px-3 text-[12px] font-medium rounded-md transition-all duration-200 inline-flex items-center justify-center gap-1",
                    dhanAuthMode === "apikey"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground/50 hover:text-foreground"
                  )}
                >
                  <Key className="w-3 h-3" />
                  API Key
                </button>
                <button
                  type="button"
                  onClick={() => setDhanAuthMode("token")}
                  className={cn(
                    "flex-1 py-1.5 px-3 text-[12px] font-medium rounded-md transition-all duration-200 inline-flex items-center justify-center gap-1",
                    dhanAuthMode === "token"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground/50 hover:text-foreground"
                  )}
                >
                  <Shield className="w-3 h-3" />
                  Access Token
                </button>
              </div>

              {dhanAuthMode === "apikey" ? (
                <div className="space-y-2.5">
                  <div className="p-2.5 rounded-lg bg-primary/4 border border-primary/10">
                    <p className="text-[10px] text-muted-foreground/50">
                      <strong className="text-foreground/70">API Key</strong> is valid for 12 months. After setup, your access token auto-renews daily.
                    </p>
                  </div>

                  {/* Redirect URL instruction */}
                  <div className="p-2.5 rounded-lg bg-warning/6 border border-warning/15">
                    <p className="text-[10px] font-medium text-warning mb-1">
                      ⚠️ Set this Redirect URL in Dhan API settings
                    </p>
                    <code className="text-[10px] bg-muted/30 px-2 py-1 rounded-md block break-all select-all font-mono">
                      {window.location.origin}/dhan-callback
                    </code>
                    <p className="text-[10px] text-muted-foreground/40 mt-1">
                      web.dhan.co → My Profile → Access DhanHQ APIs → API Key → Edit → Set Redirect URL
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="dhan-client-id-ak" className="text-[11px] text-muted-foreground/60 font-medium uppercase tracking-wider">Client ID</Label>
                    <Input
                      id="dhan-client-id-ak"
                      value={dhanClientId}
                      onChange={(e) => setDhanClientId(e.target.value)}
                      className="bg-muted/20 border-border/20 h-9 text-[13px] focus:border-primary/30"
                      placeholder="Your Dhan Client ID"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="dhan-api-key" className="text-[11px] text-muted-foreground/60 font-medium uppercase tracking-wider">API Key</Label>
                    <Input
                      id="dhan-api-key"
                      value={dhanApiKey}
                      onChange={(e) => setDhanApiKey(e.target.value)}
                      className="bg-muted/20 border-border/20 h-9 text-[13px] font-mono focus:border-primary/30"
                      placeholder="Your Dhan API Key"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="dhan-api-secret" className="text-[11px] text-muted-foreground/60 font-medium uppercase tracking-wider">API Secret</Label>
                    <div className="relative">
                      <Input
                        id="dhan-api-secret"
                        type={showApiSecret ? "text" : "password"}
                        value={dhanApiSecret}
                        onChange={(e) => setDhanApiSecret(e.target.value)}
                        className="bg-muted/20 border-border/20 pr-10 h-9 text-[13px] font-mono focus:border-primary/30"
                        placeholder="Your Dhan API Secret"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                        onClick={() => setShowApiSecret(!showApiSecret)}
                      >
                        {showApiSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Generate API Key & Secret from{" "}
                    <a
                      href="https://web.dhan.co"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      web.dhan.co
                    </a>
                    {" → My Profile → Access DhanHQ APIs → Toggle to 'API key'"}
                  </p>

                  <Button
                    onClick={handleConnectApiKey}
                    disabled={connectingApiKey || !dhanApiKey || !dhanApiSecret}
                    className="w-full"
                  >
                    {connectingApiKey ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Key className="w-4 h-4 mr-2" />
                    )}
                    Authorize with Dhan (one-time login)
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    You'll be redirected to Dhan to log in once. After that, tokens auto-renew daily.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="p-2.5 rounded-lg bg-warning/6 border border-warning/15">
                    <p className="text-[10px] text-muted-foreground/50">
                      Access tokens expire in <strong className="text-foreground/70">24 hours</strong>. You'll need to paste a new token daily from Dhan Web.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="dhan-client-id-tk" className="text-[11px] text-muted-foreground/60 font-medium uppercase tracking-wider">Client ID</Label>
                    <Input
                      id="dhan-client-id-tk"
                      value={dhanClientId}
                      onChange={(e) => setDhanClientId(e.target.value)}
                      className="bg-muted/20 border-border/20 h-9 text-[13px] focus:border-primary/30"
                      placeholder="Your Dhan Client ID"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="dhan-token" className="text-[11px] text-muted-foreground/60 font-medium uppercase tracking-wider">Access Token</Label>
                    <div className="relative">
                      <Input
                        id="dhan-token"
                        type={showDhanToken ? "text" : "password"}
                        value={dhanAccessToken}
                        onChange={(e) => setDhanAccessToken(e.target.value)}
                        className="bg-muted/20 border-border/20 pr-10 h-9 text-[13px] font-mono focus:border-primary/30"
                        placeholder="Your Dhan Access Token"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                        onClick={() => setShowDhanToken(!showDhanToken)}
                      >
                        {showDhanToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground/40">
                      Get your token from{" "}
                      <a 
                        href="https://login.dhan.co/register?brand=dhan&referral=AIQU0151" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Dhan API Portal
                      </a>
                    </p>
                  </div>
                  
                  <Button
                    onClick={handleVerifyDhan}
                    disabled={verifyingDhan || !dhanClientId || !dhanAccessToken}
                    className="w-full h-9 text-[13px] rounded-lg"
                  >
                    {verifyingDhan ? (
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <Key className="w-3.5 h-3.5 mr-1.5" />
                    )}
                    Verify & Connect
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* RA Public Mode */}
      <div className="premium-card-hover p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="icon-badge-sm bg-warning/8">
            <Shield className="w-4 h-4 text-warning" />
          </div>
          <div className="flex-1">
            <h3 className="text-[15px] font-semibold">RA Public Mode</h3>
            <p className="text-[11px] text-muted-foreground/50">SEBI-compliant messaging for public channels</p>
          </div>
          <Switch
            checked={settings?.ra_public_mode ?? false}
            onCheckedChange={(checked) => {
              updateSettings.mutate({ ra_public_mode: checked } as any);
            }}
          />
        </div>

        <div className="space-y-3">
          <div className="p-2.5 rounded-lg bg-muted/20 border border-border/10">
            <p className="text-[11px] text-muted-foreground/40 leading-relaxed">
              When enabled, Telegram notifications will <strong className="text-foreground/60">hide quantity/lots</strong> and append a compliance disclaimer.
            </p>
          </div>

          {settings?.ra_public_mode && (
            <div className="space-y-1.5">
              <Label htmlFor="ra-disclaimer" className="text-[11px] text-muted-foreground/60 font-medium uppercase tracking-wider">Custom Disclaimer</Label>
              <Textarea
                id="ra-disclaimer"
                placeholder="e.g., Research/Education only. Not investment advice. RA: MyBrand | Reg No: INH... | Disclosures: link"
                defaultValue={settings?.ra_disclaimer || ""}
                className="resize-none text-[13px] bg-muted/20 border-border/20 focus:border-primary/30"
                rows={3}
                onBlur={(e) => {
                  const val = e.target.value.trim();
                  updateSettings.mutate({ ra_disclaimer: val || null } as any);
                }}
              />
              <p className="text-[10px] text-muted-foreground/30">
                Leave blank for default: "For educational/research purpose only."
              </p>
            </div>
          )}
        </div>
      </div>
      </PlanGate>

      {/* Instrument Master Sync */}
      <div className="premium-card-hover p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="icon-badge-sm bg-[hsl(270_60%_55%)]/8">
            <Database className="w-4 h-4 text-[hsl(270_60%_55%)]" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold">Instrument Database</h3>
            <p className="text-[11px] text-muted-foreground/50">NSE/NFO/MCX instruments for search & pricing</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Counts by segment */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="inner-panel !p-2.5">
              <div className="text-[10px] text-muted-foreground/50 font-medium uppercase tracking-wider">NSE Equity</div>
              <div className="text-base font-bold font-mono mt-0.5">{syncStatus.nseEqCount.toLocaleString()}</div>
            </div>
            <div className="inner-panel !p-2.5">
              <div className="text-[10px] text-muted-foreground/50 font-medium uppercase tracking-wider">NSE F&O</div>
              <div className="text-base font-bold font-mono mt-0.5">{syncStatus.nfoCount.toLocaleString()}</div>
            </div>
            <div className="inner-panel !p-2.5">
              <div className="text-[10px] text-muted-foreground/50 font-medium uppercase tracking-wider">MCX</div>
              <div className="text-base font-bold font-mono mt-0.5">{syncStatus.mcxCount.toLocaleString()}</div>
            </div>
          </div>
          
          {/* Sync status */}
          {syncStatus.status && (
            <div className={`p-2.5 rounded-lg flex items-center gap-2 ${
              syncStatus.status === "completed" || syncStatus.status === "partial"
                ? "bg-profit/6 border border-profit/15"
                : syncStatus.status === "running"
                ? "bg-[hsl(210_80%_55%)]/6 border border-[hsl(210_80%_55%)]/15"
                : "bg-loss/6 border border-loss/15"
            }`}>
              {(syncStatus.status === "completed" || syncStatus.status === "partial") ? (
                <CheckCircle className="w-4 h-4 text-profit" />
              ) : syncStatus.status === "running" ? (
                <Loader2 className="w-3.5 h-3.5 text-[hsl(210_80%_55%)] animate-spin" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-loss" />
              )}
              <span className={`text-[12px] font-medium ${
                (syncStatus.status === "completed" || syncStatus.status === "partial") ? "text-profit" 
                : syncStatus.status === "running" ? "text-[hsl(210_80%_55%)]"
                : "text-loss"
              }`}>
                {syncStatus.status === "completed" ? "Sync successful" 
                 : syncStatus.status === "partial" ? "Sync completed with warnings"
                 : syncStatus.status === "running" ? "Syncing..."
                 : "Sync failed"}
              </span>
            </div>
          )}
          
          {syncStatus.errorMessage && (
            <div className="p-2 rounded-lg bg-loss/6 border border-loss/15">
              <p className="text-[10px] text-loss">{syncStatus.errorMessage}</p>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/40">
              <Clock className="w-3 h-3" />
              Last sync: {syncStatus.lastSync 
                ? new Date(syncStatus.lastSync).toLocaleString() 
                : "Never"}
            </div>
            <div className="text-[11px] font-medium font-mono">
              Total: {totalInstruments.toLocaleString()}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-[11px] rounded-lg border-border/20"
              onClick={handleInstrumentSync}
              disabled={syncingInstruments}
            >
              {syncingInstruments ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              )}
              Sync Now
            </Button>
          </div>

          <p className="text-[10px] text-muted-foreground/30">
            Auto-syncs daily at 6 AM IST. Use "Sync Now" for new listings and F&O contracts.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Token Validity Card ──────────────────────────────────────────

function TokenValidityCard({ settings, userId }: { settings: any; userId?: string }) {
  const [testing, setTesting] = useState(false);
  const [renewing, setRenewing] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<"active" | "expired" | "unknown">("unknown");
  const [tokenExpiry, setTokenExpiry] = useState<string | null>(settings?.dhan_token_expiry || null);

  useEffect(() => {
    if (tokenExpiry) {
      const exp = new Date(tokenExpiry);
      setTokenStatus(exp > new Date() ? "active" : "expired");
    }
  }, [tokenExpiry]);

  const handleTest = async () => {
    if (!userId) return;
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke("dhan-verify", {
        body: { action: "test", user_id: userId },
      });
      if (error) throw error;
      if (data?.success) {
        setTokenStatus("active");
        setTokenExpiry(data.token_expiry);
        toast.success(`Token active${data.account_name ? ` — ${data.account_name}` : ""}`);
      } else {
        setTokenStatus("expired");
        setTokenExpiry(null);
        toast.error(data?.error || "Token check failed");
      }
    } catch (e: any) {
      toast.error(e?.message || "Test failed");
    } finally {
      setTesting(false);
    }
  };

  const handleRenew = async () => {
    if (!userId) return;
    setRenewing(true);
    try {
      const { data, error } = await supabase.functions.invoke("dhan-verify", {
        body: { action: "renew", user_id: userId },
      });
      if (error) throw error;
      if (data?.success) {
        setTokenStatus("active");
        setTokenExpiry(data.token_expiry);
        toast.success("Token renewed! Valid for another 24 hours.");
      } else {
        toast.error(data?.error || "Renewal failed. Generate a new token from Dhan Web.");
      }
    } catch (e: any) {
      toast.error(e?.message || "Renewal failed");
    } finally {
      setRenewing(false);
    }
  };

  return (
    <div className="p-2.5 rounded-lg border border-border/15 bg-muted/20 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              tokenStatus === "active"
                ? "bg-profit"
                : tokenStatus === "expired"
                ? "bg-loss"
                : "bg-muted-foreground"
            }`}
          />
          <span className="text-[12px] font-medium">
            Token: {tokenStatus === "active" ? "Active" : tokenStatus === "expired" ? "Expired" : "Unknown"}
          </span>
        </div>
        {tokenExpiry && tokenStatus === "active" && (
          <span className="text-xs text-muted-foreground">
            Expires: {new Date(tokenExpiry).toLocaleString()}
          </span>
        )}
      </div>

      {tokenStatus === "expired" && (
        <p className="text-xs text-loss">
          Token expired. Renew it below or generate a new token from{" "}
          <a
            href="https://login.dhan.co"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Dhan Web
          </a>
          .
        </p>
      )}

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleTest} disabled={testing}>
          {testing ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5 mr-1" />}
          Test Connection
        </Button>
        <Button variant="outline" size="sm" onClick={handleRenew} disabled={renewing}>
          {renewing ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 mr-1" />}
          Renew Token
        </Button>
      </div>
    </div>
  );
}
