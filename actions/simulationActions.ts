"use server";

/**
 * Server Actions para Simulação de Risco
 * Toda validação ocorre server-side com Zod.
 * Nunca expõe lógica de negócio ao cliente.
 */

import { z } from "zod";
import { calculateFinancialRisk, RecordCategory } from "@/lib/financialRiskEngine";
import { logAuditEvent, deriveUserId } from "@/lib/auditLogger";
import { headers } from "next/headers";

// ─── Schema de Validação ──────────────────────────────────────────────────────

const RecordCategorySchema = z.enum([
  "PII_CLIENTE",
  "PII_COLABORADOR",
  "DADOS_CORPORATIVOS",
  "PROPRIEDADE_INTELECTUAL",
  "DADOS_NAO_PII",
] as const);

const SimulationInputSchema = z.object({
  description: z
    .string()
    .min(10, "Descrição deve ter pelo menos 10 caracteres")
    .max(1000, "Descrição não pode exceder 1000 caracteres")
    .trim(),
  recordsBreakdown: z
    .record(RecordCategorySchema, z.number().int().min(0).max(100_000_000))
    .refine(
      (val) => Object.values(val).some((v) => v > 0),
      "Pelo menos uma categoria de registro deve ter valor maior que zero"
    ),
  sector: z
    .string()
    .max(100)
    .optional()
    .default("Geral"),
  annualRevenueBRL: z
    .number()
    .positive()
    .optional()
    .default(100_000_000),
  exchangeRateUSD: z
    .number()
    .positive()
    .min(1)
    .max(50)
    .optional()
    .default(5.6),
});

export type SimulationInput = z.infer<typeof SimulationInputSchema>;

// ─── Tipos de Resultado ───────────────────────────────────────────────────────

export type SimulationActionResult =
  | { success: true; data: ReturnType<typeof calculateFinancialRisk>; simulationId: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// ─── Action Principal ──────────────────────────────────────────────────────────

export async function runSimulationAction(
  input: unknown
): Promise<SimulationActionResult> {
  // 1. Validação com Zod
  const parsed = SimulationInputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Dados de entrada inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { description, recordsBreakdown, sector, annualRevenueBRL, exchangeRateUSD } =
    parsed.data;

  // 2. Executar motor de risco (determinístico, server-side)
  const riskResult = calculateFinancialRisk(
    recordsBreakdown as Partial<Record<RecordCategory, number>>,
    { annualRevenueBRL, exchangeRateUSD }
  );

  // 3. Derivar userId a partir de headers da requisição
  const headersList = await headers();
  const sessionId =
    headersList.get("x-forwarded-for") ??
    headersList.get("x-real-ip") ??
    "anonymous";
  const userId = deriveUserId(sessionId);

  // 4. Registrar na trilha de auditoria
  const simulationId = crypto.randomUUID();
  await logAuditEvent(
    "SIMULATION_CREATED",
    {
      simulationId,
      description: description.substring(0, 100), // truncar para o log
      totalRecords: riskResult.totalRecords,
      riskLevel: riskResult.riskLevel,
      medianLossBRL: Math.round(riskResult.medianLossBRL),
      sector,
    },
    { userId }
  );

  return {
    success: true,
    data: riskResult,
    simulationId,
  };
}

// ─── Action de Validação de Formulário (para feedback em tempo real) ──────────

export async function validateSimulationInput(
  input: unknown
): Promise<{ valid: boolean; errors?: Record<string, string[]> }> {
  const parsed = SimulationInputSchema.safeParse(input);
  if (parsed.success) return { valid: true };
  return {
    valid: false,
    errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
  };
}
