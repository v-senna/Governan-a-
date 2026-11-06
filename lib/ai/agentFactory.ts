/**
 * Factory de Agente de IA
 * Seleciona a implementação correta baseado em variáveis de ambiente.
 * Zero mudanças de código necessárias para trocar de mock para Ollama.
 * @module ai/agentFactory
 */

import type { RiskAgent } from "./types";
import { MockRiskAgent } from "./mockAgent";
import { OllamaRiskAgent } from "./ollamaAgent";
import { GeminiRiskAgent } from "./geminiAgent";

// Singleton — uma instância por processo Node.js
let agentInstance: RiskAgent | null = null;

export function getRiskAgent(): RiskAgent {
  if (agentInstance) return agentInstance;

  const mode = process.env.AI_AGENT_MODE?.toLowerCase() ?? "mock";

  if (mode === "ollama") {
    console.log("[AgentFactory] 🤖 Iniciando OllamaRiskAgent (LLaMA)");
    agentInstance = new OllamaRiskAgent();
  } else if (mode === "gemini") {
    console.log("[AgentFactory] ☁️ Iniciando GeminiRiskAgent (API server-side)");
    agentInstance = new GeminiRiskAgent();
  } else {
    console.log("[AgentFactory] 🎭 Iniciando MockRiskAgent (modo seguro)");
    agentInstance = new MockRiskAgent();
  }

  return agentInstance;
}

/**
 * Para testes — reseta o singleton
 */
export function resetAgentInstance(): void {
  agentInstance = null;
}
