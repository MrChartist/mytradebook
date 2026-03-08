import { useParams } from "react-router-dom";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { User, BarChart3, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/SEOHead";

export default function PublicProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { publicProfile, isLoading } = usePublicProfile(userId);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!publicProfile || !publicProfile.is_public) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <User className="w-12 h-12 text-muted-foreground mx-auto" />
          <h1 className="text-xl font-semibold">Profile Not Found</h1>
          <p className="text-muted-foreground">This trader profile is private or doesn't exist.</p>
        </div>
      </div>
    );
  }

  const stats = publicProfile.monthly_stats || {};

  return (
    <>
      <SEOHead
        title={`${publicProfile.display_name || "Trader"} — TradeBook`}
        description={publicProfile.bio || "View this trader's public profile on TradeBook."}
      />
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center mx-auto ring-4 ring-background">
              {publicProfile.avatar_url ? (
                <img src={publicProfile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-primary-foreground">
                  {publicProfile.display_name?.charAt(0).toUpperCase() || "T"}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold">{publicProfile.display_name || "Trader"}</h1>
            {publicProfile.bio && (
              <p className="text-muted-foreground max-w-md mx-auto">{publicProfile.bio}</p>
            )}
            <Badge variant="secondary" className="text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              Public Profile
            </Badge>
          </div>

          {/* Stats */}
          {Object.keys(stats).length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(stats as Record<string, string | number>).win_rate !== undefined && (
                <div className="surface-card p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{String((stats as Record<string, unknown>).win_rate)}%</p>
                  <p className="text-xs text-muted-foreground">Win Rate</p>
                </div>
              )}
              {(stats as Record<string, unknown>).total_trades !== undefined && (
                <div className="surface-card p-4 text-center">
                  <p className="text-2xl font-bold">{String((stats as Record<string, unknown>).total_trades)}</p>
                  <p className="text-xs text-muted-foreground">Total Trades</p>
                </div>
              )}
              {(stats as Record<string, unknown>).streak !== undefined && (
                <div className="surface-card p-4 text-center">
                  <p className="text-2xl font-bold text-gain">{String((stats as Record<string, unknown>).streak)}</p>
                  <p className="text-xs text-muted-foreground">Win Streak</p>
                </div>
              )}
              {(stats as Record<string, unknown>).avg_rr !== undefined && (
                <div className="surface-card p-4 text-center">
                  <p className="text-2xl font-bold">{String((stats as Record<string, unknown>).avg_rr)}</p>
                  <p className="text-xs text-muted-foreground">Avg R:R</p>
                </div>
              )}
            </div>
          )}

          {/* Disclaimer */}
          {publicProfile.disclaimer && (
            <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 border border-border">
              <strong>Disclaimer:</strong> {publicProfile.disclaimer}
            </div>
          )}

          {/* Regulatory notice */}
          <div className="text-center">
            <span className="text-[10px] text-muted-foreground/50 bg-muted/20 border border-border/20 rounded-full px-3 py-1">
              Not SEBI registered · For educational purposes only
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
