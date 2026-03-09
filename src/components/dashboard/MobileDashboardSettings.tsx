import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Settings2, Focus, LayoutGrid } from "lucide-react";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function MobileDashboardSettings() {
  const { focusMode, setFocusMode, density, setDensity } = useDashboardLayout();

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Settings2 className="w-5 h-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Dashboard Settings</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2"><Focus className="w-4 h-4"/> Focus Mode</Label>
              <p className="text-xs text-muted-foreground">Show only essential widgets</p>
            </div>
            <Switch checked={focusMode} onCheckedChange={setFocusMode} />
          </div>
          
          <div className="space-y-3">
            <Label className="flex items-center gap-2"><LayoutGrid className="w-4 h-4"/> Density</Label>
            <div className="flex gap-2">
              {(["compact", "comfortable", "spacious"] as const).map(d => (
                <Button 
                  key={d} 
                  variant={density === d ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setDensity(d)}
                  className="flex-1 capitalize"
                >
                  {d}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}