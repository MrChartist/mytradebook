 import { Switch } from "@/components/ui/switch";
 import { Label } from "@/components/ui/label";
 import { Badge } from "@/components/ui/badge";
 import { Radio, Send, Activity } from "lucide-react";
 import { cn } from "@/lib/utils";
 
 interface TradeAutomationControlsProps {
   autoTrackEnabled: boolean;
   onAutoTrackChange: (enabled: boolean) => void;
   telegramPostEnabled: boolean;
   onTelegramPostChange: (enabled: boolean) => void;
   className?: string;
 }
 
 export function TradeAutomationControls({
   autoTrackEnabled,
   onAutoTrackChange,
   telegramPostEnabled,
   onTelegramPostChange,
   className,
 }: TradeAutomationControlsProps) {
   return (
     <div className={cn("space-y-3 p-4 rounded-lg bg-primary/5 border border-primary/20", className)}>
       <div className="flex items-center gap-2 text-xs font-medium text-primary">
         <Activity className="w-3.5 h-3.5" />
         Automation
       </div>
 
       <div className="grid grid-cols-2 gap-4">
         {/* Auto Track Toggle */}
         <div
           className={cn(
             "flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer",
             autoTrackEnabled
               ? "bg-profit/10 border-profit/30"
               : "bg-muted/50 border-border hover:border-profit/30"
           )}
           onClick={() => onAutoTrackChange(!autoTrackEnabled)}
         >
           <div className="flex items-center gap-2">
             <Radio
               className={cn(
                 "w-4 h-4",
                 autoTrackEnabled ? "text-profit" : "text-muted-foreground"
               )}
             />
             <div>
               <Label className="text-xs font-medium cursor-pointer">
                 Auto Track
               </Label>
               <p className="text-[10px] text-muted-foreground">
                 Live price sync
               </p>
             </div>
           </div>
           <Switch
             checked={autoTrackEnabled}
             onCheckedChange={onAutoTrackChange}
             onClick={(e) => e.stopPropagation()}
           />
         </div>
 
         {/* Telegram Post Toggle */}
         <div
           className={cn(
             "flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer",
             telegramPostEnabled
               ? "bg-primary/10 border-primary/30"
               : "bg-muted/50 border-border hover:border-primary/30"
           )}
           onClick={() => onTelegramPostChange(!telegramPostEnabled)}
         >
           <div className="flex items-center gap-2">
             <Send
               className={cn(
                 "w-4 h-4",
                 telegramPostEnabled ? "text-primary" : "text-muted-foreground"
               )}
             />
             <div>
               <Label className="text-xs font-medium cursor-pointer">
                 Post to Telegram
               </Label>
               <p className="text-[10px] text-muted-foreground">
                 Share trade
               </p>
             </div>
           </div>
           <Switch
             checked={telegramPostEnabled}
             onCheckedChange={onTelegramPostChange}
             onClick={(e) => e.stopPropagation()}
           />
         </div>
       </div>
 
       {(autoTrackEnabled || telegramPostEnabled) && (
         <div className="flex flex-wrap gap-1.5 pt-1">
           {autoTrackEnabled && (
             <Badge variant="outline" className="text-[10px] text-profit border-profit/30">
               <Radio className="w-2.5 h-2.5 mr-1" />
               SL/Target alerts enabled
             </Badge>
           )}
           {telegramPostEnabled && (
             <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
               <Send className="w-2.5 h-2.5 mr-1" />
               Will post on create
             </Badge>
           )}
         </div>
       )}
     </div>
   );
 }