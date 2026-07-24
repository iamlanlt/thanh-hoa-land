"use client";

import type { LucideIcon } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FilterOption = string | { value: string; label: string };

type FilterSelectProps = {
  label: string;
  value: string;
  options: readonly FilterOption[];
  onChange: (value: string) => void;
  Icon: LucideIcon;
  displayValue?: string;
};

export function FilterSelect({
  label,
  value,
  options,
  onChange,
  Icon,
  displayValue,
}: FilterSelectProps) {
  return (
    <div className="filterSelect">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          className="filterTrigger h-[58px] w-full rounded-xl border-border bg-background px-3.5 shadow-none"
          aria-label={`${label}: ${displayValue ?? value}`}
        >
          <Icon className="size-4 text-primary" aria-hidden="true" />
          <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
            <small className="text-[11px] text-muted-foreground">{label}</small>
            <strong className="max-w-full truncate text-sm font-semibold text-foreground">
              <SelectValue>{displayValue ?? value}</SelectValue>
            </strong>
          </span>
        </SelectTrigger>
        <SelectContent
          position="popper"
          align="start"
          className="min-w-[var(--radix-select-trigger-width)]"
        >
          {options.map((option) => {
            const normalizedOption =
              typeof option === "string"
                ? { value: option, label: option }
                : option;

            return (
              <SelectItem
                key={normalizedOption.value}
                value={normalizedOption.value}
              >
                {normalizedOption.label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
