/**
 * Trilha de Auditoria Tamper-Proof
 * Implementa uma cadeia de hashes inspirada em Merkle Trees.
 * Cada evento contém um hash que depende do evento anterior,
 * tornando a adulteração retroativa detectável.
 * @module auditLogger
 */

import crypto from "crypto";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type AuditEventType =
  | "SIMULATION_CREATED"
  | "SIMULATION_VIEWED"
  | "AGENT_INVOKED"
  | "AGENT_RESPONSE_RECEIVED"
  | "AUDIT_LOG_VIEWED"
  | "REPORT_GENERATED"
  | "SYSTEM_INITIALIZED";

export interface AuditEvent {
  id: string;
  timestamp: string; // ISO 8601
  eventType: AuditEventType;
  userId: string; // SHA-256 do identificador de sessão
  payloadHash: string; // SHA-256 do payload do evento
  prevHash: string; // Hash do evento anterior (ou "GENESIS" para o primeiro)
  signature: string; // hash(prevHash + payloadHash + timestamp) — cadeia imutável
  metadata?: Record<string, string | number | boolean>;
}

export interface AuditChainVerification {
  isValid: boolean;
  totalEvents: number;
  invalidEventIndex?: number;
  invalidEventId?: string;
  error?: string;
}

// ─── Store em Memória (volátil — adequado para demo) ─────────────────────────

const auditChain: AuditEvent[] = [];

// ─── Helpers de Criptografia ──────────────────────────────────────────────────

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

function getLastHash(): string {
  if (auditChain.length === 0) return "GENESIS";
  return auditChain[auditChain.length - 1].signature;
}

function generateEventId(): string {
  return crypto.randomUUID();
}

/**
 * Deriva um userId anonimizado a partir de um identificador de sessão.
 * Isso garante rastreabilidade sem expor dados pessoais do usuário.
 */
export function deriveUserId(sessionIdentifier: string): string {
  const secret = process.env.AUDIT_SECRET_KEY ?? "default-secret-dev-only";
  return sha256(`${secret}:${sessionIdentifier}`).substring(0, 16);
}

// ─── Função Principal de Logging ──────────────────────────────────────────────

export async function logAuditEvent(
  eventType: AuditEventType,
  payload: Record<string, unknown>,
  options?: {
    userId?: string;
    metadata?: Record<string, string | number | boolean>;
  }
): Promise<AuditEvent> {
  const id = generateEventId();
  const timestamp = new Date().toISOString();
  const prevHash = getLastHash();
  const userId = options?.userId ?? deriveUserId("anonymous");

  // Serializar payload de forma determinística para hashing
  const payloadString = JSON.stringify(payload, Object.keys(payload).sort());
  const payloadHash = sha256(payloadString);

  // Assinatura encadeada: hash(prevHash + payloadHash + timestamp)
  const signatureInput = `${prevHash}${payloadHash}${timestamp}`;
  const signature = sha256(signatureInput);

  const event: AuditEvent = {
    id,
    timestamp,
    eventType,
    userId,
    payloadHash,
    prevHash,
    signature,
    metadata: options?.metadata,
  };

  auditChain.push(event);
  return event;
}

// ─── Leitura de Logs ──────────────────────────────────────────────────────────

export function getAuditLogs(options?: {
  limit?: number;
  eventType?: AuditEventType;
}): AuditEvent[] {
  let logs = [...auditChain].reverse(); // Mais recentes primeiro

  if (options?.eventType) {
    logs = logs.filter((e) => e.eventType === options.eventType);
  }

  if (options?.limit) {
    logs = logs.slice(0, options.limit);
  }

  return logs;
}

// ─── Verificação de Integridade da Cadeia ─────────────────────────────────────

export function verifyAuditChain(): AuditChainVerification {
  if (auditChain.length === 0) {
    return { isValid: true, totalEvents: 0 };
  }

  for (let i = 0; i < auditChain.length; i++) {
    const event = auditChain[i];

    // Verificar prevHash
    const expectedPrevHash = i === 0 ? "GENESIS" : auditChain[i - 1].signature;
    if (event.prevHash !== expectedPrevHash) {
      return {
        isValid: false,
        totalEvents: auditChain.length,
        invalidEventIndex: i,
        invalidEventId: event.id,
        error: `Cadeia quebrada no evento ${i}: prevHash inválido`,
      };
    }

    // Re-calcular e verificar a assinatura
    const signatureInput = `${event.prevHash}${event.payloadHash}${event.timestamp}`;
    const expectedSignature = sha256(signatureInput);
    if (event.signature !== expectedSignature) {
      return {
        isValid: false,
        totalEvents: auditChain.length,
        invalidEventIndex: i,
        invalidEventId: event.id,
        error: `Assinatura inválida no evento ${i}: possível adulteração detectada`,
      };
    }
  }

  return { isValid: true, totalEvents: auditChain.length };
}

// ─── Inicialização do Sistema ──────────────────────────────────────────────────

export async function initializeAuditLog(): Promise<void> {
  if (auditChain.length === 0) {
    await logAuditEvent(
      "SYSTEM_INITIALIZED",
      {
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        mode: process.env.AI_AGENT_MODE ?? "mock",
      },
      { userId: "SYSTEM" }
    );
  }
}
