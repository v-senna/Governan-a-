"use server";

/**
 * Server Actions para leitura da Trilha de Auditoria
 */

import { getAuditLogs, verifyAuditChain, initializeAuditLog, AuditEventType } from "@/lib/auditLogger";
import { logAuditEvent, deriveUserId } from "@/lib/auditLogger";
import { headers } from "next/headers";

export async function getAuditLogsAction(options?: {
  limit?: number;
  eventType?: AuditEventType;
}) {
  // Inicializar log se necessário
  await initializeAuditLog();

  // Registrar visualização da auditoria
  const headersList = await headers();
  const sessionId = headersList.get("x-forwarded-for") ?? "anonymous";
  const userId = deriveUserId(sessionId);

  await logAuditEvent("AUDIT_LOG_VIEWED", { queryOptions: JSON.stringify(options ?? {}) }, { userId });

  const logs = getAuditLogs(options);
  const verification = verifyAuditChain();

  return {
    logs,
    verification,
    totalEvents: logs.length,
  };
}

export async function verifyChainIntegrityAction() {
  return verifyAuditChain();
}
