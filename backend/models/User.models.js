import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["User", "CanteenAdmin", "Admin"],
      default: "User",
    },
    otp: {
      code: { type: String },
      expiry: { type: Date },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    canteens: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Canteen"
    }],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
