import mongoose from "mongoose";

const { Schema, models, model } = mongoose;

const watchlistSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    auction: { type: Schema.Types.ObjectId, ref: "Auction", required: true, index: true },
  },
  { timestamps: true }
);

watchlistSchema.index({ user: 1, auction: 1 }, { unique: true });

export default models.Watchlist || model("Watchlist", watchlistSchema);
