/**
 * Implementação Ollama do Agente de IA
 * Ativado quando AI_AGENT_MODE=ollama em .env.local
 * Usa o modelo LLaMA rodando localmente via Ollama (endpoint /api/chat).
 * @module ai/ollamaAgent
 */

import type { RiskAgent, RiskAgentRequest, RiskAgentResponse, ComplianceFlag } from "./types";
import { formatCompact } from "@/lib/financialRiskEngine";

export class OllamaRiskAgent implements RiskAgent {
  readonly agentType = "ollama" as const;

  private readonly baseUrl: string;
  private readonly model: string;

  constructor() {
    // Suporta ambas as variáveis de ambiente (OLLAMA_* e AI_OLLAMA_*)
    this.baseUrl =
      process.env.OLLAMA_BASE_URL ??
      process.env.AI_OLLAMA_BASE_URL ??
      "http://localhost:11434";
    this.model =
      process.env.OLLAMA_MODEL ??
      process.env.AI_OLLAMA_MODEL ??
      "llama3.2";
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(3000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async analyze(request: RiskAgentRequest): Promise<RiskAgentResponse> {
    const start = Date.now();

    const systemPrompt = buildSystemPrompt();
    const userMessage = buildUserMessage(request);

    // Usar /api/chat para suporte a system prompt (mais preciso que /api/generate)
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        stream: false,
        options: {
          temperature: 0.3,
          top_p: 0.9,
          num_predict: 800,  // Reduzido para ~600 tokens — mais rápido em CPU
        },
      }),
      signal: AbortSignal.timeout(180_000), // 180s — necessário para CPU sem GPU
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as {
      message?: { content?: string };
      done?: boolean;
    };

    const rawText: string = data.message?.content ?? "";

    // Parsear resposta estruturada do LLM
    const parsed = parseOllamaResponse(rawText, request);

    return {
      ...parsed,
      modelUsed: "ollama",
      processingTimeMs: Date.now() - start,
    };
  }
}

// ─── Construção do Prompt ─────────────────────────────────────────────────────

function buildSystemPrompt(): string {
  return `Você é um especialista em segurança da informação e compliance (LGPD/GDPR/EU AI Act).
Analise cenários de vazamento de dados e responda SEMPRE em JSON válido e conciso.
Seja direto e objetivo. Sem texto fora do JSON.`;
}

function buildUserMessage(request: RiskAgentRequest): string {
  const { calculatedRisk, description, sector = "Geral", complianceContext = "LGPD" } = request;

  const categoriesText = calculatedRisk.categoryBreakdown
    .filter((c) => c.recordCount > 0)
    .map((c) => `${c.label}: ${c.recordCount.toLocaleString("pt-BR")} registros`)
    .join(", ");

  return `Incidente: ${description}
Setor: ${sector} | Compliance: ${complianceContext} | Registros: ${categoriesText || "não especificado"}
Indicadores financeiros didáticos (não calibrados): central ${formatCompact(calculatedRisk.medianLossBRL)} | cauda ${formatCompact(calculatedRisk.tailRiskP95BRL)} | Nível: ${calculatedRisk.riskLevel}

Responda em JSON com exatamente esta estrutura:
{"analysis":"2 parágrafos técnicos em PT-BR","recommendations":["ação 1","ação 2","ação 3"],"complianceFlags":[{"framework":"LGPD","article":"Art. 48","severity":"VIOLATION","description":"descrição"}],"riskLevel":"${calculatedRisk.riskLevel}"}`;
}

// ─── Parser da Resposta Ollama ────────────────────────────────────────────────

function parseOllamaResponse(
  rawText: string,
  request: RiskAgentRequest
): Omit<RiskAgentResponse, "modelUsed" | "processingTimeMs"> {
  try {
    // Extrair bloco JSON da resposta (o LLM pode adicionar texto extra)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        analysis: parsed.analysis ?? rawText,
        recommendations: Array.isArray(parsed.recommendations)
          ? parsed.recommendations
          : [rawText],
        complianceFlags: Array.isArray(parsed.complianceFlags)
          ? (parsed.complianceFlags as ComplianceFlag[])
          : [],
        riskLevel: parsed.riskLevel ?? request.calculatedRisk.riskLevel,
      };
    }
  } catch {
    // Parse falhou — usar texto bruto como análise narrativa
    console.warn("[OllamaAgent] Falha ao parsear JSON da resposta. Usando texto bruto.");
  }

  // Fallback: texto bruto como análise
  return {
    analysis: rawText || "O modelo não retornou uma análise válida.",
    recommendations: [
      "Análise disponível no campo acima.",
      "Para análise estruturada, verifique se o modelo suporta geração de JSON.",
    ],
    complianceFlags: [],
    riskLevel: request.calculatedRisk.riskLevel,
  };
}
