import express from "express";
import { getMyCanteens, toggleCanteenStatus, updateCanteenTimes } from "../controllers/canteen.controller.js";
import { authMiddleware } from "../middleware/auth.middle.js";

const router = express.Router();

router.get("/my", authMiddleware(["CanteenAdmin"]), getMyCanteens);
router.put("/:id/toggle-status", authMiddleware(["CanteenAdmin"]), toggleCanteenStatus);
router.put("/:id/update-times", authMiddleware(["CanteenAdmin"]), updateCanteenTimes);

export default router;
