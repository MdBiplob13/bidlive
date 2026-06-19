import mongoose from "mongoose";

const { Schema, models, model } = mongoose;

const categorySchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: {
      en: { type: String, required: true },
      bn: { type: String, required: true },
    },
    icon: { type: String, default: "package" }, // lucide icon name
    image: { type: String, default: "" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.Category || model("Category", categorySchema);
