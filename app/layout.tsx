import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "RiskGov AI — Plataforma de Governança de IA & Risco Financeiro",
  description:
    "Simulação, prevenção e avaliação de risco financeiro de vazamentos de dados. Inspirado no EU AI Act e LGPD. Motor de risco em R$ com IA plugável.",
  keywords: [
    "governança de IA",
    "risco financeiro",
    "vazamento de dados",
    "LGPD",
    "EU AI Act",
    "segurança da informação",
  ],
  robots: { index: false, follow: false }, // Não indexar — aplicação interna
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <div style={{ display: "flex" }}>
          <Sidebar />
          <main className="main-content">
            <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
