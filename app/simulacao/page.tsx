"use client";

import { useState, useTransition } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  Zap,
  AlertTriangle,
  TrendingUp,
  Shield,
  ChevronRight,
  Info,
  RefreshCw,
} from "lucide-react";
import { runSimulationAction } from "@/actions/simulationActions";
import type { FinancialRiskResult, RecordCategory } from "@/lib/financialRiskEngine";
import { RECORD_CATEGORIES, formatBRL, formatCompact } from "@/lib/financialRiskEngine";

type SimulationResult = FinancialRiskResult & { simulationId?: string };
type SimulationFormState = {
  description: string;
  sector: string;
  exchangeRateUSD: number;
  annualRevenueBRL: number;
  records: Record<RecordCategory, number>;
};

const SECTORS = [
  "Financeiro / Bancário",
  "Saúde / Hospitalar",
  "Varejo / E-commerce",
  "Tecnologia / SaaS",
  "Governamental / Público",
  "Educação",
  "Telecomunicações",
  "Energia / Utilities",
  "Industrial / Manufatura",
  "Seguros",
  "Outro",
];

export default function SimulacaoPage() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    description: "",
    sector: "Financeiro / Bancário",
    exchangeRateUSD: 5.6,
    annualRevenueBRL: 100_000_000,
    records: {
      PII_CLIENTE: 0,
      PII_COLABORADOR: 0,
      DADOS_CORPORATIVOS: 0,
      PROPRIEDADE_INTELECTUAL: 0,
      DADOS_NAO_PII: 0,
    } as Record<RecordCategory, number>,
  });

  const totalRecords = Object.values(form.records).reduce((s, v) => s + v, 0);

  function handleRecordChange(category: RecordCategory, raw: string) {
    const val = parseInt(raw.replace(/\D/g, "")) || 0;
    setForm((prev) => ({
      ...prev,
      records: { ...prev.records, [category]: Math.min(val, 100_000_000) },
    }));
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const res = await runSimulationAction({
        description: form.description || `Simulação no setor ${form.sector}`,
        recordsBreakdown: form.records,
        sector: form.sector,
        annualRevenueBRL: form.annualRevenueBRL,
        exchangeRateUSD: form.exchangeRateUSD,
      });

      if (res.success) {
        setResult({ ...res.data, simulationId: res.simulationId });
      } else {
        setError(res.error);
      }
    });
  }

  function handleReset() {
    setResult(null);
    setError(null);
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <div
            style={{
              padding: "0.5rem",
              background: "rgba(59, 130, 246, 0.1)",
              borderRadius: "10px",
              border: "1px solid rgba(59, 130, 246, 0.2)",
            }}
          >
            <Zap size={22} color="var(--color-blue)" />
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
              Simulação de Vazamento
            </h1>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
              Modele cenários de breach e calcule o impacto financeiro em R$ com modelagem log-normal
            </p>
          </div>
        </div>
      </div>

      {!result ? (
        <SimulationForm
          form={form}
          setForm={setForm}
          totalRecords={totalRecords}
          isPending={isPending}
          error={error}
          onRecordChange={handleRecordChange}
          onSubmit={handleSubmit}
        />
      ) : (
        <SimulationResults result={result} onReset={handleReset} />
      )}
    </div>
  );
}

// ─── Formulário ────────────────────────────────────────────────────────────────

function SimulationForm({
  form,
  setForm,
  totalRecords,
  isPending,
  error,
  onRecordChange,
  onSubmit,
}: {
  form: SimulationFormState;
  setForm: Dispatch<SetStateAction<SimulationFormState>>;
  totalRecords: number;
  isPending: boolean;
  error: string | null;
  onRecordChange: (cat: RecordCategory, val: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 340px",
        gap: "1.5rem",
        alignItems: "start",
      }}
    >
      {/* Left: Main Form */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Scenario Description */}
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h2
            style={{
              fontSize: "0.9375rem",
              fontWeight: "700",
              color: "var(--color-text-primary)",
              marginBottom: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Info size={16} color="var(--color-blue)" />
            Configuração do Cenário
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label className="form-label">Descrição do Incidente</label>
              <textarea
                className="form-input"
                style={{ minHeight: "100px", resize: "vertical" }}
                placeholder="Ex: Banco de dados de clientes exposto por configuração incorreta de bucket S3. Dados acessíveis publicamente por 72h..."
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label className="form-label">Setor da Empresa</label>
                <select
                  className="form-input"
                  value={form.sector}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, sector: e.target.value }))
                  }
                  style={{ cursor: "pointer" }}
                >
                  {SECTORS.map((s) => (
                    <option key={s} value={s} style={{ background: "#0a0f1e" }}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Taxa de Câmbio (USD/BRL)</label>
                <input
                  type="number"
                  className="form-input"
                  step="0.01"
                  min="1"
                  max="50"
                  value={form.exchangeRateUSD}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      exchangeRateUSD: parseFloat(e.target.value) || 5.6,
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <label className="form-label">
                Faturamento Anual Estimado (R$){" "}
                <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>
                  — para cálculo de multas LGPD
                </span>
              </label>
              <input
                type="number"
                className="form-input"
                step="1000000"
                min="0"
                value={form.annualRevenueBRL}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    annualRevenueBRL: parseFloat(e.target.value) || 100_000_000,
                  }))
                }
              />
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.375rem" }}>
                Atual: {formatCompact(form.annualRevenueBRL)} ·{" "}
                Multa máx. LGPD: {formatCompact(Math.min(form.annualRevenueBRL * 0.02, 50_000_000))}
              </div>
            </div>
          </div>
        </div>

        {/* Records Breakdown */}
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h2
            style={{
              fontSize: "0.9375rem",
              fontWeight: "700",
              color: "var(--color-text-primary)",
              marginBottom: "0.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Shield size={16} color="var(--color-blue)" />
            Registros Comprometidos por Categoria
          </h2>
          <p
            style={{
              fontSize: "0.8125rem",
              color: "var(--color-text-muted)",
              marginBottom: "1.5rem",
            }}
          >
            Informe o número estimado de registros afetados em cada categoria
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {(Object.entries(RECORD_CATEGORIES) as [RecordCategory, (typeof RECORD_CATEGORIES)[RecordCategory]][]).map(
              ([key, meta]) => {
                const costBRL = meta.baseCostUSD * form.exchangeRateUSD;
                const recordCount = form.records[key];
                const categoryTotal = recordCount * costBRL;

                return (
                  <div
                    key={key}
                    style={{
                      padding: "1rem",
                      background: "var(--color-bg-secondary)",
                      borderRadius: "10px",
                      border: `1px solid ${recordCount > 0 ? meta.color + "33" : "var(--color-border)"}`,
                      transition: "border-color 0.2s",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "0.75rem",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: "0.875rem",
                            fontWeight: "600",
                            color:
                              recordCount > 0
                                ? "var(--color-text-primary)"
                                : "var(--color-text-secondary)",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <span
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              background: meta.color,
                              display: "inline-block",
                              opacity: recordCount > 0 ? 1 : 0.4,
                            }}
                          />
                          {meta.label}
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--color-text-muted)",
                            marginTop: "0.25rem",
                          }}
                        >
                          {meta.description}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "1rem" }}>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: meta.color,
                            fontWeight: "600",
                          }}
                        >
                          R$ {costBRL.toFixed(0)}/reg
                        </div>
                        {recordCount > 0 && (
                          <div
                            style={{
                              fontSize: "0.6875rem",
                              color: "var(--color-text-muted)",
                            }}
                          >
                            Total: {formatCompact(categoryTotal)}
                          </div>
                        )}
                      </div>
                    </div>

                    <input
                      type="number"
                      className="form-input"
                      style={{ marginTop: "0.25rem" }}
                      placeholder="0"
                      min="0"
                      max="100000000"
                      value={recordCount || ""}
                      onChange={(e) => onRecordChange(key, e.target.value)}
                    />
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-critical">
            <AlertTriangle size={18} />
            <div>
              <strong>Erro na simulação:</strong> {error}
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          className="btn-primary"
          style={{ width: "100%", justifyContent: "center", padding: "1rem", fontSize: "1rem" }}
          onClick={onSubmit}
          disabled={isPending || totalRecords === 0}
        >
          {isPending ? (
            <>
              <RefreshCw size={18} style={{ animation: "spin 1s linear infinite" }} />
              Calculando Risco...
            </>
          ) : (
            <>
              <Zap size={18} />
              Executar Simulação de Risco
              <ChevronRight size={18} />
            </>
          )}
        </button>
      </div>

      {/* Right: Summary Preview */}
      <div style={{ position: "sticky", top: "2rem" }}>
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h3
            style={{
              fontSize: "0.875rem",
              fontWeight: "700",
              color: "var(--color-text-primary)",
              marginBottom: "1rem",
            }}
          >
            Resumo da Configuração
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.8125rem",
              }}
            >
              <span style={{ color: "var(--color-text-muted)" }}>Total de Registros</span>
              <span
                style={{
                  fontWeight: "700",
                  color: totalRecords > 0 ? "var(--color-blue)" : "var(--color-text-muted)",
                }}
              >
                {totalRecords.toLocaleString("pt-BR")}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.8125rem",
              }}
            >
              <span style={{ color: "var(--color-text-muted)" }}>Câmbio</span>
              <span style={{ fontWeight: "600", color: "var(--color-text-secondary)" }}>
                R$ {form.exchangeRateUSD.toFixed(2)}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.8125rem",
              }}
            >
              <span style={{ color: "var(--color-text-muted)" }}>Setor</span>
              <span
                style={{
                  fontWeight: "600",
                  color: "var(--color-text-secondary)",
                  textAlign: "right",
                  maxWidth: "140px",
                }}
              >
                {form.sector}
              </span>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid var(--color-border)" }} />

            {(Object.entries(form.records) as [RecordCategory, number][])
              .filter(([, v]) => v > 0)
              .map(([cat, count]) => {
                const meta = RECORD_CATEGORIES[cat];
                return (
                  <div
                    key={cat}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.8125rem",
                    }}
                  >
                    <span style={{ color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: meta.color,
                          display: "inline-block",
                        }}
                      />
                      {meta.label.split("/")[0].trim()}
                    </span>
                    <span style={{ fontWeight: "600", color: meta.color }}>
                      {count.toLocaleString("pt-BR")}
                    </span>
                  </div>
                );
              })}

            {totalRecords === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "1.5rem",
                  color: "var(--color-text-muted)",
                  fontSize: "0.8125rem",
                }}
              >
                Configure ao menos uma categoria de registros para iniciar a simulação
              </div>
            )}
          </div>
        </div>

        {/* Methodology Note */}
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            background: "rgba(6, 182, 212, 0.05)",
            border: "1px solid rgba(6, 182, 212, 0.15)",
            borderRadius: "10px",
          }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: "600",
              color: "var(--color-cyan)",
              marginBottom: "0.5rem",
            }}
          >
            📊 Metodologia
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", lineHeight: "1.6" }}>
            Parâmetros fictícios para demonstração; não são benchmark, previsão nem estimativa atuarial. Valores em R$ usam câmbio configurado apenas para ilustrar a interface.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Resultados ────────────────────────────────────────────────────────────────

function SimulationResults({
  result,
  onReset,
}: {
  result: SimulationResult;
  onReset: () => void;
}) {
  const riskColors: Record<string, string> = {
    LOW: "#22c55e",
    MEDIUM: "#eab308",
    HIGH: "#f97316",
    CRITICAL: "#ef4444",
  };
  const riskColor = riskColors[result.riskLevel] ?? "#3b82f6";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Top Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span className={`risk-badge ${result.riskLevel}`}>
            {result.riskLevel === "CRITICAL" && "⚠️ "}
            {result.riskLevel === "HIGH" && "🔴 "}
            {result.riskLevel === "MEDIUM" && "🟡 "}
            {result.riskLevel === "LOW" && "🟢 "}
            Risco {result.riskLevel}
          </span>
          <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
            {result.totalRecords.toLocaleString("pt-BR")} registros · ID:{" "}
            <code style={{ fontSize: "0.75rem", color: "var(--color-cyan)" }}>
              {result.simulationId?.substring(0, 8)}
            </code>
          </span>
        </div>
        <button className="btn-secondary" onClick={onReset}>
          <RefreshCw size={14} />
          Nova Simulação
        </button>
      </div>

      {/* 3 Scenarios */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "1rem",
        }}
      >
        <ScenarioCard
          label="Exposição Linear Teórica"
          sublabel="Pior caso absoluto (teórico)"
          value={formatCompact(result.linearExposureBRL)}
          fullValue={formatBRL(result.linearExposureBRL)}
          color="#3b82f6"
          icon="📐"
          description="Soma bruta de todos os registros × custo base. Raro atingir na prática."
        />
        <ScenarioCard
          label="Indicador central didático"
          sublabel="Transformação didática; sem calibração"
          value={formatCompact(result.medianLossBRL)}
          fullValue={formatBRL(result.medianLossBRL)}
          color={riskColor}
          icon="📊"
          description="Valor ilustrativo derivado dos parâmetros do demo; não é perda provável nem mediana observada."
          highlighted
        />
        <ScenarioCard
          label="Risco de Cauda Extrema"
          sublabel="Indicador de cauda didático"
          value={formatCompact(result.tailRiskP95BRL)}
          fullValue={formatBRL(result.tailRiskP95BRL)}
          color="#ef4444"
          icon="🚨"
          description="Não representa percentil, multa ou perda esperada; use apenas para explorar o cálculo da interface."
        />
      </div>

      {/* Cost Center Breakdown */}
      <div className="glass-card" style={{ padding: "1.5rem" }}>
        <h2
          style={{
            fontSize: "0.9375rem",
            fontWeight: "700",
            color: "var(--color-text-primary)",
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <TrendingUp size={16} color="var(--color-blue)" />
          Decomposição por Centro de Custo
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {result.costCenterBreakdown.map((cc) => (
            <div key={cc.label}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.375rem",
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {cc.label}
                  </span>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--color-text-muted)",
                      marginLeft: "0.5rem",
                    }}
                  >
                    {cc.description}
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "0.9375rem",
                      fontWeight: "700",
                      color: cc.color,
                    }}
                  >
                    {formatCompact(cc.amountBRL)}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                    {cc.percentage.toFixed(0)}% do total
                  </div>
                </div>
              </div>
              <div
                style={{
                  height: "8px",
                  background: "var(--color-bg-secondary)",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${cc.percentage}%`,
                    background: `linear-gradient(90deg, ${cc.color}88, ${cc.color})`,
                    borderRadius: "4px",
                    transition: "width 1.2s ease",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Fines */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
      >
        <div
          className="glass-card"
          style={{
            padding: "1.25rem",
            border: "1px solid rgba(249, 115, 22, 0.2)",
          }}
        >
          <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>
            Multa Máxima · LGPD (ANPD)
          </div>
          <div
            style={{ fontSize: "1.5rem", fontWeight: "800", color: "#f97316" }}
          >
            {formatCompact(result.complianceFines.lgpdMaxBRL)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.375rem" }}>
            2% faturamento ou R$ 50M · por infração
          </div>
        </div>
        <div
          className="glass-card"
          style={{
            padding: "1.25rem",
            border: "1px solid rgba(239, 68, 68, 0.2)",
          }}
        >
          <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>
            Multa Máxima · GDPR (Comissão Europeia)
          </div>
          <div
            style={{ fontSize: "1.5rem", fontWeight: "800", color: "#ef4444" }}
          >
            {formatCompact(result.complianceFines.gdprMaxBRL)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.375rem" }}>
            4% faturamento global ou €20M
          </div>
        </div>
      </div>

      {/* Correlation Alerts */}
      {result.alerts.length > 0 && (
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h2
            style={{
              fontSize: "0.9375rem",
              fontWeight: "700",
              color: "var(--color-text-primary)",
              marginBottom: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <AlertTriangle size={16} color="#f97316" />
            Alertas de Correlação — Efeito &quot;Insignificante → Destrutivo&quot;
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {result.alerts.map((alert, i) => {
              const severityClass = alert.severity.toLowerCase();
              return (
                <div
                  key={i}
                  className={`alert alert-${severityClass === "critical" ? "critical" : severityClass === "high" ? "high" : "medium"}`}
                >
                  <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <strong style={{ display: "block", marginBottom: "0.375rem" }}>
                      {alert.title}
                    </strong>
                    <p style={{ fontSize: "0.8125rem", lineHeight: "1.6", opacity: 0.9 }}>
                      {alert.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {result.categoryBreakdown.length > 0 && (
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h2
            style={{
              fontSize: "0.9375rem",
              fontWeight: "700",
              color: "var(--color-text-primary)",
              marginBottom: "1.25rem",
            }}
          >
            Detalhamento por Categoria
          </h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Registros</th>
                <th>Custo/Reg</th>
                <th>Total (Linear)</th>
                <th>% do Total</th>
              </tr>
            </thead>
            <tbody>
              {result.categoryBreakdown.map((cat) => (
                <tr key={cat.category}>
                  <td>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: cat.color,
                          display: "inline-block",
                        }}
                      />
                      {cat.label}
                    </span>
                  </td>
                  <td style={{ fontFamily: "JetBrains Mono, monospace" }}>
                    {cat.recordCount.toLocaleString("pt-BR")}
                  </td>
                  <td>{formatBRL(cat.costPerRecordBRL)}</td>
                  <td style={{ fontWeight: "600", color: cat.color }}>
                    {formatCompact(cat.totalBRL)}
                  </td>
                  <td>
                    {result.linearExposureBRL > 0
                      ? ((cat.totalBRL / result.linearExposureBRL) * 100).toFixed(1)
                      : 0}
                    %
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ScenarioCard({
  label,
  sublabel,
  value,
  fullValue,
  color,
  icon,
  description,
  highlighted = false,
}: {
  label: string;
  sublabel: string;
  value: string;
  fullValue: string;
  color: string;
  icon: string;
  description: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className="glass-card"
      style={{
        padding: "1.5rem",
        border: highlighted ? `1px solid ${color}44` : "1px solid var(--color-border)",
        ...(highlighted && { boxShadow: `0 0 30px ${color}18` }),
      }}
    >
      <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>{icon}</div>
      <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>
        {sublabel}
      </div>
      <div
        style={{
          fontSize: "0.875rem",
          fontWeight: "700",
          color: "var(--color-text-secondary)",
          marginBottom: "0.75rem",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "1.75rem",
          fontWeight: "900",
          color: color,
          lineHeight: 1,
          marginBottom: "0.375rem",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "0.6875rem",
          color: "var(--color-text-muted)",
          fontFamily: "JetBrains Mono, monospace",
          marginBottom: "0.75rem",
        }}
      >
        {fullValue}
      </div>
      <div
        style={{
          fontSize: "0.75rem",
          color: "var(--color-text-muted)",
          lineHeight: "1.5",
          borderTop: "1px solid var(--color-border)",
          paddingTop: "0.75rem",
        }}
      >
        {description}
      </div>
    </div>
  );
}
