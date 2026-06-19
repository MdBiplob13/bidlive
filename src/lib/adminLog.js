import AdminLog from "@/models/AdminLog";

export async function logAdmin({ admin, action, targetType = "", targetId = null, note = "", meta = {}, ip = "" }) {
  try {
    return await AdminLog.create({ admin, action, targetType, targetId, note, meta, ip });
  } catch (e) {
    console.error("[adminLog] failed", e.message);
    return null;
  }
}
