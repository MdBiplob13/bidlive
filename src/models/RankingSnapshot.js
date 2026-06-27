import mongoose from "mongoose";

const { Schema, models, model } = mongoose;

const rankingRewardSchema = new Schema(
  {
    rankStart: { type: Number, required: true },
    rankEnd: { type: Number, required: true },
    couponCode: { type: String, required: true, trim: true },
    configName: { type: String, default: "" },
    status: { type: String, default: "earned" },
  },
  { _id: false }
);

const rankingItemSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, default: "" },
    auctionSpend: { type: Number, default: 0 },
    walletSpend: { type: Number, default: 0 },
    totalSpend: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    rewards: { type: [rankingRewardSchema], default: [] },
  },
  { _id: false }
);

const rankingSnapshotSchema = new Schema(
  {
    periodType: {
      type: String,
      required: true,
      enum: ["weekly", "monthly", "yearly"],
      index: true,
    },
    periodKey: { type: String, required: true, index: true },
    periodLabel: { type: String, required: true },
    preview: { type: Boolean, default: true },
    items: { type: [rankingItemSchema], default: [] },
  },
  { timestamps: true }
);

rankingSnapshotSchema.index({ periodType: 1, periodKey: -1 });

export default models.RankingSnapshot || model("RankingSnapshot", rankingSnapshotSchema);
