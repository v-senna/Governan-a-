"use client";

import { useState, useTransition } from "react";
import { FileText, Zap, Bot, Download, RefreshCw, ChevronRight, TrendingUp } from "lucide-react";
import { runSimulationAction } from "@/actions/simulationActions";
import { runAgentAnalysisAction } from "@/actions/agentActions";
import type { FinancialRiskResult, RecordCategory } from "@/lib/financialRiskEngine";
import { RECORD_CATEGORIES, formatBRL, formatCompact } from "@/lib/financialRiskEngine";
import type { RiskAgentResponse } from "@/lib/ai/types";

const DEFAULT_RECORDS: Partial<Record<RecordCategory, number>> = {
  PII_CLIENTE: 50000,
  PII_COLABORADOR: 1500,
  DADOS_CORPORATIVOS: 5000,
};

export default function RelatorioPage() {
  const [isPending, startTransition] = useTransition();
  const [riskData, setRiskData] = useState<FinancialRiskResult | null>(null);
  const [agentData, setAgentData] = useState<RiskAgentResponse | null>(null);
  const [generated, setGenerated] = useState(false);

  function generateReport() {
    startTransition(async () => {
      const simResult = await runSimulationAction({
        description: "Relatório de risco consolidado — cenário padrão de demonstração",
        recordsBreakdown: DEFAULT_RECORDS,
        sector: "Financeiro / Bancário",
        annualRevenueBRL: 500_000_000,
        exchangeRateUSD: 5.6,
      });

      if (simResult.success) {
        setRiskData(simResult.data);

        const agentResult = await runAgentAnalysisAction({
          description: "Relatório consolidado de risco — setor financeiro",
          recordsBreakdown: DEFAULT_RECORDS,
          sector: "Financeiro / Bancário",
          complianceContext: "LGPD",
        });

        if (agentResult.success) {
          setAgentData(agentResult.response);
        }

        setGenerated(true);
      }
    });
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div
        style={{
          marginBottom: "2rem",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              padding: "0.5rem",
              background: "rgba(34, 197, 94, 0.1)",
              borderRadius: "10px",
              border: "1px solid rgba(34, 197, 94, 0.2)",
            }}
          >
            <FileText size={22} color="#22c55e" />
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
              Relatório de Risco
            </h1>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
              Análise consolidada com motor de risco + IA · Pronto para compliance
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          {generated && (
            <button className="btn-secondary">
              <Download size={14} />
              Exportar PDF
            </button>
          )}
          <button
            className="btn-primary"
            onClick={generateReport}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} />
                Gerando...
              </>
            ) : (
              <>
                <Zap size={14} />
                {generated ? "Regenerar" : "Gerar Relatório Demo"}
                <ChevronRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>

      {!generated && !isPending && (
        <div
          className="glass-card"
          style={{
            padding: "4rem",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.5rem",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "20px",
              background: "rgba(34, 197, 94, 0.08)",
              border: "1px solid rgba(34, 197, 94, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FileText size={32} color="#22c55e" />
          </div>
          <div>
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: "700",
                color: "var(--color-text-primary)",
                marginBottom: "0.5rem",
              }}
            >
              Relatório de Demonstração
            </h2>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--color-text-muted)",
                maxWidth: "400px",
                lineHeight: "1.6",
              }}
            >
              Clique em &quot;Gerar Relatório Demo&quot; para criar um relatório completo com
              análise financeira + análise do agente de IA para um cenário de exemplo
              no setor financeiro.
            </p>
          </div>
          <button className="btn-primary" onClick={generateReport}>
            <Zap size={16} />
            Gerar Relatório Demo
          </button>
        </div>
      )}

      {isPending && (
        <div
          className="glass-card"
          style={{
            padding: "3rem",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              border: "3px solid var(--color-border)",
              borderTopColor: "#22c55e",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <div style={{ color: "var(--color-text-secondary)" }}>
            Gerando relatório completo...
          </div>
        </div>
      )}

      {generated && riskData && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Executive Summary */}
          <div
            style={{
              padding: "1.5rem",
              background: "linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(139, 92, 246, 0.08))",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              borderRadius: "var(--radius-lg)",
            }}
          >
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: "600",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-blue)",
                marginBottom: "0.75rem",
              }}
            >
              Sumário Executivo
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "1.5rem",
              }}
            >
              {[
                {
                  label: "Indicador central didático",
                  value: formatCompact(riskData.medianLossBRL),
                  color: "#3b82f6",
                },
                {
                  label: "Indicador de cauda didático",
                  value: formatCompact(riskData.tailRiskP95BRL),
                  color: "#ef4444",
                },
                {
                  label: "Registros",
                  value: riskData.totalRecords.toLocaleString("pt-BR"),
                  color: "#8b5cf6",
                },
                {
                  label: "Nível de Risco",
                  value: riskData.riskLevel,
                  color:
                    riskData.riskLevel === "CRITICAL"
                      ? "#ef4444"
                      : riskData.riskLevel === "HIGH"
                      ? "#f97316"
                      : "#eab308",
                },
              ].map((item) => (
                <div key={item.label}>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--color-text-muted)",
                      marginBottom: "0.375rem",
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "800",
                      color: item.color,
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown + Agent */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            {/* Financial */}
            <div className="glass-card" style={{ padding: "1.5rem" }}>
              <h2
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: "700",
                  marginBottom: "1.25rem",
                  color: "var(--color-text-primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <TrendingUp size={16} color="var(--color-blue)" />
                Análise Financeira
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {riskData.categoryBreakdown.map((cat) => (
                  <div key={cat.category}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.8125rem",
                        marginBottom: "0.25rem",
                      }}
                    >
                      <span style={{ color: "var(--color-text-secondary)" }}>
                        {cat.label}
                      </span>
                      <span style={{ fontWeight: "600", color: cat.color }}>
                        {formatCompact(cat.totalBRL)}
                      </span>
                    </div>
                    <div
                      style={{
                        height: "4px",
                        background: "var(--color-bg-secondary)",
                        borderRadius: "2px",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${(cat.totalBRL / riskData.linearExposureBRL) * 100}%`,
                          background: cat.color,
                          borderRadius: "2px",
                        }}
                      />
                    </div>
                  </div>
                ))}

                <div
                  style={{
                    marginTop: "0.5rem",
                    paddingTop: "0.75rem",
                    borderTop: "1px solid var(--color-border)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.9375rem",
                    }}
                  >
                    <strong style={{ color: "var(--color-text-primary)" }}>
                      Exposição Total
                    </strong>
                    <strong style={{ color: "var(--color-blue)" }}>
                      {formatCompact(riskData.linearExposureBRL)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Agent */}
            <div className="glass-card" style={{ padding: "1.5rem" }}>
              <h2
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: "700",
                  marginBottom: "1.25rem",
                  color: "var(--color-text-primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <Bot size={16} color="#8b5cf6" />
                Análise do Agente de IA
              </h2>

              {agentData ? (
                <div>
                  <div style={{ marginBottom: "1rem" }}>
                    <span className={`risk-badge ${agentData.riskLevel}`}>
                      {agentData.riskLevel}
                    </span>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--color-text-muted)",
                        marginLeft: "0.75rem",
                      }}
                    >
                      via {agentData.modelUsed}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--color-text-secondary)",
                      lineHeight: "1.7",
                      display: "-webkit-box",
                      WebkitLineClamp: 8,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {agentData.analysis.replace(/\*\*/g, "")}
                  </p>
                  <div
                    style={{
                      marginTop: "0.75rem",
                      fontSize: "0.75rem",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {agentData.complianceFlags.length} flags de compliance ·{" "}
                    {agentData.recommendations.length} recomendações
                  </div>
                </div>
              ) : (
                <div style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
                  Análise do agente indisponível.
                </div>
              )}
            </div>
          </div>

          {/* Recommendations Full List */}
          {agentData && agentData.recommendations.length > 0 && (
            <div className="glass-card" style={{ padding: "1.5rem" }}>
              <h2
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: "700",
                  marginBottom: "1.25rem",
                  color: "var(--color-text-primary)",
                }}
              >
                Plano de Ação — {agentData.recommendations.length} Recomendações
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.75rem",
                }}
              >
                {agentData.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      padding: "0.875rem",
                      background: "var(--color-bg-secondary)",
                      borderRadius: "8px",
                      fontSize: "0.8125rem",
                      color: "var(--color-text-secondary)",
                      lineHeight: "1.5",
                    }}
                  >
                    <span
                      style={{
                        flexShrink: 0,
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        background: "rgba(59, 130, 246, 0.15)",
                        color: "var(--color-blue)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.6875rem",
                        fontWeight: "700",
                      }}
                    >
                      {i + 1}
                    </span>
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div
            style={{
              padding: "1rem 1.25rem",
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid var(--color-border)",
              borderRadius: "10px",
              fontSize: "0.75rem",
              color: "var(--color-text-muted)",
              lineHeight: "1.6",
            }}
          >
            <strong style={{ color: "var(--color-text-secondary)" }}>⚠️ Aviso Legal:</strong> Este relatório é gerado com
            base em dados simulados e metodologia estatística. Não substitui avaliação jurídica, consultoria especializada
            em segurança da informação ou due diligence profissional. Valores em R$ baseados em câmbio configurado.
            Parâmetros fictícios para demonstração; valores não calibrados nem preditivos. Consulte sempre especialistas qualificados.
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
