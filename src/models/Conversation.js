import mongoose from "mongoose";

const { Schema, models, model } = mongoose;

const conversationSchema = new Schema(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true, index: true }],
    auction: { type: Schema.Types.ObjectId, ref: "Auction", default: null },
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: Date.now, index: true },
    lastSender: { type: Schema.Types.ObjectId, ref: "User", default: null },
    // unread counts keyed by user id
    unread: { type: Map, of: Number, default: {} },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1, lastMessageAt: -1 });

export default models.Conversation || model("Conversation", conversationSchema);
