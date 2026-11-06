// app/api/analyze/stream/route.ts
/**
 * Endpoint de Streaming para Análise via Ollama (Server-Sent Events)
 *
 * Mantém a conexão HTTP aberta enquanto o Ollama processa, enviando
 * heartbeat a cada 5s para evitar timeout no browser e no servidor.
 *
 * Eventos SSE:
 *   data: {"type":"heartbeat","elapsed":5}
 *   data: {"type":"result","success":true,"analysis":...}
 *   data: {"type":"error","message":"..."}
 */

import { NextResponse } from 'next/server';
import { calculateFinancialRisk } from '@/lib/financialRiskEngine';
import type { RecordCategory } from '@/lib/financialRiskEngine';

interface StreamAnalyzeRequest {
  description: string;
  recordsBreakdown: Partial<Record<RecordCategory, number>>;
  complianceContext?: 'LGPD' | 'GDPR' | 'EU_AI_ACT' | 'ISO_27001';
  sector?: string;
  exchangeRateUSD?: number;
}

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // Vercel: até 5 minutos (plano pro)

export async function POST(request: Request) {
  const body = await request.json() as StreamAnalyzeRequest;
  const {
    description,
    recordsBreakdown = {},
    complianceContext = 'LGPD',
    sector = 'Geral',
    exchangeRateUSD = 5.6,
  } = body;

  // Validação
  if (!description || description.trim().length < 5) {
    return NextResponse.json({ error: 'Descrição inválida' }, { status: 400 });
  }

  const ollamaUrl = process.env.OLLAMA_BASE_URL ?? process.env.AI_OLLAMA_BASE_URL ?? 'http://localhost:11434';
  const model = process.env.OLLAMA_MODEL ?? process.env.AI_OLLAMA_MODEL ?? 'llama3.2';

  const calculatedRisk = calculateFinancialRisk(recordsBreakdown, { exchangeRateUSD });

  const categoriesText = calculatedRisk.categoryBreakdown
    .filter((c) => c.recordCount > 0)
    .map((c) => `${c.label}: ${c.recordCount.toLocaleString('pt-BR')} registros`)
    .join(', ');

  const systemPrompt = `Você é um especialista em segurança da informação e compliance (LGPD/GDPR/EU AI Act).
Analise cenários de vazamento de dados e responda SEMPRE em JSON válido e conciso.
Seja direto e objetivo. Sem texto fora do JSON.`;

  const userMessage = `Incidente: ${description}
Setor: ${sector} | Compliance: ${complianceContext} | Registros: ${categoriesText || 'não especificado'}
Indicador financeiro didático: R$ ${calculatedRisk.medianLossBRL.toLocaleString('pt-BR')} | Nível: ${calculatedRisk.riskLevel}

Responda em JSON:
{"analysis":"2 parágrafos técnicos em PT-BR","recommendations":["ação 1","ação 2","ação 3"],"complianceFlags":[{"framework":"LGPD","article":"Art. 48","severity":"VIOLATION","description":"descrição"}],"riskLevel":"${calculatedRisk.riskLevel}"}`;

  const encoder = new TextEncoder();
  let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  let finished = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          // cliente desconectou
        }
      };

      const startTime = Date.now();

      // Heartbeat a cada 8s para manter conexão viva
      heartbeatInterval = setInterval(() => {
        if (!finished) {
          send({ type: 'heartbeat', elapsed: Math.round((Date.now() - startTime) / 1000) });
        }
      }, 8000);

      try {
        send({ type: 'started', message: 'Agente iniciado. Processando análise...' });

        const ollamaResponse = await fetch(`${ollamaUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage },
            ],
            stream: false,
            options: {
              temperature: 0.3,
              top_p: 0.9,
              num_predict: 800,
            },
          }),
          signal: AbortSignal.timeout(240_000), // 4 minutos
        });

        if (!ollamaResponse.ok) {
          const errText = await ollamaResponse.text();
          send({ type: 'error', message: `Ollama retornou ${ollamaResponse.status}: ${errText.slice(0, 200)}` });
          return;
        }

        const data = await ollamaResponse.json() as {
          message?: { content?: string };
          done?: boolean;
          eval_duration?: number;
        };

        const rawText = data.message?.content ?? '';
        const processingMs = data.eval_duration ? Math.round(data.eval_duration / 1_000_000) : Date.now() - startTime;

        // Parsear JSON da resposta
        let parsed: {
          analysis?: string;
          recommendations?: string[];
          complianceFlags?: unknown[];
          riskLevel?: string;
        } = {};

        try {
          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0]);
          }
        } catch {
          // usar texto bruto
        }

        send({
          type: 'result',
          success: true,
          analysis: parsed.analysis ?? rawText,
          recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [rawText],
          complianceFlags: Array.isArray(parsed.complianceFlags) ? parsed.complianceFlags : [],
          riskLevel: parsed.riskLevel ?? calculatedRisk.riskLevel,
          modelUsed: `ollama/${model}`,
          processingMs,
          watermark: `SSE-OLLAMA-${Date.now().toString(36).toUpperCase()}`,
        });

      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erro desconhecido';
        const isTimeout = message.toLowerCase().includes('timeout') || message.toLowerCase().includes('abort');

        send({
          type: 'error',
          message: isTimeout
            ? `Timeout: o modelo demorou mais de ${Math.round((Date.now() - startTime) / 1000)}s. Tente reduzir a complexidade do prompt ou usar um modelo menor.`
            : `Falha ao conectar com o Ollama: ${message}`,
        });
      } finally {
        finished = true;
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        try { controller.close(); } catch { /* ignore */ }
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // desativa buffering no Nginx/Vercel
    },
  });
}
