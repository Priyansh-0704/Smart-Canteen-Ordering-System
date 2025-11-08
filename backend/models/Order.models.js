import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    canteen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Canteen",
      required: true,
    },
    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Menu",
          required: true,
        },
        name: { type: String, required: true },     // ✅ Snapshot
        price: { type: Number, required: true },   // ✅ Snapshot
        quantity: { type: Number, required: true },
      },
    ],
    amount: { type: Number, required: true },
    orderId: { type: String, required: true },
    paymentId: String,
    signature: String,
    status: {
      type: String,
      enum: ["Pending", "Paid", "Preparing", "Ready", "Completed", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true } // ✅ Includes createdAt for "Order placed on" time
);

export default mongoose.model("Order", orderSchema);