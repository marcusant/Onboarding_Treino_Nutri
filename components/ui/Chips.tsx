import * as React from "react"
import { cn } from "@/lib/utils"

interface ChipsProps {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  color?: 'primary' | 'red' | 'orange' | 'green';
  className?: string;
  error?: string;
}

const NONE_VALUES = ['Nenhuma', 'Nenhum', 'Não se aplica'];

const colorMap = {
  primary: 'bg-primary',
  red: 'bg-destructive',
  orange: 'bg-[#d97706]',
  green: 'bg-[#34c77b]',
};

export function Chips({ options, value, onChange, color = 'primary', className, error }: ChipsProps) {
  const toggleChip = (opt: string) => {
    const isNone = NONE_VALUES.includes(opt);
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
    } else if (isNone) {
      onChange([opt]);
    } else {
      onChange([...value.filter((v) => !NONE_VALUES.includes(v)), opt]);
    }
  };

  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = value.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggleChip(opt)}
              className={cn(
                "rounded-full border px-4 py-2 text-[0.88rem] cursor-pointer select-none transition-all duration-200",
                isSelected
                  ? `${colorMap[color]} border-transparent text-white font-semibold`
                  : "bg-input border-border text-foreground hover:border-[rgba(113,95,219,0.6)]"
              )}
            >
              {opt}
            </button>
          )
        })}
      </div>
      {error && (
        <p className="mt-1.5 text-sm font-medium text-destructive">{error}</p>
      )}
    </div>
  )
}
