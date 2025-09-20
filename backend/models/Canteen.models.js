import mongoose from "mongoose";

const canteenSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isOpen: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("Canteen", canteenSchema);