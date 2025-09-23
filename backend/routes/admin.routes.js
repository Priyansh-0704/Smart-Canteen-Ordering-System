import express from "express";
import {
  adminCreateCanteen,
  adminListCanteens,
  adminUpdateCanteen,
  adminAddCanteenAdmin,
  adminRemoveCanteenAdmin,
  adminRemoveCanteen,
} from "../controllers/admin.controller.js";
import { authMiddleware } from "../middleware/auth.middle.js";

const router = express.Router();

router.post("/canteens", authMiddleware(["Admin"]), adminCreateCanteen);
router.get("/canteens", authMiddleware(["Admin"]), adminListCanteens);
router.put("/canteens/:id", authMiddleware(["Admin"]), adminUpdateCanteen);
router.post("/canteens/:id/admins", authMiddleware(["Admin"]), adminAddCanteenAdmin);
router.delete("/canteens/:id/admins/:userId", authMiddleware(["Admin"]), adminRemoveCanteenAdmin);
router.delete("/canteens/:id", authMiddleware(["Admin"]), adminRemoveCanteen);

export default router;
