import { connectDB } from "./db";
import ActivityLog from "@/models/ActivityLog";

interface LogOptions {
  action: string;
  entity: string;
  entityId?: string;
  userId: string;
  userName: string;
  metadata?: Record<string, unknown>;
}

export async function logActivity(opts: LogOptions): Promise<void> {
  try {
    await connectDB();
    await ActivityLog.create(opts);
  } catch (err) {
    console.error("Failed to write activity log:", err);
  }
}
