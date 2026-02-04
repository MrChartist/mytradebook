import {
  FileText,
  Calendar,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  Award,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const performanceByPattern = [
  { name: "Cup & Handle", trades: 12, winRate: 75, pnl: 45000 },
  { name: "Double Bottom", trades: 8, winRate: 62.5, pnl: 22000 },
  { name: "Breakout", trades: 15, winRate: 60, pnl: 35000 },
  { name: "Pullback", trades: 10, winRate: 70, pnl: 28000 },
  { name: "Gap & Go", trades: 6, winRate: 50, pnl: 8000 },
];

const mistakeAnalysis = [
  { name: "FOMO Entry", count: 8, impact: -25000 },
  { name: "Moved SL", count: 5, impact: -18000 },
  { name: "Early Exit", count: 4, impact: -12000 },
  { name: "Oversize", count: 3, impact: -15000 },
  { name: "No Plan", count: 2, impact: -8000 },
];

const winLossData = [
  { name: "Wins", value: 68, color: "hsl(142, 71%, 45%)" },
  { name: "Losses", value: 32, color: "hsl(0, 84%, 60%)" },
];

const weeklyData = [
  { week: "W1", pnl: 25000 },
  { week: "W2", pnl: -8000 },
  { week: "W3", pnl: 32000 },
  { week: "W4", pnl: 18000 },
  { week: "W5", pnl: -12000 },
  { week: "W6", pnl: 45000 },
];

export default function Journal() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Journal</h1>
          <p className="text-muted-foreground">
            Analyze your trading performance and patterns
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm font-medium rounded-lg bg-primary/10 text-primary border border-primary/20">
            Dashboard
          </button>
          <button className="px-4 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:bg-accent transition-colors">
            <Calendar className="w-4 h-4 inline mr-2" />
            Calendar
          </button>
          <button className="px-4 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:bg-accent transition-colors">
            <AlertTriangle className="w-4 h-4 inline mr-2" />
            Mistakes
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-profit" />
            <p className="text-sm text-muted-foreground">Total Profit</p>
          </div>
          <p className="text-2xl font-bold text-profit">+₹1,38,000</p>
          <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-primary" />
            <p className="text-sm text-muted-foreground">Win Rate</p>
          </div>
          <p className="text-2xl font-bold">68%</p>
          <p className="text-xs text-muted-foreground mt-1">34/50 trades</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-warning" />
            <p className="text-sm text-muted-foreground">Best Pattern</p>
          </div>
          <p className="text-2xl font-bold">Cup & Handle</p>
          <p className="text-xs text-profit mt-1">75% win rate</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-loss" />
            <p className="text-sm text-muted-foreground">Top Mistake</p>
          </div>
          <p className="text-2xl font-bold">FOMO Entry</p>
          <p className="text-xs text-loss mt-1">-₹25,000 impact</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Win/Loss Ratio */}
        <div className="glass-card p-5">
          <h3 className="font-semibold mb-4">Win/Loss Ratio</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={winLossData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {winLossData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-profit" />
              <span className="text-sm text-muted-foreground">
                Wins (68%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-loss" />
              <span className="text-sm text-muted-foreground">
                Losses (32%)
              </span>
            </div>
          </div>
        </div>

        {/* Weekly P&L */}
        <div className="glass-card p-5 lg:col-span-2">
          <h3 className="font-semibold mb-4">Weekly P&L</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis
                  dataKey="week"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }}
                  tickFormatter={(value) =>
                    `${value >= 0 ? "+" : ""}₹${(value / 1000).toFixed(0)}k`
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(222, 47%, 10%)",
                    border: "1px solid hsl(222, 47%, 16%)",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [
                    `₹${value.toLocaleString()}`,
                    "P&L",
                  ]}
                />
                <Bar
                  dataKey="pnl"
                  radius={[4, 4, 0, 0]}
                  fill="hsl(217, 91%, 60%)"
                >
                  {weeklyData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.pnl >= 0
                          ? "hsl(142, 71%, 45%)"
                          : "hsl(0, 84%, 60%)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pattern Performance & Mistakes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pattern Performance */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Pattern Performance</h3>
            <span className="text-sm text-muted-foreground">Last 30 days</span>
          </div>
          <div className="space-y-3">
            {performanceByPattern.map((pattern) => (
              <div
                key={pattern.name}
                className="flex items-center justify-between p-3 rounded-lg bg-accent/50"
              >
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <div>
                    <p className="font-medium">{pattern.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {pattern.trades} trades
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={cn(
                      "font-semibold",
                      pattern.winRate >= 60 ? "text-profit" : "text-warning"
                    )}
                  >
                    {pattern.winRate}%
                  </p>
                  <p className="text-xs text-profit">
                    +₹{pattern.pnl.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mistake Analysis */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Mistake Analysis</h3>
            <span className="text-sm text-muted-foreground">Impact</span>
          </div>
          <div className="space-y-3">
            {mistakeAnalysis.map((mistake) => (
              <div
                key={mistake.name}
                className="flex items-center justify-between p-3 rounded-lg bg-loss/5 border border-loss/10"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-loss" />
                  <div>
                    <p className="font-medium">{mistake.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {mistake.count} occurrences
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-loss">
                  ₹{Math.abs(mistake.impact).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
