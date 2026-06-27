import mongoose from "mongoose";

const { Schema, models, model } = mongoose;

const couponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    amount: { type: Number, required: true, min: 1 },
    active: { type: Boolean, default: true, index: true },
    expiresAt: { type: Date, default: null },
    maxUses: { type: Number, default: 0 },
    usedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

export default models.Coupon || model("Coupon", couponSchema);
