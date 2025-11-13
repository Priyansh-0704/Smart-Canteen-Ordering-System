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

menuSchema.index({ name: "text" });
menuSchema.index({ canteen: 1, isAvailable: 1 });

export default mongoose.model("Menu", menuSchema);