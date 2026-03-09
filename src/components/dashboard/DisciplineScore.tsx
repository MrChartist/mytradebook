import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck } from "lucide-react";

export function DisciplineScore() {
  const score = 85;
  
  return (
    <Card>
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          Discipline Score
        </CardTitle>
        <span className="text-2xl font-bold text-primary">{score}</span>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Progress value={score} className="h-2 mb-2" />
        <p className="text-xs text-muted-foreground">Based on rules adherence, review completion, and journaling.</p>
      </CardContent>
    </Card>
  );
}