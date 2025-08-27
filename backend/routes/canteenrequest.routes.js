import express from "express";
import { submitCanteenRequest } from "../controllers/CanteenRequest.controller.js"

const router = express.Router();

router.post("/request", submitCanteenRequest);

export default router;
