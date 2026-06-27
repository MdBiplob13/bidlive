import mongoose from "mongoose";

const { Schema, models, model } = mongoose;

const walletSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Balance cannot be negative"],
    },
    available: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Available balance cannot be negative"],
    },
    locked: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Locked balance cannot be negative"],
    },
    currency: {
      type: String,
      required: true,
      default: "BDT",
    },
  },
  { timestamps: true }
);

export default models.Wallet || model("Wallet", walletSchema);
