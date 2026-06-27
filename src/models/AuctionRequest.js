import mongoose from "mongoose";

const { Schema, models, model } = mongoose;

const auctionRequestSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    auction: {
      type: Schema.Types.ObjectId,
      ref: "Auction",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["change", "cancel"],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    requestedChanges: {
      type: Map,
      of: Schema.Types.Mixed, // e.g. { title, description, startingPrice, etc }
      required: false,
    },
    reason: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    adminNote: {
      type: String,
      default: "",
      maxlength: 1000,
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  { timestamps: true }
);

export default models.AuctionRequest || model("AuctionRequest", auctionRequestSchema);
