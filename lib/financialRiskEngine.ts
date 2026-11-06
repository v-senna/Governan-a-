/**
 * Motor de Risco Financeiro — Quantificação Monetária em Reais (R$)
 * Parâmetros didáticos não calibrados; não são previsão de perdas ou dados de benchmark.
 * @module financialRiskEngine
 */

// ─── Categorias de Registros ─────────────────────────────────────────────────

export type RecordCategory =
  | "PII_CLIENTE"
  | "PII_COLABORADOR"
  | "DADOS_CORPORATIVOS"
  | "PROPRIEDADE_INTELECTUAL"
  | "DADOS_NAO_PII";

export interface RecordCategoryMeta {
  label: string;
  description: string;
  baseCostUSD: number; // Parâmetro fictício de demonstração, não custo por registro observado
  color: string;
}

export const RECORD_CATEGORIES: Record<RecordCategory, RecordCategoryMeta> = {
  PII_CLIENTE: {
    label: "PII de Clientes",
    description: "Dados pessoais identificáveis de clientes (CPF, e-mail, endereço, histórico de compras)",
    baseCostUSD: 183,
    color: "#ef4444",
  },
  PII_COLABORADOR: {
    label: "PII de Colaboradores",
    description: "Dados pessoais de funcionários (holerites, dados bancários, prontuários médicos)",
    baseCostUSD: 181,
    color: "#f97316",
  },
  DADOS_CORPORATIVOS: {
    label: "Dados Corporativos / Segredos de Negócio",
    description: "Estratégias empresariais, contratos, dados financeiros internos",
    baseCostUSD: 168,
    color: "#eab308",
  },
  PROPRIEDADE_INTELECTUAL: {
    label: "Propriedade Intelectual",
    description: "Código-fonte, patentes, fórmulas, designs proprietários",
    baseCostUSD: 156,
    color: "#8b5cf6",
  },
  DADOS_NAO_PII: {
    label: "Dados Não-PII",
    description: "Logs de sistema, dados de uso anônimos, metadados operacionais",
    baseCostUSD: 138,
    color: "#06b6d4",
  },
};

// ─── Centros de Custo ─────────────────────────────────────────────────────────

export interface CostCenter {
  label: string;
  description: string;
  percentage: number;
  color: string;
}

export const COST_CENTERS: CostCenter[] = [
  {
    label: "Detecção e Escalonamento",
    description: "Forense digital, triagem de incidentes, comunicação interna",
    percentage: 0.36,
    color: "#3b82f6",
  },
  {
    label: "Perda de Negócios / Reputação",
    description: "Churn de clientes, desvalorização de marca, perda de contratos",
    percentage: 0.29,
    color: "#ef4444",
  },
  {
    label: "Resposta Pós-Violação / Jurídico",
    description: "Advogados, regulatórios, remediação técnica, seguro cyber",
    percentage: 0.27,
    color: "#f97316",
  },
  {
    label: "Notificação de Partes Afetadas",
    description: "Comunicação com titulares, ANPD/GDPR, call center de suporte",
    percentage: 0.08,
    color: "#22c55e",
  },
];

// ─── Transformações ilustrativas (não calibradas) ────────────────────────────

/**
 * Fatores de escala arbitrários para demonstrar cenários. Não representam
 * distribuição empírica, percentis reais, probabilidade ou perda prevista.
 */
const LOG_NORMAL_MU = 0.0; // centralizado no valor esperado
const LOG_NORMAL_SIGMA = 1.3; // alta variância observada em vazamentos reais

function logNormalMedian(linearCost: number): number {
  // Escala ilustrativa calculada a partir de parâmetros arbitrários.
  // Fator didático, sem evidência empírica.
  const adjustmentFactor = Math.exp(LOG_NORMAL_MU - 0.5 * LOG_NORMAL_SIGMA * 0.4);
  return linearCost * adjustmentFactor;
}

function logNormalP95(linearCost: number): number {
  // Rótulo legado de cauda didática; não é um P95 validado.
  const p95Factor = Math.exp(1.645 * LOG_NORMAL_SIGMA * 0.6);
  return linearCost * p95Factor;
}

// ─── Tipos de Resultado ───────────────────────────────────────────────────────

export interface CostCenterBreakdown {
  label: string;
  description: string;
  amountBRL: number;
  percentage: number;
  color: string;
}

export interface CorrelationAlert {
  title: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface FinancialRiskResult {
  // Totais por categoria
  categoryBreakdown: Array<{
    category: RecordCategory;
    label: string;
    recordCount: number;
    costPerRecordBRL: number;
    totalBRL: number;
    color: string;
  }>;

  // Decomposição por centro de custo
  costCenterBreakdown: CostCenterBreakdown[];

  // Três cenários de perda
  linearExposureBRL: number; // Teórico máximo (pior caso absoluto)
  medianLossBRL: number; // Transformação didática do valor linear; não previsão
  tailRiskP95BRL: number; // Transformação didática; não percentil validado

  // Metadados
  totalRecords: number;
  exchangeRateUSD: number;
  alerts: CorrelationAlert[];
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  complianceFines: {
    lgpdMaxBRL: number; // 2% faturamento ou R$ 50M por infração
    gdprMaxBRL: number; // 4% faturamento global ou €20M
  };
}

// ─── Alertas de Correlação "Insignificante → Destrutivo" ─────────────────────

function generateCorrelationAlerts(
  breakdown: Record<RecordCategory, number>,
  totalRecords: number
): CorrelationAlert[] {
  const alerts: CorrelationAlert[] = [];

  if ((breakdown.DADOS_NAO_PII ?? 0) > 0 && (breakdown.PII_CLIENTE ?? 0) > 0) {
    alerts.push({
      title: "⚡ Efeito Mosaico: Logs + PII",
      description:
        "Logs de sistema aparentemente anônimos, quando correlacionados com e-mails de clientes, " +
        "podem aumentar o risco de associação e reidentificação, dependendo do contexto, granularidade e controles. " +
        "Este alerta é uma hipótese didática, não uma medição de precisão.",
      severity: "HIGH",
    });
  }

  if ((breakdown.PII_COLABORADOR ?? 0) > 100) {
    alerts.push({
      title: "🎯 Risco de Spear-Phishing Interno",
      description:
        `Com ${(breakdown.PII_COLABORADOR ?? 0).toLocaleString("pt-BR")} registros de colaboradores expostos, ` +
        "atacantes podem criar campanhas de engenharia social altamente personalizadas, " +
        "impersonando colegas ou superiores para obter credenciais de sistemas críticos.",
      severity: "CRITICAL",
    });
  }

  if ((breakdown.PROPRIEDADE_INTELECTUAL ?? 0) > 0 && (breakdown.DADOS_CORPORATIVOS ?? 0) > 0) {
    alerts.push({
      title: "🏭 Risco de Espionagem Industrial",
      description:
        "A combinação de Propriedade Intelectual + Dados Corporativos exposta simultaneamente " +
        "representa o pacote ideal para espionagem industrial. Concorrentes ou Estados-nação " +
        "podem usar esses dados para replicar vantagens competitivas em 6-18 meses.",
      severity: "CRITICAL",
    });
  }

  if (totalRecords < 500 && totalRecords > 0) {
    alerts.push({
      title: "🔬 Ilusão de 'Poucos Dados'",
      description:
        `O volume é de ${totalRecords.toLocaleString("pt-BR")} registros. Quantidade isolada não determina impacto; ` +
        "avalie sensibilidade, possibilidade de ligação, contexto e controles. Este alerta não estima probabilidade.",
      severity: "MEDIUM",
    });
  }

  if (totalRecords > 100000) {
    alerts.push({
      title: "📊 Escala de exposição: avaliar comunicação",
      description:
        `A exposição envolve ${totalRecords.toLocaleString("pt-BR")} registros. Avalie o risco e os critérios legais/regulatórios ` +
        "de comunicação aplicáveis ao caso com o encarregado e assessoria jurídica. O volume, por si só, não determina obrigação ou prazo.",
      severity: "CRITICAL",
    });
  }

  return alerts;
}

// ─── Função Principal ─────────────────────────────────────────────────────────

export function calculateFinancialRisk(
  recordsBreakdown: Partial<Record<RecordCategory, number>>,
  options?: {
    exchangeRateUSD?: number;
    annualRevenueBRL?: number; // para cálculo de multa LGPD
  }
): FinancialRiskResult {
  const exchangeRate = options?.exchangeRateUSD ?? 5.6;
  const annualRevenueBRL = options?.annualRevenueBRL ?? 100_000_000; // R$ 100M default

  // 1. Calcular custo por categoria
  const categoryBreakdown = (Object.entries(recordsBreakdown) as [RecordCategory, number][])
    .filter(([, count]) => count > 0)
    .map(([category, count]) => {
      const meta = RECORD_CATEGORIES[category];
      const costPerRecordBRL = meta.baseCostUSD * exchangeRate;
      return {
        category,
        label: meta.label,
        recordCount: count,
        costPerRecordBRL,
        totalBRL: costPerRecordBRL * count,
        color: meta.color,
      };
    });

  const linearExposureBRL = categoryBreakdown.reduce((sum, c) => sum + c.totalBRL, 0);
  const totalRecords = categoryBreakdown.reduce((sum, c) => sum + c.recordCount, 0);

  // 2. Decomposição por centro de custo (sobre a exposição linear)
  const costCenterBreakdown: CostCenterBreakdown[] = COST_CENTERS.map((cc) => ({
    label: cc.label,
    description: cc.description,
    amountBRL: linearExposureBRL * cc.percentage,
    percentage: cc.percentage * 100,
    color: cc.color,
  }));

  // 3. Modelagem Log-Normal
  const medianLossBRL = logNormalMedian(linearExposureBRL);
  const tailRiskP95BRL = logNormalP95(linearExposureBRL);

  // 4. Multas de Compliance
  const lgpdMaxBRL = Math.min(annualRevenueBRL * 0.02, 50_000_000);
  const gdprMaxBRL = Math.min(annualRevenueBRL * 0.04, 20_000_000 * exchangeRate);

  // 5. Nível de risco
  let riskLevel: FinancialRiskResult["riskLevel"] = "LOW";
  if (medianLossBRL > 50_000_000) riskLevel = "CRITICAL";
  else if (medianLossBRL > 10_000_000) riskLevel = "HIGH";
  else if (medianLossBRL > 1_000_000) riskLevel = "MEDIUM";

  // 6. Alertas educativos
  const alerts = generateCorrelationAlerts(
    recordsBreakdown as Record<RecordCategory, number>,
    totalRecords
  );

  return {
    categoryBreakdown,
    costCenterBreakdown,
    linearExposureBRL,
    medianLossBRL,
    tailRiskP95BRL,
    totalRecords,
    exchangeRateUSD: exchangeRate,
    alerts,
    riskLevel,
    complianceFines: {
      lgpdMaxBRL,
      gdprMaxBRL,
    },
  };
}

// ─── Utilitários de Formatação ────────────────────────────────────────────────

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompact(value: number): string {
  if (value >= 1_000_000_000) return `R$ ${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}K`;
  return formatBRL(value);
}
