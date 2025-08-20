import express from "express";
import { registerUser, loginUser, verifyOtp, logoutUser } from "../controllers/auth.controllers.js";

const router = express.Router();

router.post("/register", registerUser); 
router.post("/login", loginUser);         
router.post("/verify-otp", verifyOtp);    
router.post("/logout", logoutUser);       

export default router;
