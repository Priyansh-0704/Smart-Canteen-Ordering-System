import mongoose from "mongoose";

const menuSchema = new mongoose.Schema(
  {
    canteen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Canteen",
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    photo: { type: String }, 
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Menu", menuSchema);