import mongoose from "mongoose";

const { Schema, models, model } = mongoose;

const imageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: "" },
  },
  { _id: false },
);

const auctionSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
      index: "text",
    },
    slug: { type: String, index: true },
    description: { type: String, required: true, maxlength: 5000 },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    images: { type: [imageSchema], default: [] },
    condition: {
      type: String,
      enum: ["new", "used", "refurbished"],
      default: "used",
    },
    location: { type: String, default: "Bangladesh" },

    startingPrice: { type: Number, required: true, min: 0 },
    reservePrice: { type: Number, default: 0 }, // 0 = no reserve
    bidIncrement: { type: Number, default: 0 }, // 0 = auto-tiered
    currentBid: { type: Number, default: 0 },
    bidCount: { type: Number, default: 0 },

    highestBidder: { type: Schema.Types.ObjectId, ref: "User", default: null },
    winner: { type: Schema.Types.ObjectId, ref: "User", default: null },

    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true, index: true },

    status: {
      type: String,
      enum: ["pending", "active", "ended", "sold", "rejected", "cancelled"],
      default: "pending",
      index: true,
    },
    rejectionReason: { type: String, default: "" },
    reserveMet: { type: Boolean, default: false },

    views: { type: Number, default: 0 },
    watchCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },

    settledAt: { type: Date },
  },
  { timestamps: true },
);

auctionSchema.index({ status: 1, endDate: 1 });
auctionSchema.index({ isFeatured: 1, status: 1 });
auctionSchema.index({ title: "text", description: "text" });

// Virtual: effective current price (currentBid or startingPrice)
auctionSchema.virtual("price").get(function () {
  return this.currentBid > 0 ? this.currentBid : this.startingPrice;
});

auctionSchema.set("toJSON", { virtuals: true });
auctionSchema.set("toObject", { virtuals: true });

export default models.Auction || model("Auction", auctionSchema);
