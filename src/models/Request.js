import mongoose from "mongoose";

const { Schema, models, model } = mongoose;

/**
 * A "Request" is a buyer-posted want-ad ("I'm looking for ...") OR an
 * admin-created sourcing request. Sellers can respond with auctions.
 */
const requestSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, maxlength: 120 },
    description: { type: String, required: true, maxlength: 2000 },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    budgetMin: { type: Number, default: 0 },
    budgetMax: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["open", "in_progress", "fulfilled", "closed"],
      default: "open",
      index: true,
    },
    createdByAdmin: { type: Boolean, default: false },
    responseCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.Request || model("Request", requestSchema);
