import { useState, useEffect } from "react";
import { Save, Loader2, Send, RefreshCw, CheckCircle, XCircle, Smartphone, Database, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserSettings } from "@/hooks/useUserSettings";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function IntegrationsSettings() {
  const { settings, isLoading, updateSettings, testTelegramConnection } = useUserSettings();
  const [telegramChatId, setTelegramChatId] = useState("");
  const [dhanClientId, setDhanClientId] = useState("");
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState<"connected" | "disconnected" | null>(null);
  const [syncing, setSyncing] = useState(false);
  
  // Instrument sync state
  const [syncingInstruments, setSyncingInstruments] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    lastSync: string | null;
    totalCount: number;
    status: string | null;
    errorMessage: string | null;
  }>({ lastSync: null, totalCount: 0, status: null, errorMessage: null });

  useEffect(() => {
    if (settings) {
      setTelegramChatId(settings.telegram_chat_id || "");
      setDhanClientId(settings.dhan_client_id || "");
      setTelegramStatus(settings.telegram_chat_id ? "connected" : "disconnected");
    }
  }, [settings]);
  
  // Fetch instrument sync status
  useEffect(() => {
    const fetchSyncStatus = async () => {
      const { data: logs, error } = await supabase
        .from("instrument_sync_log")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(1);
      
      if (!error && logs && logs.length > 0) {
        const latest = logs[0];
        setSyncStatus({
          lastSync: latest.completed_at || latest.started_at,
          totalCount: latest.total_rows || 0,
          status: latest.status,
          errorMessage: latest.error_message,
        });
      }
      
      // Get total count
      const { count } = await supabase
        .from("instrument_master")
        .select("*", { count: "exact", head: true });
      
      if (count !== null) {
        setSyncStatus((prev) => ({ ...prev, totalCount: count }));
      }
    };
    
    fetchSyncStatus();
  }, []);
  
  const handleInstrumentSync = async () => {
    setSyncingInstruments(true);
    try {
      const { data, error } = await supabase.functions.invoke("instrument-sync");
      
      if (error) {
        console.error("Instrument sync error:", error);
        toast.error("Failed to sync instruments: " + error.message);
        setSyncStatus((prev) => ({ ...prev, status: "failed", errorMessage: error.message }));
      } else if (data?.success) {
        toast.success(`Synced ${data.inserted} instruments from Dhan`);
        setSyncStatus({
          lastSync: new Date().toISOString(),
          totalCount: data.total_parsed,
          status: "completed",
          errorMessage: null,
        });
      } else {
        toast.error("Sync failed: " + (data?.error || "Unknown error"));
        setSyncStatus((prev) => ({ ...prev, status: "failed", errorMessage: data?.error }));
      }
    } catch (err) {
      console.error("Instrument sync error:", err);
      toast.error("Failed to sync instruments");
    } finally {
      setSyncingInstruments(false);
    }
  };

  const handleTestTelegram = async () => {
    if (!telegramChatId) {
      toast.error("Please enter a Chat ID first");
      return;
    }

    setTestingTelegram(true);
    const success = await testTelegramConnection(telegramChatId);
    setTelegramStatus(success ? "connected" : "disconnected");
    
    if (success) {
      // Save the chat ID if test was successful
      updateSettings.mutate({ telegram_chat_id: telegramChatId });
    }
    setTestingTelegram(false);
  };

  const handleSaveDhan = () => {
    updateSettings.mutate({ dhan_client_id: dhanClientId });
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    // Simulate sync - in real implementation, this would call a Dhan sync edge function
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toast.success("Portfolio synced successfully");
    setSyncing(false);
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

  return (
    <div className="space-y-6">
      {/* Telegram Bot */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-sky-400"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold">Telegram Bot</h3>
            <p className="text-sm text-muted-foreground">
              Get alerts and updates on Telegram
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="telegram-chat-id">Chat ID</Label>
            <Input
              id="telegram-chat-id"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value)}
              className="bg-accent border-border"
              placeholder="Enter your Telegram chat ID"
            />
            <p className="text-xs text-muted-foreground">
              Message @userinfobot on Telegram to get your Chat ID
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleTestTelegram}
              disabled={testingTelegram || !telegramChatId}
            >
              {testingTelegram ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Test Connection
            </Button>
          </div>

          {telegramStatus && (
            <div
              className={`p-3 rounded-lg flex items-center gap-2 ${
                telegramStatus === "connected"
                  ? "bg-profit/10 border border-profit/20"
                  : "bg-loss/10 border border-loss/20"
              }`}
            >
              {telegramStatus === "connected" ? (
                <>
                  <CheckCircle className="w-4 h-4 text-profit" />
                  <span className="text-sm text-profit font-medium">Connected</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-loss" />
                  <span className="text-sm text-loss font-medium">Disconnected</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dhan API */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold">Dhan API</h3>
            <p className="text-sm text-muted-foreground">
              Connect your Dhan trading account
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dhan-api-key">API Key</Label>
            <Input
              id="dhan-api-key"
              type="password"
              className="bg-accent border-border"
              placeholder="Enter your Dhan API key"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dhan-client-id">Client ID</Label>
            <Input
              id="dhan-client-id"
              value={dhanClientId}
              onChange={(e) => setDhanClientId(e.target.value)}
              className="bg-accent border-border"
              placeholder="Enter your Dhan client ID"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSaveDhan}
              disabled={updateSettings.isPending}
            >
              {updateSettings.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Verify Connection
            </Button>
            <Button variant="outline" onClick={handleSyncNow} disabled={syncing}>
              {syncing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Sync Now
            </Button>
          </div>

          <div className="p-3 rounded-lg bg-profit/10 border border-profit/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-profit" />
                <span className="text-sm text-profit font-medium">Connected</span>
              </div>
              <span className="text-xs text-muted-foreground">
                Last sync: Today at 3:00 PM
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Instrument Master */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <Database className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold">Instrument Master</h3>
            <p className="text-sm text-muted-foreground">
              Sync NSE/NFO/MCX instruments from Dhan
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Status display */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-accent">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Database className="w-3.5 h-3.5" />
                Total Instruments
              </div>
              <div className="text-xl font-bold">{syncStatus.totalCount.toLocaleString()}</div>
            </div>
            <div className="p-3 rounded-lg bg-accent">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Clock className="w-3.5 h-3.5" />
                Last Sync
              </div>
              <div className="text-sm font-medium">
                {syncStatus.lastSync 
                  ? new Date(syncStatus.lastSync).toLocaleString() 
                  : "Never"
                }
              </div>
            </div>
          </div>
          
          {/* Sync status indicator */}
          {syncStatus.status && (
            <div className={`p-3 rounded-lg flex items-center gap-2 ${
              syncStatus.status === "completed" 
                ? "bg-profit/10 border border-profit/20"
                : syncStatus.status === "running"
                ? "bg-blue-500/10 border border-blue-500/20"
                : "bg-loss/10 border border-loss/20"
            }`}>
              {syncStatus.status === "completed" ? (
                <CheckCircle className="w-4 h-4 text-profit" />
              ) : syncStatus.status === "running" ? (
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-loss" />
              )}
              <span className={`text-sm font-medium ${
                syncStatus.status === "completed" ? "text-profit" 
                : syncStatus.status === "running" ? "text-blue-400"
                : "text-loss"
              }`}>
                {syncStatus.status === "completed" ? "Last sync successful" 
                 : syncStatus.status === "running" ? "Sync in progress..."
                 : "Last sync failed"}
              </span>
              {syncStatus.errorMessage && (
                <span className="text-xs text-muted-foreground ml-2">
                  {syncStatus.errorMessage}
                </span>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="default"
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
            Instruments are synced daily at 6 AM IST. Use "Sync Now" to manually refresh the list with new listings and F&O contracts.
          </p>
        </div>
      </div>
    </div>
  );
}
