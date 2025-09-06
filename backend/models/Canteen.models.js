import mongoose from "mongoose";

const canteenSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  isOpen: { type: Boolean, default: true },
  photos: [{ type: String }],
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

export default mongoose.model("Canteen", canteenSchema);
