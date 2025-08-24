import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  price: { type: Number, required: true },
  available: { type: Boolean, default: true },
});

const canteenSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String },
    menu: [menuItemSchema],
    isOpen: { type: Boolean, default: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Canteen = mongoose.model("Canteen", canteenSchema);
export default Canteen;