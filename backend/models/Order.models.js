import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    canteen: { type: mongoose.Schema.Types.ObjectId, ref: "Canteen", required: true },
    items: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Menu" },
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    amount: Number,
    paymentId: String,
    orderId: String,
    status: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
