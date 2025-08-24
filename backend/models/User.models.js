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
    },
    role: {
      type: String,
      enum: ["User", "CanteenAdmin", "MainAdmin"],
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

    canteenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Canteen",
      default: null,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;