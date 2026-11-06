"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  BarChart3,
  Zap,
  Bot,
  ClipboardList,
  FileText,
  AlertTriangle,
  Activity,
  Search,
} from "lucide-react";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Dashboard",
    icon: BarChart3,
    description: "Visão geral",
  },
  {
    href: "/cenarios",
    label: "Cenários",
    icon: Search,
    description: "Buscar correlações fictícias",
  },
  {
    href: "/simulacao",
    label: "Simulação",
    icon: Zap,
    description: "Modelar cenários",
  },
  {
    href: "/agente",
    label: "Agente de IA",
    icon: Bot,
    description: "Análise inteligente",
  },
  {
    href: "/auditoria",
    label: "Auditoria",
    icon: ClipboardList,
    description: "Trilha imutável",
  },
  {
    href: "/relatorio",
    label: "Relatório",
    icon: FileText,
    description: "Relatório completo",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div
        style={{
          padding: "1.5rem 1.25rem",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)",
            }}
          >
            <Shield size={18} color="white" />
          </div>
          <div>
            <div
              style={{
                fontSize: "0.9375rem",
                fontWeight: "700",
                background: "linear-gradient(135deg, #60a5fa, #a78bfa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              RiskGov AI
            </div>
            <div
              style={{
                fontSize: "0.6875rem",
                color: "var(--color-text-muted)",
                letterSpacing: "0.05em",
              }}
            >
              v1.0 · EU AI Act
            </div>
          </div>
        </div>

        {/* Status badge */}
        <div
          style={{
            marginTop: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 0.75rem",
            background: "rgba(34, 197, 94, 0.08)",
            border: "1px solid rgba(34, 197, 94, 0.2)",
            borderRadius: "8px",
          }}
        >
          <Activity size={12} color="var(--color-risk-low)" />
          <span style={{ fontSize: "0.75rem", color: "var(--color-risk-low)", fontWeight: "500" }}>
            Sistema Operacional
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "1rem 0" }}>
        <div
          style={{
            padding: "0.25rem 1.25rem 0.5rem",
            fontSize: "0.6875rem",
            fontWeight: "600",
            color: "var(--color-text-muted)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Módulos
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-nav-item ${isActive ? "active" : ""}`}
            >
              <Icon size={18} />
              <div>
                <div style={{ fontWeight: "500" }}>{item.label}</div>
                <div
                  style={{
                    fontSize: "0.6875rem",
                    color: isActive ? "var(--color-blue)" : "var(--color-text-muted)",
                    opacity: 0.8,
                  }}
                >
                  {item.description}
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: "1rem 1.25rem",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem",
            background: "rgba(249, 115, 22, 0.08)",
            border: "1px solid rgba(249, 115, 22, 0.2)",
            borderRadius: "8px",
          }}
        >
          <AlertTriangle size={12} color="var(--color-risk-high)" />
          <span style={{ fontSize: "0.6875rem", color: "var(--color-risk-high)", lineHeight: "1.4" }}>
            Dados simulados · Não usar em produção sem revisão jurídica
          </span>
        </div>
        <div
          style={{
            marginTop: "0.75rem",
            fontSize: "0.6875rem",
            color: "var(--color-text-muted)",
            textAlign: "center",
          }}
        >
          © 2026 · MIT License · v1.0.0
        </div>
      </div>
    </aside>
  );
}
