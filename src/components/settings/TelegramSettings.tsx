import { useState } from "react";
import {
  MessageCircle, Send, Trash2, Plus, CheckCircle, Loader2,
  ExternalLink, Filter, Unplug, AlertTriangle, ChevronDown, ChevronUp, History,
  BarChart3, Bell, BookOpen, FileText, Circle, HelpCircle, Bot,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useTelegramChats, SEGMENT_LABELS, type TelegramChat, type NotificationTypeRouting, DEFAULT_NOTIFICATION_TYPES } from "@/hooks/useTelegramChats";
import { useUserSettings } from "@/hooks/useUserSettings";
import { DeliveryLogPanel } from "@/components/telegram/DeliveryLogPanel";

const SEGMENT_KEYS = Object.keys(SEGMENT_LABELS);

// --- Bot Source Badge ---
function BotSourceBadge({ chat, hasPersonalBot }: { chat: TelegramChat; hasPersonalBot: boolean }) {
  if (chat.bot_username) {
    return <Badge className="text-[9px] bg-sky-500/10 text-sky-400 border-sky-500/30">Custom Bot</Badge>;
  }
  if (hasPersonalBot) {
    return <Badge className="text-[9px] bg-profit/10 text-profit border-profit/30">Your Default Bot</Badge>;
  }
  return <Badge className="text-[9px] bg-amber-500/10 text-amber-400 border-amber-500/30">System Bot</Badge>;
}

// --- Connection Status Dot ---
function ConnectionStatusDot({ chat }: { chat: TelegramChat }) {
  const status = chat.verification_status;
  const lastVerified = chat.last_verified_at ? new Date(chat.last_verified_at) : null;
  const now = new Date();
  const hoursSinceVerified = lastVerified ? (now.getTime() - lastVerified.getTime()) / (1000 * 60 * 60) : Infinity;

  if (status === "failed") {
    return (
      <span title="Last delivery failed" className="flex items-center gap-1">
        <Circle className="w-2.5 h-2.5 fill-loss text-loss" />
      </span>
    );
  }
  if (status === "verified" && hoursSinceVerified <= 24) {
    return (
      <span title={`Verified ${lastVerified?.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`} className="flex items-center gap-1">
        <Circle className="w-2.5 h-2.5 fill-profit text-profit" />
      </span>
    );
  }
  if (status === "verified" && hoursSinceVerified > 24) {
    return (
      <span title="Verified >24h ago" className="flex items-center gap-1">
        <Circle className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
      </span>
    );
  }
  return (
    <span title="Not yet verified" className="flex items-center gap-1">
      <Circle className="w-2.5 h-2.5 fill-muted-foreground/30 text-muted-foreground/30" />
    </span>
  );
}

// --- Chat ID Help Guide ---
function ChatIdHelpGuide() {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-1.5 text-xs text-primary hover:underline mt-3">
        <HelpCircle className="w-3.5 h-3.5" />
        How to find your Chat ID?
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 p-3 rounded-lg border border-border bg-card text-xs text-muted-foreground space-y-3">
        {/* Personal */}
        <div>
          <p className="font-semibold text-foreground mb-1">📱 Personal Chat</p>
          <ol className="list-decimal list-inside space-y-0.5 ml-1">
            <li>Open Telegram and search for <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@userinfobot</a></li>
            <li>Send <code className="bg-accent px-1 rounded">/start</code> — it will reply with your Chat ID</li>
            <li>Your ID is a positive number (e.g. <code className="bg-accent px-1 rounded">123456789</code>)</li>
          </ol>
        </div>
        {/* Group */}
        <div>
          <p className="font-semibold text-foreground mb-1">👥 Group Chat</p>
          <ol className="list-decimal list-inside space-y-0.5 ml-1">
            <li>Add your bot to the group</li>
            <li>Send any message in the group</li>
            <li>Forward any group message to <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@userinfobot</a> — it will reply with the group Chat ID</li>
            <li>Group IDs start with <code className="bg-accent px-1 rounded">-</code> (e.g. <code className="bg-accent px-1 rounded">-987654321</code>)</li>
          </ol>
        </div>
        {/* Channel */}
        <div>
          <p className="font-semibold text-foreground mb-1">📢 Channel</p>
          <ol className="list-decimal list-inside space-y-0.5 ml-1">
            <li>Add your bot as an <strong>admin</strong> to the channel</li>
            <li>Forward any channel post to <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@userinfobot</a></li>
            <li>Channel IDs start with <code className="bg-accent px-1 rounded">-100</code> (e.g. <code className="bg-accent px-1 rounded">-1001234567890</code>)</li>
          </ol>
        </div>
        <div className="p-2 rounded bg-amber-500/5 border border-amber-500/20 flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
          <p><strong className="text-amber-400">Important:</strong> Chat IDs are numbers only. Make sure the bot has been added to the group/channel <em>before</em> testing.</p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

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
                        const allExcept = SEGMENT_KEYS.filter((s) => s !== seg);
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
  const { chats, isLoading, deliveryLogs, logsLoading, addChat, removeChat, removeAllChats, toggleSegment, toggleNotificationType, toggleNotificationAll, testChat, testAllChats, verifyBotToken } = useTelegramChats();

  // Add chat form
  const [newChatId, setNewChatId] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newBotToken, setNewBotToken] = useState("");
  const [showCustomBot, setShowCustomBot] = useState(false);
  const [adding, setAdding] = useState(false);

  // Bot config form
  const [editingBot, setEditingBot] = useState(false);
  const [botTokenInput, setBotTokenInput] = useState("");
  const [savingBot, setSavingBot] = useState(false);
  const [verifyingBot, setVerifyingBot] = useState(false);
  const [verifiedBotInfo, setVerifiedBotInfo] = useState<{ username: string; first_name: string } | null>(null);
  const [testingBot, setTestingBot] = useState(false);

  // Testing state
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testingAll, setTestingAll] = useState(false);
  const [removingAll, setRemovingAll] = useState(false);

  // Delivery log panel state
  const [showDeliveryLog, setShowDeliveryLog] = useState(false);

  const hasPersonalBot = !!settings?.telegram_bot_username;

  // Auto-verify bot token when pasted
  const handleBotTokenChange = async (token: string) => {
    setBotTokenInput(token);
    setVerifiedBotInfo(null);

    // Auto-verify if it looks like a valid token format (number:alphanumeric)
    if (/^\d+:[A-Za-z0-9_-]{30,}$/.test(token.trim())) {
      setVerifyingBot(true);
      const result = await verifyBotToken(token.trim());
      setVerifyingBot(false);
      if (result.success && result.bot) {
        setVerifiedBotInfo(result.bot);
      }
    }
  };

  const handleSaveBot = async () => {
    if (!botTokenInput.trim()) return;
    setSavingBot(true);
    try {
      // Verify first if not already verified
      if (!verifiedBotInfo) {
        setVerifyingBot(true);
        const result = await verifyBotToken(botTokenInput.trim());
        setVerifyingBot(false);
        if (!result.success) {
          toast.error(result.error || "Invalid bot token — please check and try again");
          setSavingBot(false);
          return;
        }
        setVerifiedBotInfo(result.bot!);
      }

      await updateSettings.mutateAsync({
        telegram_bot_token: botTokenInput.trim(),
        telegram_bot_username: verifiedBotInfo?.username || null,
      } as any);
      setEditingBot(false);
      setBotTokenInput("");
      setVerifiedBotInfo(null);
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
    if (!settings?.telegram_bot_username) return;
    setTestingBot(true);
    const firstChat = chats[0];
    if (firstChat) {
      await testChat(firstChat.chat_id);
    }
    setTestingBot(false);
  };

  const handleAddChat = async () => {
    if (!newChatId.trim()) return;
    setAdding(true);
    try {
      await addChat.mutateAsync({
        chat_id: newChatId.trim(),
        label: newLabel.trim(),
        bot_token: newBotToken.trim() || undefined,
      });
      setNewChatId("");
      setNewLabel("");
      setNewBotToken("");
      setShowCustomBot(false);
    } finally {
      setAdding(false);
    }
  };

  const handleTestChat = async (chat: TelegramChat) => {
    setTestingId(chat.id);
    await testChat(chat.chat_id);
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
      <div className="premium-card-hover p-6 flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="premium-card-hover p-6">
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
                  Bot verified{settings?.telegram_bot_username ? `: @${settings.telegram_bot_username}` : ""}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleTestBot} disabled={testingBot || chats.length === 0}>
                  {testingBot ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Send className="w-3 h-3 mr-1" />}
                  Test
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setEditingBot(true); setBotTokenInput(""); setVerifiedBotInfo(null); }}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-loss hover:text-loss" onClick={handleRemoveBot} disabled={savingBot}>
                  Remove
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Bot: @{settings?.telegram_bot_username}</p>
          </div>
        ) : (
          <div className="p-4 rounded-lg border border-border bg-card space-y-3">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                <strong>Step 1:</strong> Open Telegram and search for <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">@BotFather</a>
              </p>
              <p className="text-xs text-muted-foreground">
                <strong>Step 2:</strong> Send <code className="bg-accent px-1 rounded">/newbot</code>, follow prompts to name your bot
              </p>
              <p className="text-xs text-muted-foreground">
                <strong>Step 3:</strong> Copy the token BotFather gives you and paste it below
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Bot Token</Label>
              <div className="relative">
                <Input
                  value={botTokenInput}
                  onChange={(e) => handleBotTokenChange(e.target.value)}
                  placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                  className="bg-accent border-border text-xs font-mono pr-10"
                />
                {verifyingBot && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                )}
                {verifiedBotInfo && !verifyingBot && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <CheckCircle className="w-4 h-4 text-profit" />
                  </div>
                )}
              </div>
              {verifiedBotInfo && (
                <div className="flex items-center gap-2 text-xs text-profit">
                  <Bot className="w-3.5 h-3.5" />
                  <span>Verified: @{verifiedBotInfo.username} ({verifiedBotInfo.first_name})</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleSaveBot} disabled={savingBot || verifyingBot || !botTokenInput.trim()} size="sm" className="gap-1">
                {savingBot || verifyingBot ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                Save & Verify
              </Button>
              {editingBot && (
                <Button variant="ghost" size="sm" onClick={() => { setEditingBot(false); setBotTokenInput(""); setVerifiedBotInfo(null); }}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}

        {!hasPersonalBot && !editingBot && (
          <div className="mt-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                <strong className="text-amber-400">No personal bot configured.</strong> Messages are currently sent via the shared system bot. For independent, reliable delivery, configure your own bot above.
              </p>
            </div>
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
          Add your personal chat, group chats, or channel IDs. Each chat is verified on add.
        </p>

        {/* Existing chats */}
        <div className="space-y-3 mb-4">
          {chats.map((chat) => (
            <div key={chat.id} className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ConnectionStatusDot chat={chat} />
                  <MessageCircle className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{chat.label}</p>
                      <BotSourceBadge chat={chat} hasPersonalBot={hasPersonalBot} />
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">{chat.chat_id}</p>
                    {chat.bot_username && (
                      <p className="text-xs text-sky-400">@{chat.bot_username}</p>
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
          <p className="text-xs text-muted-foreground mb-3">Add a new Chat ID — a test message will be sent to verify the connection.</p>
          <div className="flex gap-2">
            <Input
              value={newChatId}
              onChange={(e) => setNewChatId(e.target.value)}
              placeholder="Chat ID (e.g. 123456789 or -1001234567890)"
              className="flex-1 bg-card border-border"
            />
            <Input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Label (auto-detected if empty)"
              className="w-48 bg-card border-border"
            />
            <Button
              onClick={handleAddChat}
              disabled={adding || !newChatId.trim()}
              className="gap-1"
            >
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {adding ? "Verifying..." : "Connect & Verify"}
            </Button>
          </div>

          {/* Custom Bot Toggle */}
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setShowCustomBot(!showCustomBot)}
              className="text-xs text-primary hover:underline"
            >
              {showCustomBot ? "− Hide custom bot settings" : "+ Use a different bot for this chat (optional)"}
            </button>
            {showCustomBot && (
              <div className="mt-2 space-y-2 p-3 rounded-lg border border-border bg-card">
                <p className="text-xs text-muted-foreground">
                  Use a separate bot token for this specific chat. Create one via <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@BotFather</a>.
                </p>
                <div className="space-y-2">
                  <Label className="text-xs">Bot Token (for this chat only)</Label>
                  <Input
                    value={newBotToken}
                    onChange={(e) => setNewBotToken(e.target.value)}
                    placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                    className="bg-accent border-border text-xs font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Chat ID Help Guide */}
          <ChatIdHelpGuide />
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
            <span className="text-sm font-medium">Delivery Log (Last 50)</span>
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
