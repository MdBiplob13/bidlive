import mongoose from "mongoose";

const { Schema, models, model } = mongoose;

const transactionSchema = new Schema(
  {
    wallet: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "deposit",
        "withdrawal",
        "bid_lock",
        "bid_release",
        "payment_deduction",
        "payment_received",
        "commission",
        "adjustment_credit",
        "adjustment_debit",
      ],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    }, // Positive for credits, negative for debits
    balanceAfter: {
      type: Number,
      required: true,
    },
    availableAfter: {
      type: Number,
      required: true,
    },
    lockedAfter: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
      index: true,
    },
    referenceType: {
      type: String,
      enum: ["Auction", "Bid", "Order", "WithdrawalDetails"],
      required: false,
    },
    referenceId: {
      type: Schema.Types.ObjectId,
      required: false,
    },
    paymentGateway: {
      type: String,
      default: "manual",
    },
    gatewayTxnId: {
      type: String,
      index: true,
      sparse: true,
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

export default models.Transaction || model("Transaction", transactionSchema);
