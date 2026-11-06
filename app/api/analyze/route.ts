/** Server-side analysis endpoint for mock, Ollama, or Gemini agents. */
import { NextResponse } from "next/server";
import { z } from "zod";
import { getRiskAgent } from "@/lib/ai/agentFactory";
import { calculateFinancialRisk } from "@/lib/financialRiskEngine";

const AnalyzeSchema = z.object({
  description: z.string().trim().min(5).max(2000),
  recordsCount: z.partialRecord(z.enum(["PII_CLIENTE", "PII_COLABORADOR", "DADOS_CORPORATIVOS", "PROPRIEDADE_INTELECTUAL", "DADOS_NAO_PII"]), z.number().int().min(0).max(100_000_000)).optional().default({}),
  complianceContext: z.enum(["LGPD", "GDPR", "EU_AI_ACT", "ISO_27001"]).optional().default("LGPD"),
  sector: z.string().trim().max(100).optional().default("Geral"),
  exchangeRateUSD: z.number().min(1).max(50).optional().default(5.6),
});

export async function POST(request: Request) {
  const parsed = AnalyzeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Dados inválidos. Use um cenário sintético com descrição de até 2.000 caracteres." }, { status: 400 });
  }

  const { description, recordsCount, complianceContext, sector, exchangeRateUSD } = parsed.data;
  const agent = getRiskAgent();
  if (!(await agent.healthCheck())) {
    const message = agent.agentType === "gemini"
      ? "Gemini não configurado. Defina GEMINI_API_KEY no ambiente privado do servidor."
      : agent.agentType === "ollama"
        ? "Ollama não está acessível. Verifique o serviço e o endereço configurado no servidor."
        : "Agente indisponível.";
    return NextResponse.json({ success: false, error: message }, { status: 503 });
  }

  try {
    const calculatedRisk = calculateFinancialRisk(recordsCount, { exchangeRateUSD });
    const response = await agent.analyze({
      description,
      recordsBreakdown: recordsCount,
      calculatedRisk,
      complianceContext,
      sector,
    });
    const model = agent.agentType === "gemini"
      ? process.env.AI_GEMINI_MODEL ?? "gemini-3.8-flash"
      : agent.agentType === "ollama"
        ? process.env.AI_OLLAMA_MODEL ?? "llama3.2"
        : "mock";

    return NextResponse.json({
      success: true,
      analysis: response.analysis,
      recommendations: response.recommendations,
      complianceFlags: response.complianceFlags,
      riskLevel: response.riskLevel,
      isAiGenerated: agent.agentType !== "mock",
      modelUsed: `${agent.agentType}/${model}`,
      watermark: `${agent.agentType.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
      evaluatedAt: new Date().toISOString(),
      processingMs: response.processingTimeMs,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao analisar o cenário.";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}

export async function GET() {
  const agent = getRiskAgent();
  const healthy = await agent.healthCheck();
  const model = agent.agentType === "gemini"
    ? process.env.AI_GEMINI_MODEL ?? "gemini-3.8-flash"
    : agent.agentType === "ollama"
      ? process.env.AI_OLLAMA_MODEL ?? "llama3.2"
      : "mock";
  return NextResponse.json({ healthy, agentType: agent.agentType, model });
}
