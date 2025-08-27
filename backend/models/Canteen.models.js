import mongoose from "mongoose";

const canteenSchema = new mongoose.Schema({
  name: { type: String, required: true },
  workingHours: { type: String, required: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model("Canteen", canteenSchema);
