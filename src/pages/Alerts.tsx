import { useState } from "react";
import {
  Bell,
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  Percent,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  symbol: string;
  conditionType: "PRICE_GT" | "PRICE_LT" | "PERCENT_CHANGE";
  threshold: number;
  currentPrice: number;
  active: boolean;
  createdAt: string;
  triggeredAt?: string;
}

const alerts: Alert[] = [
  {
    id: "1",
    symbol: "RELIANCE",
    conditionType: "PRICE_GT",
    threshold: 2520,
    currentPrice: 2485,
    active: true,
    createdAt: "2025-02-01",
  },
  {
    id: "2",
    symbol: "NIFTY 50",
    conditionType: "PRICE_LT",
    threshold: 21800,
    currentPrice: 22150,
    active: true,
    createdAt: "2025-02-01",
  },
  {
    id: "3",
    symbol: "BANKNIFTY",
    conditionType: "PERCENT_CHANGE",
    threshold: 2,
    currentPrice: 48650,
    active: true,
    createdAt: "2025-01-30",
    triggeredAt: "2025-02-03T10:30:00",
  },
  {
    id: "4",
    symbol: "TCS",
    conditionType: "PRICE_GT",
    threshold: 4000,
    currentPrice: 3920,
    active: false,
    createdAt: "2025-01-28",
  },
  {
    id: "5",
    symbol: "HDFC BANK",
    conditionType: "PRICE_LT",
    threshold: 1650,
    currentPrice: 1680,
    active: true,
    createdAt: "2025-01-25",
  },
];

const conditionLabels = {
  PRICE_GT: "Price Above",
  PRICE_LT: "Price Below",
  PERCENT_CHANGE: "% Change",
};

const conditionIcons = {
  PRICE_GT: TrendingUp,
  PRICE_LT: TrendingDown,
  PERCENT_CHANGE: Percent,
};

export default function Alerts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [localAlerts, setLocalAlerts] = useState(alerts);

  const toggleAlert = (id: string) => {
    setLocalAlerts(
      localAlerts.map((alert) =>
        alert.id === id ? { ...alert, active: !alert.active } : alert
      )
    );
  };

  const filteredAlerts = localAlerts.filter((alert) =>
    alert.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = filteredAlerts.filter((a) => a.active).length;
  const triggeredCount = filteredAlerts.filter((a) => a.triggeredAt).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Alerts</h1>
          <p className="text-muted-foreground">
            Monitor price and technical conditions
          </p>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4 mr-2" />
          New Alert
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground">Total Alerts</p>
          <p className="text-2xl font-bold">{filteredAlerts.length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-profit">{activeCount}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground">Triggered Today</p>
          <p className="text-2xl font-bold text-warning">{triggeredCount}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground">Paused</p>
          <p className="text-2xl font-bold text-muted-foreground">
            {filteredAlerts.length - activeCount}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by symbol..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-card border-border"
        />
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const ConditionIcon = conditionIcons[alert.conditionType];
          const isTriggered = !!alert.triggeredAt;

          return (
            <div
              key={alert.id}
              className={cn(
                "glass-card p-4 transition-all",
                isTriggered && "border-warning/30 bg-warning/5",
                !alert.active && "opacity-60"
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      alert.conditionType === "PRICE_GT" &&
                        "bg-profit/10 text-profit",
                      alert.conditionType === "PRICE_LT" &&
                        "bg-loss/10 text-loss",
                      alert.conditionType === "PERCENT_CHANGE" &&
                        "bg-warning/10 text-warning"
                    )}
                  >
                    <ConditionIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{alert.symbol}</h3>
                      {isTriggered && (
                        <span className="px-2 py-0.5 rounded-full bg-warning/20 text-warning text-xs font-medium">
                          TRIGGERED
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {conditionLabels[alert.conditionType]}:{" "}
                      {alert.conditionType === "PERCENT_CHANGE"
                        ? `${alert.threshold}%`
                        : `₹${alert.threshold.toLocaleString()}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      Current Price
                    </p>
                    <p className="font-mono font-semibold">
                      ₹{alert.currentPrice.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleAlert(alert.id)}
                      className="p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      {alert.active ? (
                        <ToggleRight className="w-6 h-6 text-profit" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-muted-foreground" />
                      )}
                    </button>
                    <button className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-loss/10 transition-colors text-muted-foreground hover:text-loss">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="glass-card p-12 text-center">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No alerts found</h3>
          <p className="text-muted-foreground mb-4">
            Create alerts to get notified when price conditions are met
          </p>
          <Button className="bg-gradient-primary">
            <Plus className="w-4 h-4 mr-2" />
            Create Alert
          </Button>
        </div>
      )}
    </div>
  );
}
