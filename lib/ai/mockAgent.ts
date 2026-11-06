/**
 * Implementação Mock do Agente de IA
 * Funciona sem dependência externa de IA — 100% determinístico.
 * Usa templates sofisticados baseados nos dados reais de risco calculados.
 * @module ai/mockAgent
 */

import type { RiskAgent, RiskAgentRequest, RiskAgentResponse, ComplianceFlag } from "./types";
import { formatCompact, formatBRL } from "@/lib/financialRiskEngine";

export class MockRiskAgent implements RiskAgent {
  readonly agentType = "mock" as const;

  async healthCheck(): Promise<boolean> {
    return true; // Mock está sempre disponível
  }

  async analyze(request: RiskAgentRequest): Promise<RiskAgentResponse> {
    const start = Date.now();
    
    // Simular latência realista de processamento
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 400));

    const { calculatedRisk, sector = "Geral" } = request;
    const { riskLevel, medianLossBRL, tailRiskP95BRL, totalRecords, categoryBreakdown } = calculatedRisk;

    // ─── Análise Narrativa ──────────────────────────────────────────────────

    const topCategory = categoryBreakdown.sort((a, b) => b.totalBRL - a.totalBRL)[0];
    
    const riskNarrativeMap: Record<string, string> = {
      CRITICAL: `🔴 **ALERTA CRÍTICO** — Este cenário representa uma cenário de severidade didática elevada no setor de ${sector}. Com ${totalRecords.toLocaleString("pt-BR")} registros comprometidos e uma exposição mediana de ${formatCompact(medianLossBRL)}, o cenário requer avaliação humana prioritária; este rótulo é didático e não representa probabilidade calculada.

A categoria de maior impacto é **${topCategory?.label ?? "indefinida"}**, representando o vetor principal de risco financeiro e reputacional. O indicador de cauda didático apresenta **${formatCompact(tailRiskP95BRL)}**; não é percentil validado nem previsão de perda ou multa.

Recomenda-se acionamento **imediato** do Plano de Resposta a Incidentes (IRP) e notificação ao Comitê de Gestão de Crises dentro das próximas 2 horas.`,

      HIGH: `🟠 **RISCO ELEVADO** — O vazamento identificado no setor de ${sector} apresenta impacto financeiro substancial. Com ${totalRecords.toLocaleString("pt-BR")} registros afetados, a indicador financeiro didático é de ${formatCompact(medianLossBRL)}.

O vetor de maior risco identificado é **${topCategory?.label ?? "indefinido"}** (${formatBRL(topCategory?.totalBRL ?? 0)}). Os valores apresentados são parâmetros fictícios do simulador; não estimam churn, custos jurídicos ou desfechos regulatórios.

Avalie os critérios e prazos de comunicação aplicáveis com o encarregado e a assessoria jurídica; eles dependem das regras vigentes e do caso concreto.`,

      MEDIUM: `🟡 **RISCO MODERADO** — O cenário analisado no setor de ${sector} indica indicador de risco didático, mas que requer atenção imediata. Com ${totalRecords.toLocaleString("pt-BR")} registros comprometidos, a indicador financeiro didático é de ${formatCompact(medianLossBRL)}.

Embora este cenário esteja abaixo do limiar crítico, a experiência histórica mostra que eventos "moderados" frequentemente escalam devido a vazamentos secundários não identificados na análise inicial. A revisão completa do perímetro de dados é fortemente recomendada.`,

      LOW: `🟢 **RISCO BAIXO** — O cenário apresenta indicador financeiro didático (${formatCompact(medianLossBRL)}). Com ${totalRecords.toLocaleString("pt-BR")} registros afetados, a classificação não substitui avaliação contextual e controles adequados.

Contudo, não subestime este evento: a combinação de atributos pode aumentar o risco de associação ou reidentificação conforme contexto e granularidade. Revise os controles de acesso e implemente monitoramento contínuo.`,
    };

    const analysis = riskNarrativeMap[riskLevel] ?? riskNarrativeMap.MEDIUM;

    // ─── Recomendações ──────────────────────────────────────────────────────

    const recommendations = generateRecommendations(request);

    // ─── Flags de Compliance ────────────────────────────────────────────────

    const complianceFlags = generateComplianceFlags(request);

    return {
      analysis,
      recommendations,
      complianceFlags,
      riskLevel,
      modelUsed: "mock",
      processingTimeMs: Date.now() - start,
    };
  }
}

// ─── Helpers Internos ──────────────────────────────────────────────────────────

function generateRecommendations(request: RiskAgentRequest): string[] {
  const { calculatedRisk, recordsBreakdown } = request;
  const recs: string[] = [];

  // Recomendações baseadas no nível de risco
  if (calculatedRisk.riskLevel === "CRITICAL" || calculatedRisk.riskLevel === "HIGH") {
    recs.push("🚨 Acionar imediatamente o Plano de Resposta a Incidentes (IRP) e notificar o CISO e CEO");
    recs.push("⏱️ Avaliar imediatamente critérios e prazos de comunicação aplicáveis com jurídico/encarregado");
    recs.push("🔒 Isolar imediatamente os sistemas afetados para conter o vazamento ativo");
    recs.push("📋 Contratar empresa especializada em forense digital para preservação de evidências");
  }

  // Recomendações por categoria
  if ((recordsBreakdown.PII_CLIENTE ?? 0) > 0) {
    recs.push("📧 Preparar comunicação personalizada para clientes afetados com instruções de proteção (monitoramento de crédito, alertas de fraude)");
  }

  if ((recordsBreakdown.PII_COLABORADOR ?? 0) > 0) {
    recs.push("👥 Briefing de segurança obrigatório para todos os colaboradores: alerta sobre spear-phishing utilizando dados internos vazados");
  }

  if ((recordsBreakdown.PROPRIEDADE_INTELECTUAL ?? 0) > 0) {
    recs.push("⚖️ Consultar departamento jurídico sobre registros de patentes emergenciais e medidas cautelares contra uso indevido de PI");
  }

  if ((recordsBreakdown.DADOS_CORPORATIVOS ?? 0) > 0) {
    recs.push("🔑 Rotação imediata de todas as credenciais e tokens de acesso a sistemas críticos");
  }

  // Recomendações de médio prazo
  recs.push("🛡️ Implementar ou revisar programa de DLP (Data Loss Prevention) com classificação automática de dados sensíveis");
  recs.push("📊 Conduzir Privacy Impact Assessment (PIA) conforme LGPD Art. 10 para todos os processos de tratamento de dados");
  recs.push("🔐 Adotar criptografia AES-256 em repouso e TLS 1.3 em trânsito para todos os dados categorizados como sensíveis");
  recs.push("🎓 Implementar treinamento trimestral obrigatório de segurança para todos os colaboradores com acesso a dados pessoais");

  return recs;
}

function generateComplianceFlags(request: RiskAgentRequest): ComplianceFlag[] {
  const flags: ComplianceFlag[] = [];
  const { calculatedRisk, recordsBreakdown } = request;

  // LGPD
  if (calculatedRisk.totalRecords > 0) {
    flags.push({
      framework: "LGPD",
      article: "Art. 48",
      severity: calculatedRisk.totalRecords > 1000 ? "VIOLATION" : "WARNING",
      description: `Obrigação de comunicação à ANPD dentro de 72h (${calculatedRisk.totalRecords.toLocaleString("pt-BR")} titulares afetados)`,
    });
  }

  if ((recordsBreakdown.PII_CLIENTE ?? 0) > 0 || (recordsBreakdown.PII_COLABORADOR ?? 0) > 0) {
    flags.push({
      framework: "LGPD",
      article: "Art. 46",
      severity: "VIOLATION",
      description: "Falha em medidas de segurança técnicas e administrativas para dados pessoais (Art. 46 LGPD)",
    });
  }

  // EU AI Act (se sistema de IA foi usado para decisões sobre indivíduos)
  flags.push({
    framework: "EU AI Act",
    article: "Art. 10",
    severity: "WARNING",
    description: "Se sistemas de IA foram envolvidos no tratamento dos dados vazados, verificar conformidade com requisitos de qualidade de dados (Alto Risco)",
  });

  flags.push({
    framework: "EU AI Act",
    article: "Art. 13",
    severity: "INFO",
    description: "Obrigação de transparência: titulares têm direito de saber se decisões sobre eles foram automatizadas",
  });

  // ISO 27001
  flags.push({
    framework: "ISO 27001:2022",
    severity: "WARNING",
    description: "Controle A.5.24: Planejamento de resposta a incidentes de segurança da informação deve ser ativado",
  });

  // GDPR (se houver cidadãos europeus)
  if (calculatedRisk.totalRecords > 10000) {
    flags.push({
      framework: "GDPR",
      article: "Art. 83(4)",
      severity: "WARNING",
      description: `Multa potencial de até €10M ou 2% do faturamento global por violações de segurança em larga escala`,
    });
  }

  return flags;
}
