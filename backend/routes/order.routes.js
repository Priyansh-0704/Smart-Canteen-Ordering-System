import express from "express";
import Order from "../models/Order.models.js";
import { authMiddleware } from "../middleware/auth.middle.js";
import {
  getCanteenOrders,
  updateOrderStatus,
  verifyPayment,
  cancelOrderByUser,
} from "../controllers/order.controller.js";

const router = express.Router();

router.post(
  "/verify",
  authMiddleware(["User", "CanteenAdmin"]),
  verifyPayment
);

router.get(
  "/canteen",
  authMiddleware(["CanteenAdmin"]),
  getCanteenOrders
);

router.get(
  "/my",
  authMiddleware(["User", "CanteenAdmin"]),
  async (req, res) => {
    try {
      const orders = await Order.find({ user: req.user.id })
        .populate("canteen", "name location previewImage")
        .populate("items.itemId", "name price photo")
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        total: orders.length,
        orders,
      });
    } catch (err) {
      console.error("getMyOrders error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to fetch user orders",
      });
    }
  }
);

router.put(
  "/:id/status",
  authMiddleware(["CanteenAdmin"]),
  updateOrderStatus
);

router.put(
  "/:id/cancel",
  authMiddleware(["User", "CanteenAdmin"]),
  cancelOrderByUser
);

export default router;