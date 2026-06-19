import mongoose from "mongoose";

const { Schema, models, model } = mongoose;

const notificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: [
        "outbid",
        "won",
        "lost",
        "auction_approved",
        "auction_rejected",
        "auction_ended",
        "new_order",
        "message",
        "report_update",
        "system",
      ],
      required: true,
    },
    title: { en: String, bn: String },
    body: { en: String, bn: String },
    link: { type: String, default: "" },
    meta: { type: Schema.Types.Mixed, default: {} },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

export default models.Notification || model("Notification", notificationSchema);
