import express from "express";
import { registerUser, loginUser,verifyRegisterOtp, logoutUser } from "../controllers/auth.controllers.js";
import { requestPasswordReset, verifyResetOtp } from "../controllers/auth.controllers.js";

const router = express.Router();

router.post("/register", registerUser); 
router.post("/login", loginUser);         
router.post("/verify-otp", verifyRegisterOtp);    
router.post("/logout", logoutUser);       
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", verifyResetOtp);

export default router;