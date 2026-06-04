import * as React from "react"
import { cn } from "@/lib/utils"

export interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  error?: string;
  className?: string;
  searchable?: boolean;
}

export function Select({
  value,
  onChange,
  options,
  placeholder = "Selecionar...",
  error,
  className,
  searchable = true
}: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Fecha o dropdown se clicar fora
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const filteredOptions = searchable 
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="w-full relative" style={{ zIndex: isOpen ? 60 : 10 }} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between rounded-[0.75rem] border border-border bg-input px-[0.95rem] py-[0.8rem] text-[1rem] transition-[border-color,box-shadow] duration-200 outline-none cursor-pointer hover:border-[rgba(113,95,219,0.6)]",
          isOpen && "border-primary shadow-[0_0_0_3px_rgba(113,95,219,0.25)]",
          error && "border-destructive",
          className
        )}
      >
        <span className={cn("truncate", !selectedOption && "text-muted-foreground")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="text-primary text-[0.7rem] ml-3 flex-shrink-0">▼</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+0.4rem)] z-[70] w-full rounded-[0.75rem] border border-[rgba(255,255,255,0.12)] bg-popover p-2 shadow-[0_24px_50px_-20px_rgba(0,0,0,0.85)] animate-in fade-in zoom-in-95 duration-100">
          {searchable && (
            <input 
              type="text" 
              placeholder="Procurar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="mb-1.5 w-full rounded-[0.6rem] border border-border bg-[rgba(0,0,0,0.35)] px-3 py-2.5 text-[0.95rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
            />
          )}
          <div className="max-h-64 overflow-y-auto pr-1">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-sm text-muted-foreground">Nenhum resultado encontrado</div>
            ) : (
              filteredOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "flex w-full items-center rounded-[0.6rem] px-3 py-2.5 text-left text-[0.95rem] cursor-pointer transition-colors duration-150 hover:bg-accent hover:text-white group",
                    value === opt.value && "bg-[rgba(113,95,219,0.15)] text-white"
                  )}
                >
                  <span className="flex-1 truncate group-hover:text-white transition-colors">
                    {opt.label}
                  </span>
                  {value === opt.value && (
                    <span className="text-primary ml-2 group-hover:text-white">✓</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-sm font-medium text-destructive">{error}</p>
      )}
    </div>
  );
}
