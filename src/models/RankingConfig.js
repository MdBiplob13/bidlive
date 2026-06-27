import mongoose from "mongoose";

const { Schema, models, model } = mongoose;

const rankingRuleSchema = new Schema(
  {
    rankStart: { type: Number, required: true, min: 1 },
    rankEnd: { type: Number, required: true, min: 1 },
    couponCode: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const rankingConfigSchema = new Schema(
  {
    periodType: {
      type: String,
      required: true,
      enum: ["weekly", "monthly", "yearly"],
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: "", maxlength: 300 },
    active: { type: Boolean, default: true, index: true },
    topCount: { type: Number, default: 10, min: 1 },
    rules: { type: [rankingRuleSchema], default: [] },
  },
  { timestamps: true }
);

export default models.RankingConfig || model("RankingConfig", rankingConfigSchema);
