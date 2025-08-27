import express from "express";
import { getAllRequests, approveCanteenRequest } from "../controllers/admin.controller.js";
import { authMiddleware } from "../middleware/auth.middle.js";

const router = express.Router();
router.get("/requests", authMiddleware(["Admin"]), getAllRequests);
router.post("/approve/:id", authMiddleware(["Admin"]), approveCanteenRequest);

export default router;
