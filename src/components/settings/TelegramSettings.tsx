import { useState } from "react";
import {
  MessageCircle, Send, Trash2, Plus, CheckCircle, Loader2,
  ExternalLink, Filter, Unplug, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTelegramChats, SEGMENT_LABELS, type TelegramChat } from "@/hooks/useTelegramChats";
import { useUserSettings } from "@/hooks/useUserSettings";

export default function TelegramSettings() {
  const { settings, updateSettings } = useUserSettings();
  const { chats, isLoading, addChat, removeChat, removeAllChats, toggleSegment, testChat, testAllChats } = useTelegramChats();

  // Add chat form
  const [newChatId, setNewChatId] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [adding, setAdding] = useState(false);

  // Testing state
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testingAll, setTestingAll] = useState(false);
  const [removingAll, setRemovingAll] = useState(false);

  const handleAddChat = async () => {
    if (!newChatId.trim()) return;
    setAdding(true);
    try {
      await addChat.mutateAsync({
        chat_id: newChatId.trim(),
        label: newLabel.trim() || `Chat ${newChatId.trim()}`,
      });
      setNewChatId("");
      setNewLabel("");
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

        <div className="p-3 rounded-lg border border-profit/20 bg-profit/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-profit" />
              <span className="text-sm text-profit font-medium">
                Bot is configured via environment
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Uses TELEGRAM_BOT_TOKEN from backend
            </p>
          </div>
        </div>

        <div className="mt-2 p-3 rounded-lg bg-accent/50 border border-border">
          <p className="text-xs text-muted-foreground">
            <strong>Custom bot?</strong> You can override the bot per chat destination by setting a custom bot token when adding a chat.
            Create a bot via <a href="https://t.me/BotFather" target="_blank" rel="noopener" className="text-primary hover:underline">@BotFather</a>.
          </p>
        </div>
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

              {/* Segment chips */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Filter className="w-3 h-3" />
                  <span>Segments</span>
                </div>
                {Object.entries(SEGMENT_LABELS).map(([key, label]) => (
                  <Badge
                    key={key}
                    variant="outline"
                    className={cn(
                      "text-[10px] cursor-pointer transition-all select-none",
                      chat.segments.includes(key)
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-muted/50 border-border text-muted-foreground opacity-50"
                    )}
                    onClick={() => toggleSegment(chat.id, key, chat.segments)}
                  >
                    {label}
                  </Badge>
                ))}
              </div>
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

          <div className="mt-3 text-xs text-muted-foreground space-y-1">
            <p>How to find your Chat ID:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li><strong>Personal:</strong> Send /start to your bot, it will show your ID</li>
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
