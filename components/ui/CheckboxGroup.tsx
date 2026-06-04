import * as React from "react"
import { cn } from "@/lib/utils"

export interface CheckboxOption {
  label: string | React.ReactNode;
  value: string;
}

interface CheckboxGroupProps {
  options: (string | CheckboxOption)[];
  value?: string[];
  onChange: (value: string[]) => void;
  className?: string;
  maxSelections?: number;
}

export function CheckboxGroup({ options, value = [], onChange, className, maxSelections }: CheckboxGroupProps) {
  const toggleOption = (optValue: string) => {
    const isSelected = value.includes(optValue);
    if (isSelected) {
      onChange(value.filter(v => v !== optValue));
    } else {
      if (maxSelections && value.length >= maxSelections) {
        return; // Block adding more if max reached
      }
      onChange([...value, optValue]);
    }
  };

  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className="grid grid-cols-2 gap-[0.6rem]">
        {options.map((opt, i) => {
          const isObj = typeof opt === 'object' && opt !== null;
          const optValue = isObj ? (opt as CheckboxOption).value : (opt as string);
          const optLabel = isObj ? (opt as CheckboxOption).label : (opt as string);
          const isSelected = value.includes(optValue);
          const isDisabled = Boolean(!isSelected && maxSelections && value.length >= maxSelections);

          return (
            <button
              key={optValue + i}
              type="button"
              onClick={() => toggleOption(optValue)}
              disabled={isDisabled}
              className={cn(
                "min-w-0 text-center py-[0.6rem] px-[0.5rem] rounded-[0.75rem] border text-[0.85rem] sm:text-[0.85rem] font-medium cursor-pointer select-none transition-all duration-200",
                isSelected
                  ? "bg-primary border-primary text-white shadow-[0_3px_10px_-6px_rgba(113,95,219,0.5)]"
                  : "bg-input border-border text-foreground hover:border-[rgba(113,95,219,0.6)]",
                isDisabled && !isSelected && "opacity-50 cursor-not-allowed hover:border-border"
              )}
            >
              {optLabel}
            </button>
          )
        })}
      </div>
    </div>
  )
}
