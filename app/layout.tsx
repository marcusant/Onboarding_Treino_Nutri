import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://onboarding-trinus.vercel.app"),
  title: "TRINUS - Onboarding",
  description:
    "Preenche a tua ficha de anamnese para começares a tua transformação com treino personalizado.",
  openGraph: {
    title: "TRINUS - Onboarding",
    description:
      "Preenche a tua ficha de anamnese para começares a tua transformação com treino personalizado.",
    url: "https://onboarding-trinus.vercel.app/",
    siteName: "TRINUS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TRINUS - Onboarding",
    description:
      "Preenche a tua ficha de anamnese para começares a tua transformação com treino personalizado.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-PT">
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
