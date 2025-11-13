import express from "express";
import { getAllCanteens, getCanteenMenu } from "../controllers/customer.controller.js";
import { authMiddleware } from "../middleware/auth.middle.js";

const router = express.Router();

router.get("/canteens", authMiddleware(), getAllCanteens);
router.get("/canteens/:canteenId/menu", authMiddleware(), getCanteenMenu);

export default router;