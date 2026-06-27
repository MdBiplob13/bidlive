import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema, models, model } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^01[3-9]\d{8}$/,
      index: true,
    },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin", "employee"], default: "user", index: true },
    permissions: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["active", "suspended", "banned"],
      default: "active",
      index: true,
    },
    avatar: { type: String, default: "" },
    email: { type: String, trim: true, lowercase: true, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    lastSeen: { type: Date, default: Date.now },
    suspendedUntil: { type: Date },
    banReason: { type: String, default: "" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toPublic = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default models.User || model("User", userSchema);
