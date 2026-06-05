import * as React from "react"
import { cn } from "@/lib/utils"
import { COUNTRY_CODES } from "@/constants/countries"

interface PhoneInputProps {
  countryCode: string;
  onCountryCodeChange: (code: string) => void;
  phoneNumber: string;
  onPhoneNumberChange: (number: string) => void;
  className?: string;
  error?: string;
}

export function PhoneInput({
  countryCode,
  onCountryCodeChange,
  phoneNumber,
  onPhoneNumberChange,
  className,
  error
}: PhoneInputProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

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

  // Ao abrir o menu, foca direto o campo de busca — sem precisar de um clique extra.
  React.useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [isOpen]);

  const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode) || COUNTRY_CODES[0];

  const filteredCountries = COUNTRY_CODES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.includes(search)
  );

  // Reinicia o item destacado ao abrir ou ao filtrar.
  React.useEffect(() => {
    setHighlightedIndex(0);
  }, [search, isOpen]);

  // Mantém o item destacado sempre visível na lista ao navegar pelo teclado.
  React.useEffect(() => {
    const el = listRef.current?.children[highlightedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex]);

  function selectCountry(code: string) {
    onCountryCodeChange(code);
    setIsOpen(false);
    setSearch("");
  }

  // Navegação por teclado: ↑/↓ move, Enter seleciona, Esc fecha.
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex(i => Math.min(i + 1, filteredCountries.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const c = filteredCountries[highlightedIndex];
      if (c) selectCountry(c.code);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  }

  return (
    <div className={cn("relative z-50 w-full space-y-1.5", className)} ref={dropdownRef}>
      <div className="flex gap-2 items-stretch">
        {/* Country code button */}
        <div className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            onKeyDown={(e) => {
              if (!isOpen && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                setIsOpen(true);
              }
            }}
            className={cn(
              "flex items-center gap-2 h-full rounded-[0.75rem] border border-border bg-input px-[0.95rem] py-[0.65rem] text-[1rem] cursor-pointer whitespace-nowrap transition-[border-color,box-shadow] duration-200 hover:border-[rgba(113,95,219,0.6)]",
              isOpen && "border-primary shadow-[0_0_0_3px_rgba(113,95,219,0.25)]"
            )}
          >
            <span className="text-foreground font-medium">{selectedCountry.code}</span>
            <span className="text-primary text-[0.7rem] ml-1">▼</span>
          </button>
          
          {isOpen && (
            <div className="absolute left-0 top-[calc(100%+0.4rem)] z-50 w-[17rem] max-w-[80vw] rounded-[0.75rem] border border-[rgba(255,255,255,0.12)] bg-popover p-2 shadow-[0_24px_50px_-20px_rgba(0,0,0,0.85)] animate-in fade-in zoom-in-95 duration-100">
              <input
                ref={searchRef}
                type="text"
                placeholder="Procurar código ou país..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={handleKeyDown}
                className="mb-1.5 w-full rounded-[0.6rem] border border-border bg-[rgba(0,0,0,0.35)] px-3 py-2.5 text-[0.95rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
              />
              <div ref={listRef} className="max-h-64 overflow-y-auto">
                {filteredCountries.map((c, index) => (
                  <button
                    key={c.code + c.name}
                    type="button"
                    onClick={() => selectCountry(c.code)}
                    onMouseMove={() => setHighlightedIndex(index)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-[0.6rem] px-3 py-2.5 text-left text-[0.92rem] cursor-pointer transition-colors duration-150 group",
                      index === highlightedIndex && "bg-accent text-white",
                      countryCode === c.code && index !== highlightedIndex && "bg-[rgba(113,95,219,0.15)] text-white"
                    )}
                  >
                    <span className={cn("font-semibold min-w-[3.2rem] transition-colors duration-150", index === highlightedIndex && "text-white")}>{c.code}</span>
                    <span className={cn("flex-1 truncate text-muted-foreground transition-colors duration-150", index === highlightedIndex && "text-white/90")}>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Phone number input */}
        <input
          type="tel"
          placeholder="Número (sem o indicativo)"
          value={phoneNumber}
          onChange={(e) => {
            const val = e.target.value.replace(/[^\d\s]/g, "");
            onPhoneNumberChange(val);
          }}
          className={cn(
            "flex-1 rounded-[0.75rem] border border-border bg-input px-[0.95rem] py-[0.65rem] text-[1rem] text-foreground outline-none placeholder:text-muted-foreground transition-[border-color,box-shadow] duration-200 focus:border-primary focus:shadow-[0_0_0_3px_rgba(113,95,219,0.25)]",
            error && "border-destructive"
          )}
        />
      </div>
      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}
    </div>
  )
}
