import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "RiskGov — Cenários de governança de dados",
  description:
    "Demonstração educativa com cenários sintéticos para explorar correlações de dados e controles de prevenção.",
  robots: { index: true, follow: true },
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
