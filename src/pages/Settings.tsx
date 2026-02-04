import { useState } from "react";
import {
  User,
  Bell,
  Smartphone,
  Link,
  Shield,
  Moon,
  Sun,
  Save,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const settingsSections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "integrations", label: "Integrations", icon: Link },
  { id: "preferences", label: "Preferences", icon: Moon },
  { id: "security", label: "Security", icon: Shield },
];

export default function Settings() {
  const [activeSection, setActiveSection] = useState("profile");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="glass-card p-2 lg:sticky lg:top-6">
            <nav className="space-y-1">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    activeSection === section.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <section.icon className="w-4 h-4" />
                  {section.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1 space-y-6">
          {activeSection === "profile" && (
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-xl font-bold">
                    JD
                  </div>
                  <Button variant="outline" size="sm">
                    Change Photo
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Full Name
                    </label>
                    <Input
                      defaultValue="John Doe"
                      className="bg-accent border-border"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Email
                    </label>
                    <Input
                      defaultValue="john@example.com"
                      className="bg-accent border-border"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Phone
                    </label>
                    <Input
                      defaultValue="+91 9876543210"
                      className="bg-accent border-border"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Role
                    </label>
                    <Input
                      defaultValue="Trader"
                      className="bg-accent border-border"
                      disabled
                    />
                  </div>
                </div>
                <Button className="bg-gradient-primary">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-4">
                Notification Preferences
              </h2>
              <div className="space-y-4">
                {[
                  {
                    title: "Price Alerts",
                    description: "Get notified when price conditions are met",
                  },
                  {
                    title: "Trade Execution",
                    description: "Notifications for SL/Target hits",
                  },
                  {
                    title: "Weekly Reports",
                    description: "Receive weekly performance summaries",
                  },
                  {
                    title: "Market News",
                    description: "Important market updates and news",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between p-4 rounded-lg bg-accent/50"
                  >
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "integrations" && (
            <div className="space-y-6">
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
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
                  <Button variant="outline" className="border-border">
                    Configure
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                <div className="p-3 rounded-lg bg-profit/10 border border-profit/20">
                  <p className="text-sm text-profit font-medium">
                    ✓ Connected
                  </p>
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
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
                  <Button variant="outline" className="border-border">
                    Connect
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                <div className="p-3 rounded-lg bg-accent">
                  <p className="text-sm text-muted-foreground">Not connected</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === "preferences" && (
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-4">App Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-accent/50">
                  <div className="flex items-center gap-3">
                    <Moon className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Dark Mode</p>
                      <p className="text-sm text-muted-foreground">
                        Always enabled for optimal viewing
                      </p>
                    </div>
                  </div>
                  <Switch defaultChecked disabled />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-accent/50">
                  <div>
                    <p className="font-medium">Default Segment</p>
                    <p className="text-sm text-muted-foreground">
                      Pre-select segment for new trades
                    </p>
                  </div>
                  <select className="bg-card border border-border rounded-lg px-3 py-2 text-sm">
                    <option>Equity Intraday</option>
                    <option>Equity Positional</option>
                    <option>Futures</option>
                    <option>Options</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-accent/50">
                  <div>
                    <p className="font-medium">Risk per Trade</p>
                    <p className="text-sm text-muted-foreground">
                      Maximum capital risk per trade
                    </p>
                  </div>
                  <select className="bg-card border border-border rounded-lg px-3 py-2 text-sm">
                    <option>1%</option>
                    <option>2%</option>
                    <option>3%</option>
                    <option>5%</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeSection === "security" && (
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-4">Security Settings</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-accent/50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-accent/50">
                  <p className="font-medium mb-2">Active Sessions</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Chrome on MacOS
                      </span>
                      <span className="text-profit">Current</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Safari on iPhone
                      </span>
                      <button className="text-loss hover:underline">
                        Revoke
                      </button>
                    </div>
                  </div>
                </div>
                <Button variant="destructive" className="w-full">
                  Log Out All Devices
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
