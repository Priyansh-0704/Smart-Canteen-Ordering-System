import express from "express";
import { authenticate, requireRole } from "../middleware/auth.middleware.js";
import {
  listUsers,
  promoteToCanteenAdmin,
  addMenuItem,
  toggleItemAvailability,
  toggleCanteenStatus,
} from "../controllers/canteen.controllers.js";

const router = express.Router();

router.get("/users", authenticate, requireRole(["MainAdmin"]), listUsers);
router.post("/promote", authenticate, requireRole(["MainAdmin"]), promoteToCanteenAdmin);

router.post("/menu/add", authenticate, requireRole(["CanteenAdmin"]), addMenuItem);
router.post("/menu/toggle", authenticate, requireRole(["CanteenAdmin"]), toggleItemAvailability);
router.post("/status/toggle", authenticate, requireRole(["CanteenAdmin"]), toggleCanteenStatus);

export default router;