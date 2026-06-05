import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  labels: [string, string];
  // 5 emojis ordenados do valor mais baixo (índice 0) ao mais alto (índice 4).
  // Para "sono" passa a escala em que mais = melhor; para "stress", mais = pior.
  emojis?: string[];
  // Preenche a barra à esquerda do thumb (sensação de "nível"). Só faz sentido
  // em escalas onde "mais é melhor/maior" — ex.: prioridade.
  filled?: boolean;
  className?: string;
}

const EMOJI_BUCKETS = 5;

// Mesma lógica de faixas pedida: valor 1-10 mapeado em 5 emojis.
function getEmojiIndex(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(Math.floor(value / 2), EMOJI_BUCKETS - 1));
}

// Emoji correspondente ao valor atual — usado também ao lado da pergunta.
export function getSliderEmoji(value: number, emojis?: string[]): string | null {
  if (!emojis || emojis.length < EMOJI_BUCKETS) return null;
  return emojis[getEmojiIndex(value)];
}

export function Slider({ min, max, value, onChange, labels, emojis, filled = false, className }: SliderProps) {
  const hasEmojis = !!emojis && emojis.length >= EMOJI_BUCKETS;

  // Percentagem preenchida: 0% no mínimo, 100% no máximo (alinhada ao thumb).
  const safeValue = Number.isFinite(value) ? value : min;
  const fillPct = max > min ? ((safeValue - min) / (max - min)) * 100 : 0;
  const clampedFill = Math.max(0, Math.min(100, fillPct));

  // Com `filled`, parte esquerda fica roxa; sem ele, trilha cinza uniforme.
  const trackBackground = filled
    ? `linear-gradient(to right, var(--color-primary) ${clampedFill}%, rgba(255,255,255,0.1) ${clampedFill}%)`
    : "rgba(255,255,255,0.1)";

  return (
    <div className={cn("w-full pt-0.5", className)}>
      {/* Linha da barra: emoji à esquerda, barra, emoji à direita */}
      <div className="flex items-center gap-2.5">
        {hasEmojis && (
          <span className="flex-shrink-0 text-xl leading-none select-none" aria-hidden="true">{emojis![0]}</span>
        )}

        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ background: trackBackground }}
          className="flex-1 h-1.5 cursor-pointer appearance-none rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[15px] [&::-webkit-slider-thumb]:h-[15px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-[0_2px_8px_-2px_rgba(113,95,219,0.8)] [&::-moz-range-thumb]:w-[15px] [&::-moz-range-thumb]:h-[15px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white"
        />

        {hasEmojis && (
          <span className="flex-shrink-0 text-xl leading-none select-none" aria-hidden="true">{emojis![EMOJI_BUCKETS - 1]}</span>
        )}
      </div>

      {/* Logo abaixo da barra: palavra de cada extremo (sob o seu emoji) e o número ao centro */}
      <div className="flex w-full items-center justify-between mt-1.5 text-xs text-muted-foreground">
        <span>{labels[0]}</span>
        <span className="font-bold text-sm text-primary tabular-nums">{value}/{max}</span>
        <span>{labels[1]}</span>
      </div>
    </div>
  )
}
