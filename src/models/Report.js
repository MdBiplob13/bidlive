import mongoose from "mongoose";

const { Schema, models, model } = mongoose;

const reportSchema = new Schema(
  {
    reporter: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    targetType: { type: String, enum: ["auction", "user"], required: true },
    targetAuction: { type: Schema.Types.ObjectId, ref: "Auction", default: null },
    targetUser: { type: Schema.Types.ObjectId, ref: "User", default: null },
    reason: {
      type: String,
      enum: ["fraud", "prohibited", "spam", "abuse", "counterfeit", "other"],
      required: true,
    },
    details: { type: String, maxlength: 1000, default: "" },
    status: {
      type: String,
      enum: ["open", "reviewing", "resolved", "dismissed"],
      default: "open",
      index: true,
    },
    resolvedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    resolutionNote: { type: String, default: "" },
  },
  { timestamps: true }
);

export default models.Report || model("Report", reportSchema);
