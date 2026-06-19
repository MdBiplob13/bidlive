import mongoose from "mongoose";

const { Schema, models, model } = mongoose;

const adminLogSchema = new Schema(
  {
    admin: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    action: { type: String, required: true }, // e.g. "user.ban", "auction.approve"
    targetType: { type: String, default: "" }, // "user" | "auction" | "bid" | ...
    targetId: { type: Schema.Types.ObjectId, default: null },
    note: { type: String, default: "" },
    meta: { type: Schema.Types.Mixed, default: {} },
    ip: { type: String, default: "" },
  },
  { timestamps: true }
);

adminLogSchema.index({ createdAt: -1 });

export default models.AdminLog || model("AdminLog", adminLogSchema);
