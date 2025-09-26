import mongoose from "mongoose";

const canteenSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  photos: [{ type: String }],          // <--- added (array of URLs)
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isOpen: { type: Boolean, default: true },
}, { timestamps: true });

canteenSchema.index({ name: "text", location: "text" });

export default mongoose.model("Canteen", canteenSchema);