import express from "express";
import { authMiddleware } from "../middleware/auth.middle.js";
import { createPaymentOrder, verifyPayment } from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/order", authMiddleware(["User"]), createPaymentOrder);
router.post("/verify", authMiddleware(["User"]), verifyPayment);

export default router;
