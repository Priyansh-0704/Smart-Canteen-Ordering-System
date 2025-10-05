import mongoose from "mongoose";

const canteenSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  photos: [{ type: String }],
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isOpen: { type: Boolean, default: true },
  openingTime: { type: String, default: "09:00" }, // HH:MM
  closingTime: { type: String, default: "21:00" }, // HH:MM
}, { timestamps: true });

canteenSchema.index({ name: "text", location: "text" });

export default mongoose.model("Canteen", canteenSchema);
