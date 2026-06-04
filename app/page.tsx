import { Wizard } from "@/components/Wizard";
import Image from "next/image";

export default function Home() {
  return (
    <main className="w-full max-w-[40rem] mx-auto px-5 py-[clamp(1rem,4vw,2.5rem)] pb-16">
      {/* Logo TRINUS com brilho violeta (idêntico ao original) */}
      <div className="flex items-center justify-center gap-2.5 mb-6">
        <img
          src="/logo.png?v=2"
          alt="TRINUS"
          width="160"
          height="58"
          className="h-[2.5rem] w-auto object-contain select-none drop-shadow-[0_6px_22px_rgba(113,95,219,0.45)]"
        />
      </div>
      <Wizard />
    </main>
  );
}
