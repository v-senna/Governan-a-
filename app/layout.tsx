import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Governança de Riscos — Laboratório de cenários",
  description: "Explore casos públicos e simulações didáticas com dados sintéticos e premissas financeiras explícitas.",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
