"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Database, Home, Shield } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Início", icon: Home },
  { href: "/cenarios", label: "Explorar cenários", icon: Database },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <Link href="/" aria-label="RiskGov — início" style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: ".7rem", borderBottom: "1px solid var(--color-border)", textDecoration: "none" }}>
        <span style={{ width: 34, height: 34, display: "grid", placeItems: "center", borderRadius: 9, background: "var(--gradient-blue)" }}>
          <Shield size={17} color="white" />
        </span>
        <span>
          <strong style={{ display: "block", color: "var(--color-text-primary)", fontSize: ".95rem" }}>RiskGov</strong>
          <small style={{ color: "var(--color-text-muted)", fontSize: ".7rem" }}>Demonstração educativa</small>
        </span>
      </Link>
      <nav aria-label="Navegação principal" style={{ padding: ".75rem 0" }}>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={`sidebar-nav-item ${active ? "active" : ""}`} aria-current={active ? "page" : undefined}>
              <Icon size={17} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <div style={{ marginTop: "auto", padding: "1rem 1.25rem", borderTop: "1px solid var(--color-border)", color: "var(--color-text-muted)", fontSize: ".72rem", lineHeight: 1.5 }}>
        Cenários fictícios. Não é uma ferramenta de análise de incidentes reais.
      </div>
    </aside>
  );
}
