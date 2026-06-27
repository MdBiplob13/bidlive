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
      enum: ["active", "pending_verification", "suspended", "banned"],
      default: "active",
      index: true,
    },
    avatar: { type: String, default: "" },
    email: { type: String, trim: true, lowercase: true, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    otpHash: { type: String, select: false, default: "" },
    otpExpiresAt: { type: Date, select: false },
    otpAttempts: { type: Number, default: 0, select: false },
    otpResendCount: { type: Number, default: 0, select: false },
    lastOtpSentAt: { type: Date, select: false },
    otpLockedUntil: { type: Date, select: false },
    phoneOtpCode: { type: String, select: false, default: "" },
    phoneOtpExpires: { type: Date, select: false },
    kycStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
      index: true,
    },
    kycName: { type: String, default: "" },
    kycIdNumber: { type: String, default: "" },
    kycDocumentFront: { type: String, default: "" },
    kycDocumentBack: { type: String, default: "" },
    kycDocument: { type: String, default: "" },
    kycNotes: { type: String, default: "" },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    lastSeen: { type: Date, default: Date.now },
    suspendedUntil: { type: Date },
    banReason: { type: String, default: "" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("isVerified") && !this.isModified("isPhoneVerified")) {
    this.isPhoneVerified = this.isVerified;
  }
  if (this.isModified("isPhoneVerified") && !this.isModified("isVerified")) {
    this.isVerified = this.isPhoneVerified;
  }
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
  delete obj.otpHash;
  delete obj.otpExpiresAt;
  delete obj.otpAttempts;
  delete obj.otpResendCount;
  delete obj.lastOtpSentAt;
  delete obj.otpLockedUntil;
  delete obj.phoneOtpCode;
  delete obj.phoneOtpExpires;
  delete obj.kycIdNumber;
  delete obj.kycDocument;
  delete obj.kycDocumentFront;
  delete obj.kycDocumentBack;
  return obj;
};

export default models.User || model("User", userSchema);
