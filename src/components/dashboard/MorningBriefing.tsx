import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Sun, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MorningBriefing() {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-primary">
          <Sun className="w-4 h-4" />
          Morning Briefing
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        <p className="text-sm">Markets are expected to open with a gap up. Global cues are positive. Watch for NIFTY resistance at 22,500.</p>
        <div className="flex items-center gap-2 text-xs">
          <span className="bg-card px-2 py-1 rounded border">NIFTY: Bullish</span>
          <span className="bg-card px-2 py-1 rounded border">BANKNIFTY: Neutral</span>
        </div>
        <Button variant="link" size="sm" className="px-0 h-auto text-xs text-primary">Read full outlook <ArrowRight className="w-3 h-3 ml-1"/></Button>
      </CardContent>
    </Card>
  );
}