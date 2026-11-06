"use server";

/**
 * Server Actions para o Agente de IA
 * Mantém toda comunicação com o agente server-side.
 * Suporta mock e Ollama transparentemente via factory.
 */

import { z } from "zod";
import { getRiskAgent } from "@/lib/ai/agentFactory";
import { calculateFinancialRisk, RecordCategory } from "@/lib/financialRiskEngine";
import { logAuditEvent, deriveUserId } from "@/lib/auditLogger";
import { headers } from "next/headers";
import type { RiskAgentResponse } from "@/lib/ai/types";

// ─── Schema de Validação ──────────────────────────────────────────────────────

const AgentAnalysisSchema = z.object({
  description: z
    .string()
    .min(10, "Descrição deve ter pelo menos 10 caracteres")
    .max(2000)
    .trim(),
  recordsBreakdown: z.record(
    z.enum(["PII_CLIENTE", "PII_COLABORADOR", "DADOS_CORPORATIVOS", "PROPRIEDADE_INTELECTUAL", "DADOS_NAO_PII"]),
    z.number().int().min(0).max(100_000_000)
  ),
  sector: z.string().max(100).optional().default("Geral"),
  complianceContext: z
    .enum(["LGPD", "GDPR", "EU_AI_ACT", "ISO_27001"])
    .optional()
    .default("LGPD"),
  exchangeRateUSD: z.number().positive().min(1).max(50).optional().default(5.6),
});

// ─── Tipos de Resultado ───────────────────────────────────────────────────────

export type AgentActionResult =
  | { success: true; response: RiskAgentResponse; agentType: "mock" | "ollama" }
  | { success: false; error: string };

// ─── Action Principal ──────────────────────────────────────────────────────────

export async function runAgentAnalysisAction(
  input: unknown
): Promise<AgentActionResult> {
  // 1. Validação
  const parsed = AgentAnalysisSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: `Dados inválidos: ${parsed.error.issues.map((e: { message: string }) => e.message).join(", ")}`,
    };
  }

  const { description, recordsBreakdown, sector, complianceContext, exchangeRateUSD } = parsed.data;

  // 2. Calcular risco (o agente recebe o resultado já calculado — não recalcula)
  const calculatedRisk = calculateFinancialRisk(
    recordsBreakdown as Partial<Record<RecordCategory, number>>,
    { exchangeRateUSD }
  );

  // 3. Obter agente e verificar saúde
  const agent = getRiskAgent();
  const isHealthy = await agent.healthCheck();

  if (!isHealthy) {
    return {
      success: false,
      error:
        agent.agentType === "ollama"
          ? "Ollama não está disponível. Verifique se o serviço está rodando em " +
            (process.env.AI_OLLAMA_BASE_URL ?? "http://localhost:11434")
          : "Agente indisponível",
    };
  }

  // 4. Executar análise
  let agentResponse: RiskAgentResponse;
  try {
    agentResponse = await agent.analyze({
      description,
      recordsBreakdown: recordsBreakdown as Partial<Record<RecordCategory, number>>,
      calculatedRisk,
      complianceContext,
      sector,
    });
  } catch (error) {
    return {
      success: false,
      error: `Falha na análise do agente: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
    };
  }

  // 5. Registrar na trilha de auditoria
  const headersList = await headers();
  const sessionId = headersList.get("x-forwarded-for") ?? "anonymous";
  const userId = deriveUserId(sessionId);

  await logAuditEvent(
    "AGENT_INVOKED",
    {
      agentType: agent.agentType,
      riskLevel: agentResponse.riskLevel,
      processingTimeMs: agentResponse.processingTimeMs,
    },
    { userId }
  );

  await logAuditEvent(
    "AGENT_RESPONSE_RECEIVED",
    {
      riskLevel: agentResponse.riskLevel,
      recommendationsCount: agentResponse.recommendations.length,
      complianceFlagsCount: agentResponse.complianceFlags.length,
    },
    { userId }
  );

  return {
    success: true,
    response: agentResponse,
    agentType: agent.agentType,
  };
}

// ─── Health Check do Agente ───────────────────────────────────────────────────

export async function checkAgentHealthAction(): Promise<{
  healthy: boolean;
  agentType: "mock" | "ollama";
  model?: string;
}> {
  const agent = getRiskAgent();
  const healthy = await agent.healthCheck();
  return {
    healthy,
    agentType: agent.agentType,
    model: agent.agentType === "ollama" ? process.env.AI_OLLAMA_MODEL : undefined,
  };
}
