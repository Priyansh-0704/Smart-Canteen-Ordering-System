import mongoose from "mongoose";

const canteenRequestSchema = new mongoose.Schema({
  adminName: { type: String, required: true },
  canteenName: { type: String, required: true },
  workingHours: { type: String, required: true },
  adminMobile: { type: String, required: true },
  adminPassword: { type: String, required: true },
  status: { type: String, enum: ["pending", "approved"], default: "pending" }
}, { timestamps: true });

export default mongoose.model("CanteenRequest", canteenRequestSchema);
