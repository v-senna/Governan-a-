"use client";

import { useState, useRef, useCallback } from "react";
import { Bot, Send, RefreshCw, Shield, AlertTriangle, CheckCircle, Cpu, ChevronRight, Zap, Clock } from "lucide-react";
import { checkAgentHealthAction } from "@/actions/agentActions";
import { RECORD_CATEGORIES, formatCompact } from "@/lib/financialRiskEngine";
import type { ComplianceFlag } from "@/lib/ai/types";
import type { RecordCategory } from "@/lib/financialRiskEngine";
import { useEffect } from "react";

const QUICK_SCENARIOS = [
  {
    label: "Vazamento de BD de Clientes",
    description: "Banco de dados de e-commerce exposto por SQL injection. Dados de clientes acessíveis por 48h antes da detecção.",
    records: { PII_CLIENTE: 50000, DADOS_NAO_PII: 200000 } as Partial<Record<RecordCategory, number>>,
  },
  {
    label: "Ransomware em Hospital",
    description: "Ataque de ransomware criptografou servidores de EHR. Dados de pacientes e prontuários potencialmente exfiltrados.",
    records: { PII_COLABORADOR: 2000, PII_CLIENTE: 80000, DADOS_CORPORATIVOS: 10000 } as Partial<Record<RecordCategory, number>>,
  },
  {
    label: "Espionagem Industrial",
    description: "Ex-funcionário de P&D copiou código-fonte e roadmap de produto antes de sair para concorrente.",
    records: { PROPRIEDADE_INTELECTUAL: 5000, DADOS_CORPORATIVOS: 15000 } as Partial<Record<RecordCategory, number>>,
  },
];

interface AgentResult {
  success: boolean;
  analysis?: string;
  recommendations?: string[];
  complianceFlags?: ComplianceFlag[];
  riskLevel?: string;
  modelUsed?: string;
  processingMs?: number;
  watermark?: string;
  error?: string;
}

type LoadingPhase = "idle" | "connecting" | "waiting" | "done" | "error";

export default function AgentePage() {
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<AgentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [agentStatus, setAgentStatus] = useState<{ healthy: boolean; agentType: "mock" | "ollama"; model?: string } | null>(null);
  const [statusMsg, setStatusMsg] = useState("Agente processando análise...");

  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [form, setForm] = useState({
    description: "",
    sector: "Geral",
    complianceContext: "LGPD" as "LGPD" | "GDPR" | "EU_AI_ACT" | "ISO_27001",
    records: Object.fromEntries(
      Object.keys(RECORD_CATEGORIES).map((k) => [k, 0])
    ) as Partial<Record<RecordCategory, number>>,
  });

  useEffect(() => {
    checkAgentHealthAction().then(setAgentStatus);
  }, []);

  function applyScenario(scenario: (typeof QUICK_SCENARIOS)[0]) {
    setForm((prev) => ({
      ...prev,
      description: scenario.description,
      records: { ...Object.fromEntries(Object.keys(RECORD_CATEGORIES).map((k) => [k, 0])), ...scenario.records },
    }));
    setResult(null);
    setError(null);
  }

  const startTimer = useCallback(() => {
    setElapsed(0);
    if (elapsedRef.current) clearInterval(elapsedRef.current);
    elapsedRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (elapsedRef.current) {
      clearInterval(elapsedRef.current);
      elapsedRef.current = null;
    }
  }, []);

  async function handleSubmit() {
    if (!form.description.trim()) return;

    // Cancel any previous request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setResult(null);
    setError(null);
    setLoadingPhase("connecting");
    setStatusMsg("Conectando ao agente Ollama...");
    startTimer();

    // Decide endpoint: use SSE stream if ollama, else use regular action
    const useStream = agentStatus?.agentType === "ollama";

    if (!useStream) {
      // Mock agent — usar Server Action diretamente via API interna
      try {
        setStatusMsg("Mock agent processando...");
        setLoadingPhase("waiting");
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: form.description,
            recordsCount: form.records,
            complianceContext: form.complianceContext,
            sector: form.sector,
          }),
          signal: abortRef.current.signal,
        });
        const data = await res.json();
        setResult({ success: data.success, ...data });
        setLoadingPhase("done");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro desconhecido";
        if (msg !== "AbortError") {
          setError(msg);
          setLoadingPhase("error");
        }
      } finally {
        stopTimer();
      }
      return;
    }

    // Ollama: usar SSE endpoint para evitar timeout
    try {
      setLoadingPhase("connecting");
      setStatusMsg("Iniciando análise com Ollama LLaMA...");

      const response = await fetch("/api/analyze/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: form.description,
          recordsBreakdown: form.records,
          complianceContext: form.complianceContext,
          sector: form.sector,
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Falha ao conectar: ${response.status}`);
      }

      setLoadingPhase("waiting");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6)) as {
              type: string;
              message?: string;
              elapsed?: number;
              [key: string]: unknown;
            };

            if (event.type === "started") {
              setStatusMsg("Agente inicializado. O LLaMA está gerando a análise...");
            } else if (event.type === "heartbeat") {
              setStatusMsg(`LLaMA processando... ${event.elapsed}s decorridos (CPU mode)`);
            } else if (event.type === "result") {
              const r = event as unknown as AgentResult;
              setResult(r);
              setLoadingPhase("done");
            } else if (event.type === "error") {
              setError(event.message ?? "Erro desconhecido do agente");
              setLoadingPhase("error");
            }
          } catch {
            // JSON parse error — ignorar linha malformada
          }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      if (!msg.includes("abort") && !msg.includes("AbortError")) {
        setError(msg);
        setLoadingPhase("error");
      }
    } finally {
      stopTimer();
      if (loadingPhase !== "done") setLoadingPhase("idle");
    }
  }

  const isPending = loadingPhase === "connecting" || loadingPhase === "waiting";

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                padding: "0.5rem",
                background: "rgba(139, 92, 246, 0.1)",
                borderRadius: "10px",
                border: "1px solid rgba(139, 92, 246, 0.2)",
              }}
            >
              <Bot size={22} color="#8b5cf6" />
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
                Agente de Análise de Risco
              </h1>
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                IA plugável para análise de compliance e recomendações · EU AI Act Art. 13
              </p>
            </div>
          </div>

          {/* Agent Status Badge */}
          {agentStatus && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                background: agentStatus.agentType === "ollama"
                  ? "rgba(34, 197, 94, 0.08)"
                  : "rgba(6, 182, 212, 0.08)",
                border: `1px solid ${agentStatus.agentType === "ollama" ? "rgba(34, 197, 94, 0.2)" : "rgba(6, 182, 212, 0.2)"}`,
                borderRadius: "10px",
              }}
            >
              <Cpu
                size={14}
                color={agentStatus.agentType === "ollama" ? "#22c55e" : "#06b6d4"}
              />
              <span
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: "600",
                  color: agentStatus.agentType === "ollama" ? "#22c55e" : "#06b6d4",
                }}
              >
                {agentStatus.agentType === "ollama"
                  ? `Ollama · ${agentStatus.model ?? "LLaMA"}`
                  : "Mock Agent · Modo Demo"}
              </span>
              <span
                className="status-dot"
                style={{
                  background: agentStatus.healthy
                    ? "var(--color-risk-low)"
                    : "var(--color-risk-critical)",
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "1.5rem" }}>
        {/* Left: Input */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Quick Scenarios */}
          <div className="glass-card" style={{ padding: "1.25rem" }}>
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: "600",
                color: "var(--color-text-muted)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "0.75rem",
              }}
            >
              Cenários Rápidos
            </div>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              {QUICK_SCENARIOS.map((s) => (
                <button
                  key={s.label}
                  className="btn-secondary"
                  style={{ fontSize: "0.8125rem", padding: "0.5rem 0.875rem" }}
                  onClick={() => applyScenario(s)}
                  disabled={isPending}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="glass-card" style={{ padding: "1.5rem" }}>
            <h2
              style={{
                fontSize: "0.9375rem",
                fontWeight: "700",
                color: "var(--color-text-primary)",
                marginBottom: "1.25rem",
              }}
            >
              Configurar Análise
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label className="form-label">Descrição do Incidente</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: "120px", resize: "vertical" }}
                  placeholder="Descreva o cenário de risco para o agente analisar..."
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  disabled={isPending}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label className="form-label">Contexto de Compliance</label>
                  <select
                    className="form-input"
                    value={form.complianceContext}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        complianceContext: e.target.value as typeof form.complianceContext,
                      }))
                    }
                    style={{ cursor: "pointer" }}
                    disabled={isPending}
                  >
                    <option value="LGPD" style={{ background: "#0a0f1e" }}>LGPD (Brasil)</option>
                    <option value="GDPR" style={{ background: "#0a0f1e" }}>GDPR (Europa)</option>
                    <option value="EU_AI_ACT" style={{ background: "#0a0f1e" }}>EU AI Act</option>
                    <option value="ISO_27001" style={{ background: "#0a0f1e" }}>ISO 27001</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Setor</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Financeiro, Saúde..."
                    value={form.sector}
                    onChange={(e) => setForm((p) => ({ ...p, sector: e.target.value }))}
                    disabled={isPending}
                  />
                </div>
              </div>

              {/* Records */}
              <div>
                <label className="form-label" style={{ marginBottom: "0.75rem" }}>
                  Registros por Categoria
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  {(Object.entries(RECORD_CATEGORIES) as [RecordCategory, any][]).map(([key, meta]) => (
                    <div key={key}>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--color-text-muted)",
                          marginBottom: "0.375rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.375rem",
                        }}
                      >
                        <span
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: meta.color,
                          }}
                        />
                        {meta.label.split("/")[0].trim()}
                      </div>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="0"
                        min="0"
                        value={(form.records[key] ?? 0) || ""}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setForm((p: typeof form) => ({
                            ...p,
                            records: { ...p.records, [key]: val },
                          }));
                        }}
                        disabled={isPending}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="alert alert-critical" style={{ marginTop: "1rem" }}>
                <AlertTriangle size={16} />
                <span style={{ fontSize: "0.8125rem" }}>{error}</span>
              </div>
            )}

            <button
              className="btn-primary"
              style={{
                width: "100%",
                justifyContent: "center",
                marginTop: "1.25rem",
                padding: "0.875rem",
              }}
              onClick={handleSubmit}
              disabled={isPending || !form.description.trim()}
            >
              {isPending ? (
                <>
                  <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} />
                  Analisando...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Enviar para Análise
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Response */}
        <div>
          {isPending && (
            <div
              className="glass-card"
              style={{
                padding: "2rem",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1.25rem",
              }}
            >
              {/* Animated ring */}
              <div style={{ position: "relative", width: "64px", height: "64px" }}>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    border: "3px solid var(--color-border)",
                    borderTopColor: "#8b5cf6",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: "10px",
                    borderRadius: "50%",
                    border: "2px solid transparent",
                    borderTopColor: "rgba(139,92,246,0.4)",
                    animation: "spin 1.4s linear infinite reverse",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Zap size={18} color="#8b5cf6" />
                </div>
              </div>

              {/* Timer */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.375rem 0.875rem",
                  background: "rgba(139, 92, 246, 0.08)",
                  border: "1px solid rgba(139, 92, 246, 0.2)",
                  borderRadius: "20px",
                }}
              >
                <Clock size={13} color="#8b5cf6" />
                <span style={{ fontSize: "0.8125rem", fontWeight: "600", color: "#8b5cf6" }}>
                  {elapsed}s
                </span>
              </div>

              <div>
                <div style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", fontWeight: "600" }}>
                  {loadingPhase === "connecting" ? "Conectando ao agente..." : "LLaMA gerando análise"}
                </div>
                <div style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", marginTop: "0.375rem", lineHeight: "1.5" }}>
                  {statusMsg}
                </div>
                {elapsed > 30 && (
                  <div
                    style={{
                      marginTop: "0.75rem",
                      padding: "0.5rem 0.75rem",
                      background: "rgba(251, 191, 36, 0.06)",
                      border: "1px solid rgba(251, 191, 36, 0.15)",
                      borderRadius: "8px",
                      fontSize: "0.75rem",
                      color: "#fbbf24",
                    }}
                  >
                    ⚡ Rodando em modo CPU — pode levar 1-3 min
                  </div>
                )}
              </div>
            </div>
          )}

          {result && !isPending && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Risk Level */}
              <div
                className="glass-card"
                style={{
                  padding: "1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <span className={`risk-badge ${result.riskLevel ?? "MEDIUM"}`}>
                  {result.riskLevel ?? "—"}
                </span>
                <div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
                    via{" "}
                    <strong style={{ color: "#22c55e" }}>
                      {result.modelUsed ?? "Ollama"}
                    </strong>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                    {result.processingMs ? `${(result.processingMs / 1000).toFixed(1)}s` : `${elapsed}s`} · {result.watermark}
                  </div>
                </div>
              </div>

              {/* Analysis */}
              <div className="glass-card" style={{ padding: "1.25rem" }}>
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    color: "var(--color-text-muted)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: "0.75rem",
                  }}
                >
                  Análise Narrativa
                </div>
                <div
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--color-text-secondary)",
                    lineHeight: "1.7",
                    whiteSpace: "pre-line",
                  }}
                >
                  {result.analysis}
                </div>
              </div>

              {/* Recommendations */}
              {result.recommendations && result.recommendations.length > 0 && (
                <div className="glass-card" style={{ padding: "1.25rem" }}>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      color: "var(--color-text-muted)",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      marginBottom: "0.75rem",
                    }}
                  >
                    Recomendações ({result.recommendations.length})
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                    {result.recommendations.map((rec, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          gap: "0.75rem",
                          padding: "0.625rem 0.875rem",
                          background: "var(--color-bg-secondary)",
                          borderRadius: "8px",
                          fontSize: "0.8125rem",
                          color: "var(--color-text-secondary)",
                          lineHeight: "1.5",
                        }}
                      >
                        <CheckCircle
                          size={14}
                          color="#3b82f6"
                          style={{ flexShrink: 0, marginTop: "2px" }}
                        />
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Compliance Flags */}
              {result.complianceFlags && result.complianceFlags.length > 0 && (
                <div className="glass-card" style={{ padding: "1.25rem" }}>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      color: "var(--color-text-muted)",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <Shield size={12} style={{ display: "inline", marginRight: "0.375rem" }} />
                    Flags de Compliance ({result.complianceFlags.length})
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                    {result.complianceFlags.map((flag, i) => {
                      const severityColors: Record<ComplianceFlag["severity"], string> = {
                        VIOLATION: "#ef4444",
                        WARNING: "#f97316",
                        INFO: "#06b6d4",
                      };
                      const color = severityColors[flag.severity];
                      return (
                        <div
                          key={i}
                          style={{
                            padding: "0.75rem",
                            background: `${color}0a`,
                            border: `1px solid ${color}22`,
                            borderRadius: "8px",
                            fontSize: "0.8125rem",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: "0.5rem",
                              alignItems: "center",
                              marginBottom: "0.375rem",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "0.6875rem",
                                fontWeight: "700",
                                color: color,
                                background: `${color}18`,
                                padding: "0.125rem 0.5rem",
                                borderRadius: "4px",
                                letterSpacing: "0.05em",
                              }}
                            >
                              {flag.severity}
                            </span>
                            <strong style={{ color: "var(--color-text-primary)", fontSize: "0.8125rem" }}>
                              {flag.framework}
                            </strong>
                            {flag.article && (
                              <span style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>
                                {flag.article}
                              </span>
                            )}
                          </div>
                          <p style={{ color: "var(--color-text-secondary)", lineHeight: "1.5" }}>
                            {flag.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {!result && !isPending && (
            <div
              className="glass-card"
              style={{
                padding: "3rem 2rem",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  background: "rgba(139, 92, 246, 0.1)",
                  border: "1px solid rgba(139, 92, 246, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Bot size={24} color="#8b5cf6" />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "0.9375rem",
                    fontWeight: "600",
                    color: "var(--color-text-secondary)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Agente Pronto
                </div>
                <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", lineHeight: "1.6" }}>
                  Configure um cenário ou selecione um cenário rápido e envie para o agente analisar
                </div>
              </div>
              {agentStatus?.agentType === "ollama" && (
                <div
                  style={{
                    padding: "0.5rem 1rem",
                    background: "rgba(251, 191, 36, 0.06)",
                    border: "1px solid rgba(251, 191, 36, 0.12)",
                    borderRadius: "8px",
                    fontSize: "0.75rem",
                    color: "#fbbf24",
                  }}
                >
                  ⚡ Ollama em modo CPU — análise pode levar 1–3 minutos
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
