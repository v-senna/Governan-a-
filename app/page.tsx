"use client";

import { Shield, TrendingUp, AlertTriangle, Database, Zap, Bot, ArrowRight, Activity } from "lucide-react";
import Link from "next/link";
import { RECORD_CATEGORIES, COST_CENTERS } from "@/lib/financialRiskEngine";

// Dados de exemplo para o dashboard (simulação padrão)
const DEMO_STATS = {
  totalSimulations: 0,
  avgRiskBRL: 0,
  criticalAlerts: 0,
  systemMode: "mock" as "mock" | "ollama", // modo atual (padrão: mock)
};

export default function DashboardPage() {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "0.5rem",
          }}
        >
          <div
            style={{
              padding: "0.5rem",
              background: "rgba(59, 130, 246, 0.1)",
              borderRadius: "10px",
              border: "1px solid rgba(59, 130, 246, 0.2)",
            }}
          >
            <Shield size={22} color="var(--color-blue)" />
          </div>
          <div>
            <h1
              style={{
                fontSize: "1.75rem",
                fontWeight: "800",
                background: "linear-gradient(135deg, #f0f4ff, #94a3b8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Dashboard de Governança
            </h1>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginTop: "0.125rem" }}>
              Plataforma de Avaliação de Risco Financeiro · Inspirado no EU AI Act & LGPD
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <StatCard
          icon={<Zap size={20} color="#3b82f6" />}
          label="Simulações Executadas"
          value="0"
          sublabel="Nesta sessão"
          accentColor="#3b82f6"
        />
        <StatCard
          icon={<AlertTriangle size={20} color="#f97316" />}
          label="Alertas de Correlação"
          value="0"
          sublabel="Detectados"
          accentColor="#f97316"
        />
        <StatCard
          icon={<Database size={20} color="#8b5cf6" />}
          label="Registros Analisados"
          value="0"
          sublabel="Total acumulado"
          accentColor="#8b5cf6"
        />
        <StatCard
          icon={<Bot size={20} color={DEMO_STATS.systemMode === "ollama" ? "#22c55e" : "#06b6d4"} />}
          label="Modo do Agente"
          value={DEMO_STATS.systemMode === "ollama" ? "Ollama" : "Mock"}
          sublabel={DEMO_STATS.systemMode === "ollama" ? "LLaMA Local" : "Modo Demo Seguro"}
          accentColor={DEMO_STATS.systemMode === "ollama" ? "#22c55e" : "#06b6d4"}
        />
      </div>

      {/* Main Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        {/* Quick Actions */}
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: "700",
              marginBottom: "1.25rem",
              color: "var(--color-text-primary)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Zap size={16} color="var(--color-blue)" />
            Ações Rápidas
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[
              {
                href: "/simulacao",
                label: "Nova Simulação de Vazamento",
                description: "Modele um cenário de breach e calcule o impacto em R$",
                icon: <Zap size={16} />,
                color: "#3b82f6",
              },
              {
                href: "/agente",
                label: "Consultar Agente de IA",
                description: "Obtenha análise e recomendações de compliance",
                icon: <Bot size={16} />,
                color: "#8b5cf6",
              },
              {
                href: "/auditoria",
                label: "Ver Trilha de Auditoria",
                description: "Verificar integridade da cadeia de hashes",
                icon: <Activity size={16} />,
                color: "#06b6d4",
              },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "0.875rem 1rem",
                  background: "var(--color-bg-secondary)",
                  borderRadius: "10px",
                  border: "1px solid var(--color-border)",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = `${action.color}44`;
                  (e.currentTarget as HTMLElement).style.background = `${action.color}08`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
                  (e.currentTarget as HTMLElement).style.background = "var(--color-bg-secondary)";
                }}
              >
                <div
                  style={{
                    padding: "0.5rem",
                    background: `${action.color}18`,
                    borderRadius: "8px",
                    color: action.color,
                  }}
                >
                  {action.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {action.label}
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--color-text-muted)",
                      marginTop: "0.125rem",
                    }}
                  >
                    {action.description}
                  </div>
                </div>
                <ArrowRight size={14} color="var(--color-text-muted)" />
              </Link>
            ))}
          </div>
        </div>

        {/* Cost Centers Reference */}
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: "700",
              marginBottom: "1.25rem",
              color: "var(--color-text-primary)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <TrendingUp size={16} color="var(--color-blue)" />
            Centros de Custo (parâmetros didáticos)
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {COST_CENTERS.map((cc) => (
              <div key={cc.label}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.375rem",
                  }}
                >
                  <span
                    style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}
                  >
                    {cc.label}
                  </span>
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: "700",
                      color: cc.color,
                    }}
                  >
                    {(cc.percentage * 100).toFixed(0)}%
                  </span>
                </div>
                <div
                  style={{
                    height: "6px",
                    background: "var(--color-bg-secondary)",
                    borderRadius: "3px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${cc.percentage * 100}%`,
                      background: `linear-gradient(90deg, ${cc.color}88, ${cc.color})`,
                      borderRadius: "3px",
                      transition: "width 1s ease",
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: "0.6875rem",
                    color: "var(--color-text-muted)",
                    marginTop: "0.25rem",
                  }}
                >
                  {cc.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Record Categories Reference */}
      <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: "700",
            marginBottom: "1.25rem",
            color: "var(--color-text-primary)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Database size={16} color="var(--color-blue)" />
          Categorias e valores de demonstração (não calibrados)
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem",
          }}
        >
          {Object.entries(RECORD_CATEGORIES).map(([key, meta]) => {
            const costBRL = meta.baseCostUSD * 5.6;
            return (
              <div
                key={key}
                style={{
                  padding: "1rem",
                  background: "var(--color-bg-secondary)",
                  borderRadius: "10px",
                  border: `1px solid ${meta.color}22`,
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "4px",
                    background: meta.color,
                    borderRadius: "2px",
                    marginBottom: "0.75rem",
                  }}
                />
                <div
                  style={{
                    fontSize: "0.8125rem",
                    fontWeight: "600",
                    color: "var(--color-text-primary)",
                    marginBottom: "0.25rem",
                  }}
                >
                  {meta.label}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-text-muted)",
                    marginBottom: "0.75rem",
                    lineHeight: "1.5",
                  }}
                >
                  {meta.description}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      color: meta.color,
                    }}
                  >
                    ${meta.baseCostUSD}/reg
                  </span>
                  <span style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)" }}>
                    ≈ R$ {costBRL.toFixed(0)}/reg
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* EU AI Act Banner */}
      <div
        style={{
          padding: "1.25rem 1.5rem",
          background: "linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(59, 130, 246, 0.08))",
          border: "1px solid rgba(139, 92, 246, 0.2)",
          borderRadius: "var(--radius-lg)",
          display: "flex",
          gap: "1rem",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            padding: "0.5rem",
            background: "rgba(139, 92, 246, 0.15)",
            borderRadius: "8px",
            flexShrink: 0,
          }}
        >
          <Shield size={18} color="#8b5cf6" />
        </div>
        <div>
          <div
            style={{
              fontSize: "0.875rem",
              fontWeight: "700",
              color: "#a78bfa",
              marginBottom: "0.375rem",
            }}
          >
            Alinhamento com EU AI Act & LGPD
          </div>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: "1.6" }}>
            Esta plataforma está estruturada conforme os pilares do <strong style={{ color: "var(--color-text-primary)" }}>EU AI Act</strong> (Regulamento UE 2024/1689):
            transparência de sistemas de IA de alto risco, trilha de auditoria imutável, e avaliação de risco obrigatória.
            Complementado pela <strong style={{ color: "var(--color-text-primary)" }}>LGPD</strong> (Lei nº 13.709/2018) com requisitos de notificação de incidentes à ANPD.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sublabel,
  accentColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel: string;
  accentColor: string;
}) {
  return (
    <div
      className="metric-card"
      style={{ position: "relative", overflow: "hidden" }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "60px",
          height: "60px",
          background: `radial-gradient(circle, ${accentColor}18 0%, transparent 70%)`,
          borderRadius: "50%",
          transform: "translate(20px, -20px)",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
        <div
          style={{
            padding: "0.5rem",
            background: `${accentColor}15`,
            borderRadius: "8px",
          }}
        >
          {icon}
        </div>
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: "600",
            color: "var(--color-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          fontSize: "2rem",
          fontWeight: "800",
          color: "var(--color-text-primary)",
          lineHeight: 1,
          marginBottom: "0.375rem",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
        {sublabel}
      </div>
    </div>
  );
}
