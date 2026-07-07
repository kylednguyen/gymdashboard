"use client";
import { DayType } from "@/lib/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const OPTIONS: DayType[] = ["Training Day", "Non-Training Day"];

export function DayTypeToggle({
  value,
  onChange,
}: {
  value: DayType;
  onChange: (d: DayType) => void;
}) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as DayType)} aria-label="Day type">
      <TabsList className="flex w-full">
        {OPTIONS.map((opt) => (
          <TabsTrigger key={opt} value={opt} className="px-3 py-2.5 text-sm">
            {opt.replace(" Day", "")}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
