import { prismadb as prisma } from "@/lib/prisma";

export type AuditEntry = {
  entity: string;
  entityId: string;
  action: string;
  changes?: Record<string, unknown>;
  userId?: string;
};

/**
 * Log an audit trail entry for any entity change
 */
export async function logAudit(entry: AuditEntry) {
  return prisma.auditLog.create({
    data: {
      entity: entry.entity,
      entityId: entry.entityId,
      action: entry.action,
      changes: entry.changes ? JSON.parse(JSON.stringify(entry.changes)) : undefined,
      userId: entry.userId,
    },
  });
}

/**
 * Get audit history for a specific entity
 */
export async function getAuditHistory(entity: string, entityId: string) {
  return prisma.auditLog.findMany({
    where: { entity, entityId },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get recent audit entries across all entities
 */
export async function getRecentAuditEntries(limit = 50) {
  return prisma.auditLog.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
