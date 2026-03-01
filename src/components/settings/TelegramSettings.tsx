import { useState } from "react";
import {
  MessageCircle, Send, Trash2, Plus, CheckCircle, Loader2,
  ExternalLink, Filter, Unplug, AlertTriangle, ChevronDown, ChevronUp, History,
  BarChart3, Bell, BookOpen, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useTelegramChats, SEGMENT_LABELS, type TelegramChat, type NotificationTypeRouting, DEFAULT_NOTIFICATION_TYPES } from "@/hooks/useTelegramChats";
import { useUserSettings } from "@/hooks/useUserSettings";
import { DeliveryLogPanel } from "@/components/telegram/DeliveryLogPanel";

const SEGMENT_KEYS = Object.keys(SEGMENT_LABELS);

function NotificationRoutingPanel({
  chat,
  onToggleType,
  onToggleAll,
}: {
  chat: TelegramChat;
  onToggleType: (chatId: string, category: keyof NotificationTypeRouting, segment: string, currentTypes: NotificationTypeRouting | null) => Promise<void>;
  onToggleAll: (chatId: string, category: keyof NotificationTypeRouting, enabled: boolean, currentTypes: NotificationTypeRouting | null) => Promise<void>;
}) {
  const types = chat.notification_types || DEFAULT_NOTIFICATION_TYPES;

  const isSegmentEnabled = (category: keyof NotificationTypeRouting, seg: string) => {
    const arr = types[category] || [];
    return arr.includes("*") || arr.includes(seg);
  };

  const isAllEnabled = (category: keyof NotificationTypeRouting) => {
    const arr = types[category] || [];
    return arr.includes("*");
  };

  const hasAny = (category: keyof NotificationTypeRouting) => {
    const arr = types[category] || [];
    return arr.length > 0;
  };

  const sections: Array<{
    key: keyof NotificationTypeRouting;
    label: string;
    icon: React.ReactNode;
    mode: "segments" | "all";
  }> = [
    { key: "trade", label: "Trades", icon: <BarChart3 className="w-3.5 h-3.5" />, mode: "segments" },
    { key: "alert", label: "Alerts", icon: <Bell className="w-3.5 h-3.5" />, mode: "all" },
    { key: "study", label: "Studies", icon: <BookOpen className="w-3.5 h-3.5" />, mode: "all" },
    { key: "report", label: "Daily Report", icon: <FileText className="w-3.5 h-3.5" />, mode: "segments" },
  ];

  return (
    <div className="space-y-3 mt-3">
      {sections.map((section) => (
        <div key={section.key} className="p-3 rounded-lg border border-border bg-accent/30">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn("text-muted-foreground", hasAny(section.key) && "text-primary")}>{section.icon}</span>
            <span className="text-xs font-semibold uppercase tracking-wide">{section.label}</span>
            {!hasAny(section.key) && (
              <Badge variant="outline" className="text-[9px] ml-auto bg-muted/50 text-muted-foreground">Off</Badge>
            )}
            {hasAny(section.key) && (
              <Badge variant="outline" className="text-[9px] ml-auto bg-primary/10 border-primary/30 text-primary">Active</Badge>
            )}
          </div>

          {section.mode === "all" ? (
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={isAllEnabled(section.key)}
                onCheckedChange={(checked) => onToggleAll(chat.id, section.key, !!checked, chat.notification_types)}
              />
              <span className="text-xs text-foreground">All {section.label.toLowerCase()} to this chat</span>
            </label>
          ) : (
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {SEGMENT_KEYS.map((seg) => (
                <label key={seg} className="flex items-center gap-1.5 cursor-pointer">
                  <Checkbox
                    checked={isSegmentEnabled(section.key, seg)}
                    onCheckedChange={() => {
                      if (isAllEnabled(section.key)) {
                        // Convert from wildcard to explicit segments minus this one
                        const allExcept = SEGMENT_KEYS.filter((s) => s !== seg);
                        // We need a direct update here; toggle won't work cleanly from wildcard
                        onToggleType(chat.id, section.key, seg, {
                          ...types,
                          [section.key]: allExcept,
                        });
                      } else {
                        onToggleType(chat.id, section.key, seg, chat.notification_types);
                      }
                    }}
                  />
                  <span className="text-[11px] text-foreground leading-tight">{SEGMENT_LABELS[seg]}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function TelegramSettings() {
  const { settings, updateSettings, testTelegramConnection } = useUserSettings();
  const { chats, isLoading, deliveryLogs, logsLoading, addChat, removeChat, removeAllChats, toggleSegment, toggleNotificationType, toggleNotificationAll, testChat, testAllChats } = useTelegramChats();

  // Add chat form
  const [newChatId, setNewChatId] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newBotToken, setNewBotToken] = useState("");
  const [newBotUsername, setNewBotUsername] = useState("");
  const [showCustomBot, setShowCustomBot] = useState(false);
  const [adding, setAdding] = useState(false);

  // Bot config form
  const [editingBot, setEditingBot] = useState(false);
  const [botTokenInput, setBotTokenInput] = useState("");
  const [botUsernameInput, setBotUsernameInput] = useState("");
  const [savingBot, setSavingBot] = useState(false);
  const [testingBot, setTestingBot] = useState(false);

  // Testing state
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testingAll, setTestingAll] = useState(false);
  const [removingAll, setRemovingAll] = useState(false);

  // Delivery log panel state
  const [showDeliveryLog, setShowDeliveryLog] = useState(false);

  const hasPersonalBot = !!settings?.telegram_bot_token;

  const handleSaveBot = async () => {
    if (!botTokenInput.trim()) return;
    setSavingBot(true);
    try {
      await updateSettings.mutateAsync({
        telegram_bot_token: botTokenInput.trim(),
        telegram_bot_username: botUsernameInput.trim() || null,
      } as any);
      setEditingBot(false);
      setBotTokenInput("");
      setBotUsernameInput("");
    } finally {
      setSavingBot(false);
    }
  };

  const handleRemoveBot = async () => {
    setSavingBot(true);
    try {
      await updateSettings.mutateAsync({
        telegram_bot_token: null,
        telegram_bot_username: null,
      } as any);
    } finally {
      setSavingBot(false);
    }
  };

  const handleTestBot = async () => {
    if (!settings?.telegram_bot_token) return;
    setTestingBot(true);
    // Use the first chat destination to test, or a test-specific approach
    const firstChat = chats[0];
    if (firstChat) {
      await testChat(firstChat.chat_id, settings.telegram_bot_token);
    }
    setTestingBot(false);
  };

  const handleAddChat = async () => {
    if (!newChatId.trim()) return;
    setAdding(true);
    try {
      await addChat.mutateAsync({
        chat_id: newChatId.trim(),
        label: newLabel.trim() || `Chat ${newChatId.trim()}`,
        bot_token: newBotToken.trim() || undefined,
        bot_username: newBotUsername.trim() || undefined,
      });
      setNewChatId("");
      setNewLabel("");
      setNewBotToken("");
      setNewBotUsername("");
      setShowCustomBot(false);
    } finally {
      setAdding(false);
    }
  };

  const handleTestChat = async (chat: TelegramChat) => {
    setTestingId(chat.id);
    await testChat(chat.chat_id, chat.bot_token);
    setTestingId(null);
  };

  const handleTestAll = async () => {
    setTestingAll(true);
    await testAllChats();
    setTestingAll(false);
  };

  const handleRemoveAll = async () => {
    setRemovingAll(true);
    await removeAllChats.mutateAsync();
    setRemovingAll(false);
  };

  if (isLoading) {
    return (
      <div className="glass-card p-6 flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h3 className="font-semibold">Telegram Notifications</h3>
            <p className="text-sm text-muted-foreground">Send alerts to personal chats, groups & channels</p>
          </div>
        </div>
        {chats.length > 0 && (
          <div className="flex items-center gap-2 text-profit">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{chats.length} chat{chats.length !== 1 ? "s" : ""}</span>
          </div>
        )}
      </div>

      {/* Step 1: Bot Setup */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">1</span>
          <h4 className="font-medium text-sm">Set Up Your Bot</h4>
        </div>

        {hasPersonalBot && !editingBot ? (
          <div className="p-3 rounded-lg border border-profit/20 bg-profit/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-profit" />
                <span className="text-sm text-profit font-medium">
                  Your Bot{settings?.telegram_bot_username ? `: @${settings.telegram_bot_username}` : ""}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleTestBot} disabled={testingBot || chats.length === 0}>
                  {testingBot ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Send className="w-3 h-3 mr-1" />}
                  Test
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setEditingBot(true); setBotTokenInput(settings?.telegram_bot_token || ""); setBotUsernameInput(settings?.telegram_bot_username || ""); }}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-loss hover:text-loss" onClick={handleRemoveBot} disabled={savingBot}>
                  Remove
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Token: ••••{settings?.telegram_bot_token?.slice(-8)}</p>
          </div>
        ) : (
          <div className="p-4 rounded-lg border border-border bg-card space-y-3">
            <p className="text-xs text-muted-foreground">
              Create a bot via <a href="https://t.me/BotFather" target="_blank" rel="noopener" className="text-primary hover:underline">@BotFather</a>, then paste the token here. This bot will be your default for all chat destinations.
            </p>
            <div className="space-y-2">
              <Label className="text-xs">Bot Token</Label>
              <Input
                value={botTokenInput}
                onChange={(e) => setBotTokenInput(e.target.value)}
                placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                className="bg-accent border-border text-xs font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Bot Username (optional)</Label>
              <Input
                value={botUsernameInput}
                onChange={(e) => setBotUsernameInput(e.target.value)}
                placeholder="@MyTradingBot"
                className="bg-accent border-border text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleSaveBot} disabled={savingBot || !botTokenInput.trim()} size="sm" className="gap-1">
                {savingBot ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                Save Bot
              </Button>
              {editingBot && (
                <Button variant="ghost" size="sm" onClick={() => { setEditingBot(false); setBotTokenInput(""); setBotUsernameInput(""); }}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}

        {!hasPersonalBot && !editingBot && (
          <div className="mt-2 p-3 rounded-lg bg-accent/50 border border-border">
            <p className="text-xs text-muted-foreground">
              <strong>No personal bot configured.</strong> The system default bot will be used as fallback. Set up your own bot for independent, reliable delivery.
            </p>
          </div>
        )}
      </div>

      {/* Step 2: Chat Destinations */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">2</span>
          <h4 className="font-medium text-sm">Add Chat Destinations</h4>
        </div>
        <p className="text-xs text-muted-foreground mb-4 ml-8">
          Add your personal chat, group chats, or channel IDs. Assign trade segments to control which notifications each channel receives.
        </p>

        {/* Existing chats */}
        <div className="space-y-3 mb-4">
          {chats.map((chat) => (
            <div key={chat.id} className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{chat.label}</p>
                    <p className="text-xs text-muted-foreground font-mono">{chat.chat_id}</p>
                    {chat.bot_token && (
                      <p className="text-xs text-primary">
                        Custom Bot{chat.bot_username ? `: @${chat.bot_username}` : ""}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleTestChat(chat)}
                    disabled={testingId === chat.id}
                  >
                    {testingId === chat.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-loss hover:text-loss"
                    onClick={() => removeChat.mutate(chat.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Notification Routing Panel */}
              <NotificationRoutingPanel
                chat={chat}
                onToggleType={toggleNotificationType}
                onToggleAll={toggleNotificationAll}
              />
            </div>
          ))}
        </div>

        {/* Add new chat */}
        <div className="p-4 rounded-lg border border-dashed border-border bg-accent/30">
          <p className="text-xs text-muted-foreground mb-3">Add a new Chat ID</p>
          <div className="flex gap-2">
            <Input
              value={newChatId}
              onChange={(e) => setNewChatId(e.target.value)}
              placeholder="Chat ID (e.g. 123456789)"
              className="flex-1 bg-card border-border"
            />
            <Input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Label (e.g. My Group)"
              className="w-48 bg-card border-border"
            />
            <Button
              onClick={handleAddChat}
              disabled={adding || !newChatId.trim()}
              className="gap-1"
            >
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add
            </Button>
          </div>

          {/* Custom Bot Toggle */}
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setShowCustomBot(!showCustomBot)}
              className="text-xs text-primary hover:underline"
            >
              {showCustomBot ? "− Hide custom bot settings" : "+ Use your own bot (optional)"}
            </button>
            {showCustomBot && (
              <div className="mt-2 space-y-2 p-3 rounded-lg border border-border bg-card">
                <p className="text-xs text-muted-foreground">
                  Create a bot via <a href="https://t.me/BotFather" target="_blank" rel="noopener" className="text-primary hover:underline">@BotFather</a>, then paste the token here. This bot will be used only for this chat destination.
                </p>
                <div className="space-y-2">
                  <Label className="text-xs">Bot Token</Label>
                  <Input
                    value={newBotToken}
                    onChange={(e) => setNewBotToken(e.target.value)}
                    placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                    className="bg-accent border-border text-xs font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Bot Username (optional)</Label>
                  <Input
                    value={newBotUsername}
                    onChange={(e) => setNewBotUsername(e.target.value)}
                    placeholder="@MyTradingBot"
                    className="bg-accent border-border text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 text-xs text-muted-foreground space-y-1">
            <p>How to find your Chat ID:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li><strong>Personal:</strong> Send /start to your bot, then message <a href="https://t.me/userinfobot" target="_blank" rel="noopener" className="text-primary hover:underline">@userinfobot</a> to get your ID</li>
              <li><strong>Group:</strong> Add the bot to your group, send any message, then use <a href="https://api.telegram.org" target="_blank" rel="noopener" className="text-primary hover:underline">getUpdates</a></li>
              <li><strong>Channel:</strong> Add the bot as admin, use the channel's Chat ID (starts with -100)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      {chats.length > 0 && (
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="outline"
            onClick={handleTestAll}
            disabled={testingAll}
            className="gap-2"
          >
            {testingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Test All ({chats.length})
          </Button>
          <Button
            variant="ghost"
            onClick={handleRemoveAll}
            disabled={removingAll}
            className="gap-2 text-loss hover:text-loss"
          >
            {removingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unplug className="w-4 h-4" />}
            Remove All
          </Button>
        </div>
      )}

      {/* Delivery Log */}
      <div className="mb-6">
        <button
          onClick={() => setShowDeliveryLog(!showDeliveryLog)}
          className="w-full flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Delivery Log (Last 10)</span>
            {deliveryLogs.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {deliveryLogs.filter((l) => !l.success).length > 0 && (
                  <span className="text-loss">
                    {deliveryLogs.filter((l) => !l.success).length} failed
                  </span>
                )}
                {deliveryLogs.filter((l) => !l.success).length === 0 && (
                  <span className="text-profit">All passed</span>
                )}
              </Badge>
            )}
          </div>
          {showDeliveryLog ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        {showDeliveryLog && (
          <div className="mt-3 p-3 rounded-lg border border-border bg-accent/20">
            <DeliveryLogPanel logs={deliveryLogs} isLoading={logsLoading} />
          </div>
        )}
      </div>

      {/* Notification Mode */}
      <div>
        <h4 className="font-medium text-sm mb-3">Notification Mode</h4>
        <div className="p-4 rounded-lg border border-border bg-card flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">RA Public Mode</p>
            <p className="text-xs text-muted-foreground">Hide quantity/lots in public notifications and add compliance disclaimer</p>
          </div>
          <Switch
            checked={settings?.ra_public_mode ?? false}
            onCheckedChange={(checked) => updateSettings.mutate({ ra_public_mode: checked } as any)}
          />
        </div>

        {settings?.ra_public_mode && (
          <div className="mt-3 p-4 rounded-lg border border-border bg-card">
            <Label htmlFor="ra-disclaimer" className="text-sm font-medium">Disclaimer Text</Label>
            <p className="text-xs text-muted-foreground mb-2">Appended to all public notifications</p>
            <Input
              id="ra-disclaimer"
              value={settings?.ra_disclaimer || ""}
              onChange={(e) => updateSettings.mutate({ ra_disclaimer: e.target.value } as any)}
              placeholder="SEBI registered RA. Consult your advisor before investing."
              className="bg-accent border-border"
            />
          </div>
        )}
      </div>
    </div>
  );
}
