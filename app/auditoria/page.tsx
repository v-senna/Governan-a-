"use client";

import { useState, useEffect, useTransition } from "react";
import { ClipboardList, CheckCircle, XCircle, RefreshCw, Shield, Clock } from "lucide-react";
import { getAuditLogsAction } from "@/actions/auditActions";
import type { AuditEvent, AuditChainVerification } from "@/lib/auditLogger";

const EVENT_LABELS: Record<string, { label: string; color: string }> = {
  SIMULATION_CREATED: { label: "Simulação Criada", color: "#3b82f6" },
  SIMULATION_VIEWED: { label: "Simulação Visualizada", color: "#06b6d4" },
  AGENT_INVOKED: { label: "Agente Invocado", color: "#8b5cf6" },
  AGENT_RESPONSE_RECEIVED: { label: "Resposta do Agente", color: "#a78bfa" },
  AUDIT_LOG_VIEWED: { label: "Auditoria Visualizada", color: "#94a3b8" },
  REPORT_GENERATED: { label: "Relatório Gerado", color: "#22c55e" },
  SYSTEM_INITIALIZED: { label: "Sistema Inicializado", color: "#f97316" },
};

export default function AuditoriaPage() {
  const [isPending, startTransition] = useTransition();
  const [logs, setLogs] = useState<AuditEvent[]>([]);
  const [verification, setVerification] = useState<AuditChainVerification | null>(null);
  const [loaded, setLoaded] = useState(false);

  function loadLogs() {
    startTransition(async () => {
      const data = await getAuditLogsAction({ limit: 100 });
      setLogs(data.logs);
      setVerification(data.verification);
      setLoaded(true);
    });
  }

  useEffect(() => {
    loadLogs();
  }, []);

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
              background: "rgba(6, 182, 212, 0.1)",
              borderRadius: "10px",
              border: "1px solid rgba(6, 182, 212, 0.2)",
            }}
          >
            <ClipboardList size={22} color="#06b6d4" />
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
              Trilha de Auditoria
            </h1>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
              Cadeia imutável de eventos com verificação de integridade (Merkle-chain)
            </p>
          </div>
        </div>
        <button className="btn-secondary" onClick={loadLogs} disabled={isPending}>
          <RefreshCw size={14} style={isPending ? { animation: "spin 1s linear infinite" } : {}} />
          Atualizar
        </button>
      </div>

      {/* Integrity Status */}
      {verification && (
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <div
            className="glass-card"
            style={{
              flex: 1,
              padding: "1.25rem",
              border: verification.isValid
                ? "1px solid rgba(34, 197, 94, 0.3)"
                : "1px solid rgba(239, 68, 68, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            {verification.isValid ? (
              <CheckCircle size={28} color="#22c55e" />
            ) : (
              <XCircle size={28} color="#ef4444" />
            )}
            <div>
              <div
                style={{
                  fontSize: "1rem",
                  fontWeight: "700",
                  color: verification.isValid ? "#22c55e" : "#ef4444",
                }}
              >
                {verification.isValid
                  ? "✓ Cadeia Íntegra"
                  : "✗ Adulteração Detectada"}
              </div>
              <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                {verification.isValid
                  ? `${verification.totalEvents} eventos · todos os hashes verificados`
                  : verification.error}
              </div>
            </div>
          </div>

          <div className="metric-card" style={{ minWidth: "160px", textAlign: "center" }}>
            <div
              style={{
                fontSize: "2rem",
                fontWeight: "800",
                color: "var(--color-blue)",
              }}
            >
              {verification.totalEvents}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
              Eventos Registrados
            </div>
          </div>
        </div>
      )}

      {/* Architecture Note */}
      <div
        style={{
          padding: "1rem 1.25rem",
          background: "rgba(139, 92, 246, 0.05)",
          border: "1px solid rgba(139, 92, 246, 0.15)",
          borderRadius: "10px",
          marginBottom: "1.5rem",
          display: "flex",
          gap: "0.75rem",
          alignItems: "flex-start",
        }}
      >
        <Shield size={16} color="#8b5cf6" style={{ flexShrink: 0, marginTop: "2px" }} />
        <div>
          <strong style={{ fontSize: "0.8125rem", color: "#a78bfa" }}>
            Arquitetura de Auditoria Tamper-Proof
          </strong>
          <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem", lineHeight: "1.6" }}>
            Cada evento contém o hash do evento anterior (<code className="hash-display">prevHash</code>),
            formando uma cadeia criptográfica. Qualquer adulteração retroativa invalida todos os hashes subsequentes,
            tornando a falsificação detectável. Inspirado em arquiteturas de Merkle Trees.
          </p>
        </div>
      </div>

      {/* Logs Table */}
      {!loaded && isPending && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: "56px", borderRadius: "8px" }} />
          ))}
        </div>
      )}

      {loaded && logs.length === 0 && (
        <div
          className="glass-card"
          style={{
            padding: "3rem",
            textAlign: "center",
            color: "var(--color-text-muted)",
          }}
        >
          <ClipboardList size={32} style={{ marginBottom: "1rem", opacity: 0.4 }} />
          <div>Nenhum evento registrado ainda.</div>
          <div style={{ fontSize: "0.75rem", marginTop: "0.375rem" }}>
            Execute uma simulação ou consulte o agente para gerar eventos de auditoria.
          </div>
        </div>
      )}

      {loaded && logs.length > 0 && (
        <div className="glass-card" style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Timestamp</th>
                  <th>Evento</th>
                  <th>User ID</th>
                  <th>Payload Hash</th>
                  <th>Assinatura</th>
                  <th>Prev Hash</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((event, index) => {
                  const meta = EVENT_LABELS[event.eventType] ?? {
                    label: event.eventType,
                    color: "#94a3b8",
                  };
                  return (
                    <tr key={event.id}>
                      <td
                        style={{
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: "0.75rem",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        {logs.length - index}
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                          <Clock size={12} color="var(--color-text-muted)" />
                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontFamily: "JetBrains Mono, monospace",
                              color: "var(--color-text-secondary)",
                            }}
                          >
                            {new Date(event.timestamp).toLocaleString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: "600",
                            color: meta.color,
                            background: `${meta.color}15`,
                            padding: "0.125rem 0.5rem",
                            borderRadius: "4px",
                          }}
                        >
                          {meta.label}
                        </span>
                      </td>
                      <td>
                        <span className="hash-display">{event.userId}</span>
                      </td>
                      <td>
                        <span className="hash-display">
                          {event.payloadHash.substring(0, 12)}…
                        </span>
                      </td>
                      <td>
                        <span className="hash-display">
                          {event.signature.substring(0, 12)}…
                        </span>
                      </td>
                      <td>
                        <span
                          className="hash-display"
                          style={{ color: event.prevHash === "GENESIS" ? "#22c55e" : "var(--color-cyan)" }}
                        >
                          {event.prevHash === "GENESIS"
                            ? "GENESIS"
                            : event.prevHash.substring(0, 12) + "…"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
