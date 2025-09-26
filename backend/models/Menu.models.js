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

// Text index for menu item searches
menuSchema.index({ name: "text" });
// Compound index to make querying available items per canteen fast
menuSchema.index({ canteen: 1, isAvailable: 1 });

export default mongoose.model("Menu", menuSchema);