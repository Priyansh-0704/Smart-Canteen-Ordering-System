import express from "express";
import { authMiddleware } from "../middleware/auth.middle.js";
import {
  getCanteenOrders,
  updateOrderStatus,
  verifyPayment,
} from "../controllers/order.controller.js";

const router = express.Router();

// 🧾 Verify Razorpay payment & create order
router.post(
  "/verify",
  authMiddleware(["User", "CanteenAdmin"]), // allow normal users to verify payment
  verifyPayment
);

// 🧾 Get all orders for logged-in canteen admin
router.get(
  "/canteen",
  authMiddleware(["CanteenAdmin"]),
  getCanteenOrders
);

// 🧾 Update order status
router.put(
  "/:id/status",
  authMiddleware(["CanteenAdmin"]),
  updateOrderStatus
);

export default router;
