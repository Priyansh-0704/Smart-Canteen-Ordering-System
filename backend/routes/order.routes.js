import express from "express";
import { authMiddleware } from "../middleware/auth.middle.js";
import {
  getCanteenOrders,

  updateOrderStatus,
} from "../controllers/order.controller.js";

const router = express.Router();

// Get all orders for logged-in canteen admin
router.get("/canteen", authMiddleware(["CanteenAdmin"]), getCanteenOrders);


// Update order status
router.put("/:id/status", authMiddleware(["CanteenAdmin"]), updateOrderStatus);

export default router;
