import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  maxDate?: Date;
  placeholder?: string;
  className?: string;
}

export function DateTimePicker({
  value,
  onChange,
  maxDate,
  placeholder = "Pick date & time",
  className,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [hours, setHours] = React.useState(() => value ? value.getHours() % 12 || 12 : 9);
  const [minutes, setMinutes] = React.useState(() => value ? value.getMinutes() : 15);
  const [ampm, setAmpm] = React.useState<"AM" | "PM">(() => value ? (value.getHours() >= 12 ? "PM" : "AM") : "AM");

  React.useEffect(() => {
    if (value && isValid(value)) {
      setHours(value.getHours() % 12 || 12);
      setMinutes(value.getMinutes());
      setAmpm(value.getHours() >= 12 ? "PM" : "AM");
    }
  }, [value]);

  const applyTime = (date: Date, h: number, m: number, ap: "AM" | "PM") => {
    const newDate = new Date(date);
    let hour24 = h % 12;
    if (ap === "PM") hour24 += 12;
    newDate.setHours(hour24, m, 0, 0);
    return newDate;
  };

  const handleDaySelect = (day: Date | undefined) => {
    if (!day) return;
    const withTime = applyTime(day, hours, minutes, ampm);
    onChange(withTime);
  };

  const handleTimeChange = (h: number, m: number, ap: "AM" | "PM") => {
    setHours(h);
    setMinutes(m);
    setAmpm(ap);
    if (value && isValid(value)) {
      const updated = applyTime(value, h, m, ap);
      onChange(updated);
    }
  };

  const displayValue = value && isValid(value)
    ? format(value, "dd/MM/yy  hh:mm a")
    : "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-10",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {displayValue || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {/* Calendar */}
          <Calendar
            mode="single"
            selected={value && isValid(value) ? value : undefined}
            onSelect={handleDaySelect}
            disabled={(date) => (maxDate ? date > maxDate : false)}
            initialFocus
          />
          {/* Time Picker */}
          <div className="border-l border-border p-3 flex flex-col gap-2 min-w-[100px]">
            <p className="text-xs font-medium text-muted-foreground text-center mb-1">Time</p>
            <div className="flex gap-1 items-center justify-center">
              {/* Hours */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground p-0.5"
                  onClick={() => { const h = hours >= 12 ? 1 : hours + 1; handleTimeChange(h, minutes, ampm); }}
                >▲</button>
                <span className="text-lg font-mono font-bold w-8 text-center">{String(hours).padStart(2, "0")}</span>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground p-0.5"
                  onClick={() => { const h = hours <= 1 ? 12 : hours - 1; handleTimeChange(h, minutes, ampm); }}
                >▼</button>
              </div>
              <span className="text-lg font-bold">:</span>
              {/* Minutes */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground p-0.5"
                  onClick={() => { const m = (minutes + 1) % 60; handleTimeChange(hours, m, ampm); }}
                >▲</button>
                <span className="text-lg font-mono font-bold w-8 text-center">{String(minutes).padStart(2, "0")}</span>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground p-0.5"
                  onClick={() => { const m = minutes <= 0 ? 59 : minutes - 1; handleTimeChange(hours, m, ampm); }}
                >▼</button>
              </div>
              {/* AM/PM */}
              <div className="flex flex-col items-center ml-1">
                <button
                  type="button"
                  className={cn(
                    "text-xs px-1.5 py-0.5 rounded font-medium",
                    ampm === "AM" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => handleTimeChange(hours, minutes, "AM")}
                >AM</button>
                <button
                  type="button"
                  className={cn(
                    "text-xs px-1.5 py-0.5 rounded font-medium mt-0.5",
                    ampm === "PM" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => handleTimeChange(hours, minutes, "PM")}
                >PM</button>
              </div>
            </div>
            <div className="flex gap-1 mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs flex-1 h-7"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
              >
                Clear
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs flex-1 h-7"
                onClick={() => {
                  const now = new Date();
                  if (maxDate && now > maxDate) {
                    onChange(maxDate);
                  } else {
                    onChange(now);
                  }
                  setOpen(false);
                }}
              >
                Now
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
