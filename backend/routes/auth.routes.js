import express from "express";
import { registerUser, loginUser,verifyRegisterOtp, logoutUser } from "../controllers/auth.controllers.js";

const router = express.Router();

router.post("/register", registerUser); 
router.post("/login", loginUser);         
router.post("/verify-otp", verifyRegisterOtp);    
router.post("/logout", logoutUser);       

export default router;
