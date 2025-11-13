import express from "express";
import {
  addMenuItem,
  getMenu,
  updateMenuItem,
  deleteMenuItem,
} from "../controllers/menu.controller.js";
import { authMiddleware } from "../middleware/auth.middle.js";
import parser from "../middleware/upload.js";

const router = express.Router();

router.post("/:canteenId/menu", authMiddleware(["CanteenAdmin"]), parser.single("photo"), addMenuItem);
router.get("/:canteenId/menu", getMenu);
router.put("/menu/:itemId", authMiddleware(["CanteenAdmin"]), updateMenuItem);
router.delete("/menu/:itemId", authMiddleware(["CanteenAdmin"]), deleteMenuItem);

export default router;