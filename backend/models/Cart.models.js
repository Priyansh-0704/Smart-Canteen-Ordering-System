import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    canteen: { type: mongoose.Schema.Types.ObjectId, ref: "Canteen" }, 
    items: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Menu", required: true },
        name: String,
        price: Number,
        quantity: { type: Number, default: 1 },
      },
    ],
    totalAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto calculate total
cartSchema.pre("save", function (next) {
  this.totalAmount = this.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  next();
});

export default mongoose.model("Cart", cartSchema);
