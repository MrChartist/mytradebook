import { useState, useEffect, useCallback } from "react";
import { 
  Loader2, Send, RefreshCw, CheckCircle, 
  Smartphone, Database, Clock, AlertTriangle, 
  MessageCircle, Unplug, Key, Eye, EyeOff, Shield
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserSettings } from "@/hooks/useUserSettings";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
      window.location.reload();
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
        window.location.reload();
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
        window.location.reload();
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
      <div className="space-y-6">
        <div className="glass-card p-6 flex items-center justify-center min-h-[200px]">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const isTelegramConnected = !!settings?.telegram_chat_id && !!settings?.telegram_verified_at;
  const isDhanConnected = !!settings?.dhan_access_token && !!settings?.dhan_enabled;
  const totalInstruments = syncStatus.nseEqCount + syncStatus.nfoCount + syncStatus.mcxCount;

  return (
    <div className="space-y-6">
      {/* Telegram Integration */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h3 className="font-semibold">Telegram Notifications</h3>
            <p className="text-sm text-muted-foreground">Get trade alerts on Telegram</p>
          </div>
          {isTelegramConnected && (
            <div className="ml-auto flex items-center gap-2 text-profit">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Connected</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {isTelegramConnected ? (
            <>
              <div className="p-3 rounded-lg bg-profit/10 border border-profit/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-profit" />
                    <span className="text-sm text-profit font-medium">
                      Chat ID: {settings?.telegram_chat_id}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Connected {settings?.telegram_verified_at 
                      ? new Date(settings.telegram_verified_at).toLocaleDateString() 
                      : ""}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={async () => {
                    setTestingTelegram(true);
                    try {
                      const { data, error } = await supabase.functions.invoke("telegram-notify", {
                        body: { type: "custom", message: "✅ Test successful! Notifications are working.", chat_id: settings?.telegram_chat_id },
                      });
                      if (error) throw error;
                      data?.success ? toast.success("Test message sent!") : toast.error(data?.error || "Test failed");
                    } catch { toast.error("Failed to send test message"); }
                    finally { setTestingTelegram(false); }
                  }}
                  disabled={testingTelegram}
                >
                  {testingTelegram ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  Send Test
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    if (!user?.id) return;
                    setDisconnectingTelegram(true);
                    try {
                      await supabase.from("user_settings").update({
                        telegram_chat_id: null, telegram_verified_at: null, telegram_enabled: false,
                      }).eq("user_id", user.id);
                      toast.success("Telegram disconnected");
                      window.location.reload();
                    } catch { toast.error("Failed to disconnect"); }
                    finally { setDisconnectingTelegram(false); }
                  }}
                  disabled={disconnectingTelegram}
                  className="text-loss hover:text-loss"
                >
                  {disconnectingTelegram ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Unplug className="w-4 h-4 mr-2" />}
                  Disconnect
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter your Telegram Chat ID to receive trade alerts, target/SL notifications, and weekly reports.
              </p>
              
              <div className="p-4 rounded-lg bg-accent/50 border border-border space-y-3">
                <p className="text-sm font-medium">How to get your Chat ID:</p>
                <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
                  <li>Open Telegram and search for <code className="bg-accent px-1.5 py-0.5 rounded text-xs font-mono">@userinfobot</code></li>
                  <li>Start the bot — it will reply with your <strong>Chat ID</strong></li>
                  <li>Paste the ID below and click Connect</li>
                </ol>
                <p className="text-xs text-muted-foreground">
                  For a <strong>channel</strong>, forward any message from the channel to <code className="bg-accent px-1.5 py-0.5 rounded text-xs font-mono">@userinfobot</code> to get the channel ID (starts with <code>-100</code>).
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telegram-chat-id">Chat ID</Label>
                <Input
                  id="telegram-chat-id"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  className="bg-accent border-border"
                  placeholder="e.g. 123456789 or -1001234567890"
                />
              </div>

              <Button
                onClick={handleSaveTelegram}
                disabled={savingTelegram || !telegramChatId.trim()}
              >
                {savingTelegram ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <MessageCircle className="w-4 h-4 mr-2" />
                )}
                Connect & Test
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Dhan API Integration */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold">Dhan Trading API</h3>
            <p className="text-sm text-muted-foreground">Connect for live prices and order execution</p>
          </div>
          {isDhanConnected && (
            <div className="ml-auto flex items-center gap-2 text-profit">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{settings?.dhan_account_name || "Connected"}</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {isDhanConnected ? (
            <>
              <div className="p-3 rounded-lg bg-profit/10 border border-profit/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-profit" />
                    <span className="text-sm font-medium">
                      {settings?.dhan_account_name} ({settings?.dhan_client_id})
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Connected {settings?.dhan_verified_at 
                      ? new Date(settings.dhan_verified_at).toLocaleDateString() 
                      : ""}
                  </span>
                </div>
              </div>
              
              <Button
                variant="outline"
                onClick={handleDisconnectDhan}
                disabled={disconnectingDhan}
                className="text-loss hover:text-loss"
              >
                {disconnectingDhan ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Unplug className="w-4 h-4 mr-2" />
                )}
                Disconnect
              </Button>
            </>
          ) : (
            <>
              <div className="grid gap-3">
                <div className="space-y-2">
                  <Label htmlFor="dhan-client-id">Client ID</Label>
                  <Input
                    id="dhan-client-id"
                    value={dhanClientId}
                    onChange={(e) => setDhanClientId(e.target.value)}
                    className="bg-accent border-border"
                    placeholder="Your Dhan Client ID"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dhan-token">Access Token</Label>
                  <div className="relative">
                    <Input
                      id="dhan-token"
                      type={showDhanToken ? "text" : "password"}
                      value={dhanAccessToken}
                      onChange={(e) => setDhanAccessToken(e.target.value)}
                      className="bg-accent border-border pr-10"
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
                  <p className="text-xs text-muted-foreground">
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
              </div>
              
              <Button
                onClick={handleVerifyDhan}
                disabled={verifyingDhan || !dhanClientId || !dhanAccessToken}
              >
                {verifyingDhan ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Key className="w-4 h-4 mr-2" />
                )}
                Verify & Connect
              </Button>
            </>
          )}
        </div>
      </div>

      {/* RA Public Mode */}
      <div className="surface-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="font-semibold">RA Public Mode</h3>
            <p className="text-sm text-muted-foreground">SEBI-compliant messaging for public channels</p>
          </div>
          <div className="ml-auto">
            <Switch
              checked={settings?.ra_public_mode ?? false}
              onCheckedChange={(checked) => {
                updateSettings.mutate({ ra_public_mode: checked } as any);
              }}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-accent/50 border border-border">
            <p className="text-sm text-muted-foreground">
              When enabled, all Telegram notifications will <strong>hide quantity/lots</strong> and append a compliance disclaimer. Use this for public channels and research distribution.
            </p>
          </div>

          {settings?.ra_public_mode && (
            <div className="space-y-2">
              <Label htmlFor="ra-disclaimer">Custom Disclaimer (optional)</Label>
              <Textarea
                id="ra-disclaimer"
                placeholder="e.g., Research/Education only. Not investment advice. RA: MyBrand | Reg No: INH... | Disclosures: link"
                defaultValue={settings?.ra_disclaimer || ""}
                className="resize-none text-sm"
                rows={3}
                onBlur={(e) => {
                  const val = e.target.value.trim();
                  updateSettings.mutate({ ra_disclaimer: val || null } as any);
                }}
              />
              <p className="text-xs text-muted-foreground">
                Leave blank for default: "For educational/research purpose only. Not a buy/sell recommendation."
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Instrument Master Sync */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <Database className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold">Instrument Database</h3>
            <p className="text-sm text-muted-foreground">NSE/NFO/MCX instruments for search & pricing</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Counts by segment */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-accent">
              <div className="text-xs text-muted-foreground">NSE Equity</div>
              <div className="text-lg font-bold">{syncStatus.nseEqCount.toLocaleString()}</div>
            </div>
            <div className="p-3 rounded-lg bg-accent">
              <div className="text-xs text-muted-foreground">NSE F&O</div>
              <div className="text-lg font-bold">{syncStatus.nfoCount.toLocaleString()}</div>
            </div>
            <div className="p-3 rounded-lg bg-accent">
              <div className="text-xs text-muted-foreground">MCX</div>
              <div className="text-lg font-bold">{syncStatus.mcxCount.toLocaleString()}</div>
            </div>
          </div>
          
          {/* Sync status */}
          {syncStatus.status && (
            <div className={`p-3 rounded-lg flex items-center gap-2 ${
              syncStatus.status === "completed" || syncStatus.status === "partial"
                ? "bg-profit/10 border border-profit/20"
                : syncStatus.status === "running"
                ? "bg-blue-500/10 border border-blue-500/20"
                : "bg-loss/10 border border-loss/20"
            }`}>
              {(syncStatus.status === "completed" || syncStatus.status === "partial") ? (
                <CheckCircle className="w-4 h-4 text-profit" />
              ) : syncStatus.status === "running" ? (
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-loss" />
              )}
              <span className={`text-sm font-medium ${
                (syncStatus.status === "completed" || syncStatus.status === "partial") ? "text-profit" 
                : syncStatus.status === "running" ? "text-blue-400"
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
            <div className="p-2 rounded bg-loss/10 border border-loss/20">
              <p className="text-xs text-loss">{syncStatus.errorMessage}</p>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              Last sync: {syncStatus.lastSync 
                ? new Date(syncStatus.lastSync).toLocaleString() 
                : "Never"}
            </div>
            <div className="text-sm font-medium">
              Total: {totalInstruments.toLocaleString()}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleInstrumentSync}
              disabled={syncingInstruments}
            >
              {syncingInstruments ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Sync Now
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Auto-syncs daily at 6 AM IST. Use "Sync Now" for new listings and F&O contracts.
          </p>
        </div>
      </div>
    </div>
  );
}
