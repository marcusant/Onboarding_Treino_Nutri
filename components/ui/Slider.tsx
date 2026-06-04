import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  labels: [string, string];
  className?: string;
}

export function Slider({ min, max, value, onChange, labels, className }: SliderProps) {
  return (
    <div className={cn("w-full pt-2", className)}>
      <div className="flex items-center gap-3.5">
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-1.5 cursor-pointer appearance-none rounded-full bg-input accent-primary outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[22px] [&::-webkit-slider-thumb]:h-[22px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-[0_4px_12px_-2px_rgba(113,95,219,0.9)]"
        />
        <span className="flex-shrink-0 w-10 text-center font-bold text-lg text-primary">{value}</span>
      </div>
      <div className="flex w-full items-center justify-between mt-1.5 text-xs text-muted-foreground">
        <span>{labels[0]}</span>
        <span>{labels[1]}</span>
      </div>
    </div>
  )
}
