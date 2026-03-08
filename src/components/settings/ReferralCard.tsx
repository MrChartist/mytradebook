import { Copy, Gift, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReferral } from "@/hooks/useReferral";
import { toast } from "sonner";

export default function ReferralCard() {
  const { referralLink, totalReferred, successfulReferrals } = useReferral();

  const handleCopy = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      toast.success("Referral link copied!");
    }
  };

  return (
    <div className="surface-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Gift className="w-4.5 h-4.5 text-primary" />
        </div>
        <div>
          <h3 className="text-base font-semibold">Referral Program</h3>
          <p className="text-xs text-muted-foreground">Invite friends, earn 30 extra trial days per signup</p>
        </div>
      </div>

      {referralLink && (
        <div className="flex gap-2">
          <div className="flex-1 bg-muted/50 rounded-lg px-3 py-2 text-sm text-muted-foreground truncate border border-border">
            {referralLink}
          </div>
          <Button variant="outline" size="icon" onClick={handleCopy} className="shrink-0">
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="flex gap-4">
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{totalReferred}</span>
          <span className="text-muted-foreground">referred</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-gain">{successfulReferrals}</span>
          <span className="text-muted-foreground">signed up</span>
        </div>
      </div>
    </div>
  );
}
