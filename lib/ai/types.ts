/**
 * Tipos comuns para a camada de agente de IA plugável.
 * Esta interface é o contrato entre o negócio e qualquer implementação de IA.
 * @module ai/types
 */

import type { FinancialRiskResult, RecordCategory } from "@/lib/financialRiskEngine";

// ─── Tipos de Entrada ──────────────────────────────────────────────────────────

export interface RiskAgentRequest {
  /** Descrição textual do cenário de vazamento */
  description: string;
  /** Contagem de registros por categoria */
  recordsBreakdown: Partial<Record<RecordCategory, number>>;
  /** Resultado do motor de risco financeiro já calculado */
  calculatedRisk: FinancialRiskResult;
  /** Contexto de compliance aplicável */
  complianceContext?: "LGPD" | "GDPR" | "EU_AI_ACT" | "ISO_27001";
  /** Setor da empresa para contextualização */
  sector?: string;
}

// ─── Tipos de Saída ───────────────────────────────────────────────────────────

export interface ComplianceFlag {
  framework: string; // "LGPD" | "EU AI Act" | "GDPR" | ...
  article?: string; // Ex: "Art. 48" ou "Art. 83"
  severity: "INFO" | "WARNING" | "VIOLATION";
  description: string;
}

export interface RiskAgentResponse {
  /** Narrativa analítica do risco em português */
  analysis: string;
  /** Lista de recomendações priorizadas */
  recommendations: string[];
  /** Flags de compliance identificadas */
  complianceFlags: ComplianceFlag[];
  /** Nível de risco consolidado */
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  /** Qual implementação de IA foi usada */
  modelUsed: "mock" | "ollama" | "gemini";
  /** Tempo de processamento em ms */
  processingTimeMs: number;
}

// ─── Interface do Agente ──────────────────────────────────────────────────────

export interface RiskAgent {
  /**
   * Analisa um cenário de risco e retorna recomendações.
   * Esta é a única função que implementações concretas precisam satisfazer.
   */
  analyze(request: RiskAgentRequest): Promise<RiskAgentResponse>;
  
  /**
   * Verifica se o agente está disponível e operacional.
   */
  healthCheck(): Promise<boolean>;
  
  /**
   * Identificador da implementação atual.
   */
  readonly agentType: "mock" | "ollama" | "gemini";
}
