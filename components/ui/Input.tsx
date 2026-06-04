import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

// Define o valor do input via setter nativo e dispara o evento "input",
// para que React/react-hook-form detectem a mudança normalmente.
function setNativeValue(el: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value"
  )?.set;
  setter?.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    const innerRef = React.useRef<HTMLInputElement>(null);

    // Mescla a ref interna com a ref encaminhada pelo consumidor.
    const setRefs = React.useCallback(
      (node: HTMLInputElement | null) => {
        innerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
      },
      [ref]
    );

    const isNumber = type === "number";

    const step = (() => {
      const raw = props.step;
      const n = typeof raw === "number" ? raw : parseFloat(String(raw ?? "1"));
      return Number.isFinite(n) && n > 0 ? n : 1;
    })();

    const clamp = (value: number) => {
      const min = props.min !== undefined ? Number(props.min) : undefined;
      const max = props.max !== undefined ? Number(props.max) : undefined;
      let next = value;
      if (min !== undefined && next < min) next = min;
      if (max !== undefined && next > max) next = max;
      return next;
    };

    // Evita problemas de ponto flutuante (ex: 0.1 + 0.2).
    const roundToStep = (value: number) => {
      const decimals = (String(step).split(".")[1] || "").length;
      return decimals > 0 ? Number(value.toFixed(decimals)) : value;
    };

    const nudge = (direction: 1 | -1) => {
      const el = innerRef.current;
      if (!el) return;
      const current = parseFloat(el.value);
      const base = Number.isFinite(current) ? current : 0;
      const next = clamp(roundToStep(base + direction * step));
      setNativeValue(el, String(next));
      el.focus();
    };

    return (
      <div className="w-full">
        <div className="relative">
          <input
            type={type}
            className={cn(
              "w-full rounded-[0.75rem] border border-border bg-input px-[0.95rem] py-[0.8rem] text-[1rem] text-foreground transition-[border-color,box-shadow] duration-200 outline-none placeholder:text-muted-foreground focus:border-primary focus:shadow-[0_0_0_3px_rgba(113,95,219,0.25)]",
              error && "border-destructive",
              isNumber && "pr-12",
              className
            )}
            ref={setRefs}
            {...props}
          />
          {isNumber && (
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
              <button
                type="button"
                tabIndex={-1}
                aria-label="Aumentar"
                onClick={() => nudge(1)}
                className="flex h-4 w-7 items-center justify-center rounded-md border border-border bg-input text-muted-foreground transition-colors duration-150 hover:border-primary hover:text-primary"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>
              </button>
              <button
                type="button"
                tabIndex={-1}
                aria-label="Diminuir"
                onClick={() => nudge(-1)}
                className="flex h-4 w-7 items-center justify-center rounded-md border border-border bg-input text-muted-foreground transition-colors duration-150 hover:border-primary hover:text-primary"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
