import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play } from "lucide-react";

interface VideoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VideoModal({ open, onOpenChange }: VideoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-2xl border-border/40 bg-card">
        {/* macOS-style window chrome */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/30 bg-gradient-to-b from-muted/20 to-muted/10">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF605C]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD44]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#00CA4E]" />
          </div>
          <DialogHeader className="flex-1 py-0">
            <DialogTitle className="text-xs text-muted-foreground font-medium text-center">
              TradeBook — Product Walkthrough
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Video placeholder */}
        <div className="relative aspect-video bg-muted/20 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-[hsl(var(--tb-accent)/0.1)] border border-[hsl(var(--tb-accent)/0.2)] flex items-center justify-center mx-auto">
              <Play className="w-8 h-8 text-[hsl(var(--tb-accent))] ml-1" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">Demo Video Coming Soon</p>
              <p className="text-sm text-muted-foreground mt-1">
                A 2-minute walkthrough of TradeBook's key features
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
