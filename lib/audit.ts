import db from "@/lib/db";

type AuditInput = {
  userId?: string | null;
  recordId: string | number;
  action: string;
  model: string;
  details?: string;
};

export async function createAuditLog({
  userId,
  recordId,
  action,
  model,
  details,
}: AuditInput) {
  try {
    await db.auditLog.create({
      data: {
        user_id: userId || "system",
        record_id: String(recordId),
        action,
        model,
        details,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log", error);
  }
}
