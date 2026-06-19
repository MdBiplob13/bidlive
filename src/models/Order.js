import mongoose from "mongoose";

const { Schema, models, model } = mongoose;

const orderSchema = new Schema(
  {
    orderNumber: { type: String, unique: true, index: true },
    auction: { type: Schema.Types.ObjectId, ref: "Auction", required: true, index: true },
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    buyer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true },
    // No payments yet — status tracks fulfilment only.
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "completed", "cancelled"],
      default: "pending",
      index: true,
    },
    shippingAddress: { type: String, default: "" },
    contactPhone: { type: String, default: "" },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

orderSchema.pre("validate", function (next) {
  if (!this.orderNumber) {
    const rand = Math.floor(100000 + Math.random() * 900000);
    this.orderNumber = `BL-${rand}`;
  }
  next();
});

export default models.Order || model("Order", orderSchema);
