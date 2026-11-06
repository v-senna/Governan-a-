// app/api/analyze/route.ts
/**
 * Endpoint de Análise de Risco via Ollama (LLaMA Local)
 * 
 * Recebe: description (string) + recordsCount (objeto com contagens por categoria)
 * Retorna: análise narrativa gerada pelo LLM com watermark de rastreabilidade
 * 
 * Segurança:
 * - Roda 100% server-side (Next.js Route Handler)
 * - Nunca expõe a URL do Ollama ao cliente
 * - Valida e sanitiza todos os inputs antes de enviar ao modelo
 */

import { NextResponse } from 'next/server';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface AnalyzeRequest {
  description: string;
  recordsCount: Record<string, number>;
  complianceContext?: 'LGPD' | 'GDPR' | 'EU_AI_ACT' | 'ISO_27001';
  sector?: string;
}

// ─── Handler Principal ────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json() as AnalyzeRequest;
    const { description, recordsCount, complianceContext = 'LGPD', sector = 'Geral' } = body;

    // Validação básica de input
    if (!description || typeof description !== 'string' || description.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: 'Descrição inválida ou muito curta.' },
        { status: 400 }
      );
    }

    const ollamaUrl = process.env.OLLAMA_BASE_URL ?? process.env.AI_OLLAMA_BASE_URL ?? 'http://localhost:11434';
    const model = process.env.OLLAMA_MODEL ?? process.env.AI_OLLAMA_MODEL ?? 'llama3.2';

    // ─── 1. Prompt do Agente ─────────────────────────────────────────────────

    const systemPrompt = `Você é um Agente de Governança e Análise de Risco de Dados especializado no contexto brasileiro, inspirado no EU AI Act e na LGPD.

Suas responsabilidades ao analisar um incidente:
1. **Identificar os afetados** — Quem serão as vítimas diretas e indiretas (clientes, colaboradores, grupos vulneráveis)?
2. **Efeito de correlação maliciosa** — Explique como dados aparentemente insignificantes (e-mails isolados, logs de acesso, números de telefone) se tornam armas poderosas quando cruzados por agentes maliciosos para fraudes e extorsão.
3. **Impacto financeiro** — Explique que o simulador usa parâmetros didáticos não calibrados; não estime multa ou prejuízo como fato. Sugira levantar custos internos documentados com especialistas.
4. **3 Medidas Técnicas Imediatas** — Contenção, investigação e avaliação humana de obrigações de comunicação.
5. **Enquadramento legal** — Artigos da LGPD ou EU AI Act mais relevantes para o caso.

Responda em português, de forma técnica e objetiva, usando tópicos e marcadores. Seja específico e direto.`;

    const totalRecords = Object.values(recordsCount).reduce((s: number, v: number) => s + v, 0);
    const recordsText = Object.entries(recordsCount)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => `  • ${k.replace(/_/g, ' ')}: ${v.toLocaleString('pt-BR')} registros`)
      .join('\n');

    const userMessage = `**Cenário do Incidente:** ${description.trim()}

**Setor:** ${sector}
**Contexto de Compliance:** ${complianceContext}
**Total de Registros Comprometidos:** ${totalRecords.toLocaleString('pt-BR')}

**Distribuição por Categoria:**
${recordsText || '  • Não especificado'}

Apresente seu parecer técnico de risco completo:`;

    // ─── 2. Chamada à API do Ollama (endpoint /api/chat) ─────────────────────

    const ollamaResponse = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        stream: false, // Retorna o texto completo de uma vez
        options: {
          temperature: 0.3,  // Baixa variabilidade para análise técnica
          top_p: 0.9,
          num_predict: 2000, // ~1500 tokens de saída
        },
      }),
      signal: AbortSignal.timeout(90_000), // 90s timeout para modelos grandes
    });

    if (!ollamaResponse.ok) {
      const errText = await ollamaResponse.text();
      console.error(`[/api/analyze] Ollama retornou ${ollamaResponse.status}:`, errText);
      throw new Error(`Ollama respondeu com status ${ollamaResponse.status}`);
    }

    const data = await ollamaResponse.json() as {
      message?: { content?: string };
      done?: boolean;
      eval_duration?: number;
    };

    const analysisText = data.message?.content ?? 'Sem resposta do modelo.';
    const processingMs = data.eval_duration ? Math.round(data.eval_duration / 1_000_000) : null;

    // ─── 3. Resposta com metadados de rastreabilidade ─────────────────────────

    return NextResponse.json({
      success: true,
      analysis: analysisText,
      isAiGenerated: true,
      modelUsed: `ollama/${model}`,
      watermark: `LOCAL-OLLAMA-${Date.now().toString(36).toUpperCase()}`,
      evaluatedAt: new Date().toISOString(),
      processingMs,
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';

    // Distinguir timeout de outros erros
    const isTimeout = message.includes('timed out') || message.includes('abort');
    const isConnection = message.includes('ECONNREFUSED') || message.includes('fetch failed');

    console.error('[/api/analyze] Erro:', message);

    return NextResponse.json(
      {
        success: false,
        error: isTimeout
          ? 'Timeout: o modelo demorou mais que 90s para responder. Tente um modelo menor.'
          : isConnection
          ? 'Ollama não está acessível em ' + (process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434') + '. Verifique se o serviço está rodando.'
          : `Falha ao conectar com o Ollama local: ${message}`,
      },
      { status: 500 }
    );
  }
}

// ─── Health Check ─────────────────────────────────────────────────────────────

export async function GET() {
  const ollamaUrl = process.env.OLLAMA_BASE_URL ?? process.env.AI_OLLAMA_BASE_URL ?? 'http://localhost:11434';
  const model = process.env.OLLAMA_MODEL ?? process.env.AI_OLLAMA_MODEL ?? 'llama3.2';

  try {
    const res = await fetch(`${ollamaUrl}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) {
      return NextResponse.json({ healthy: false, error: `Ollama retornou ${res.status}` });
    }

    const data = await res.json() as { models?: Array<{ name: string }> };
    const availableModels = data.models?.map((m) => m.name) ?? [];
    const modelAvailable = availableModels.some((m) => m.startsWith(model.split(':')[0]));

    return NextResponse.json({
      healthy: true,
      ollamaUrl,
      model,
      modelAvailable,
      availableModels,
    });
  } catch {
    return NextResponse.json({
      healthy: false,
      ollamaUrl,
      model,
      error: 'Ollama não está acessível. Execute: ollama serve',
    });
  }
}
