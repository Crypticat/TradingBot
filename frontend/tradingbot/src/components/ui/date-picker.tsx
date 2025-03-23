"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export type DatePickerProps = {
  date?: Date;
  setDate?: (date?: Date) => void;
  mode?: "single" | "range" | "multiple";
  selected?: Date | Date[] | undefined;
  onSelect?: (date?: Date | Date[] | undefined) => void;
  disabled?: boolean;
  initialFocus?: boolean;
  className?: string;
  styles?: {
    [key: string]: string;
  };
}

export function DatePicker({
  date,
  setDate,
  mode = "single",
  selected,
  onSelect,
  disabled = false,
  initialFocus = false,
  className,
  styles,
}: DatePickerProps) {
  // Handle both controlled (date/setDate) and uncontrolled (selected/onSelect) usage
  const handleSelect = React.useCallback(
    (selectedDate: Date | Date[] | undefined) => {
      if (mode === "single" && selectedDate instanceof Date) {
        setDate?.(selectedDate);
        onSelect?.(selectedDate);
      } else {
        onSelect?.(selectedDate);
      }
    },
    [mode, onSelect, setDate]
  );

  // Use either the controlled or uncontrolled selected date
  const selectedValue = date || selected;

  return (
    <div className={cn("grid gap-2", className)}>
      <Calendar
        mode={mode}
        selected={selectedValue}
        onSelect={handleSelect}
        disabled={disabled}
        initialFocus={initialFocus}
        className={cn("rounded-md border p-3 dark:bg-slate-900 dark:text-slate-50", styles?.calendar)}
      />
    </div>
  );
}