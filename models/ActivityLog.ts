import mongoose, { Schema, Document, Model } from "mongoose";

export interface IActivityLog extends Document {
  action: string;
  entity: string;
  entityId?: string;
  userId: mongoose.Types.ObjectId;
  userName: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

ActivityLogSchema.index({ createdAt: -1 });

const ActivityLog: Model<IActivityLog> =
  mongoose.models.ActivityLog ||
  mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);

export default ActivityLog;
