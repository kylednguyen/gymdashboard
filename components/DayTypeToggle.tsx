import { DayType } from "@/lib/types";

const OPTIONS: DayType[] = ["Training Day", "Non-Training Day"];

export function DayTypeToggle({
  value,
  onChange,
}: {
  value: DayType;
  onChange: (d: DayType) => void;
}) {
  return (
    <div className="flex rounded-full bg-black/5 p-1" role="tablist" aria-label="Day type">
      {OPTIONS.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt)}
            className={`flex-1 cursor-pointer rounded-full px-3 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
              active ? "bg-brand text-white shadow-sm" : "text-muted"
            }`}
          >
            {opt.replace(" Day", "")}
          </button>
        );
      })}
    </div>
  );
}
