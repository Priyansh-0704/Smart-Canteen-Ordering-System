import User from "../models/User.models.js";
import jwt from "jsonwebtoken";
import { sendOtpSMS, verifyOtpSMS } from "../services/sms.services.js";

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "14d" });
};

const otpSessions = {};

export const registerUser = async (req, res) => {
  try {
    const { name, mobile } = req.body;
    if (!name || !mobile) return res.status(400).json({ message: "Name and mobile required" });

    const existingUser = await User.findOne({ mobile });
    if (existingUser) return res.status(400).json({ message: "User already exists. Please login." });

    const sessionId = await sendOtpSMS(mobile);
    otpSessions[mobile] = { sessionId, name };

    res.json({ message: "OTP sent via SMS (registration)" });
  } catch (error) {
    res.status(500).json({ message: "Error sending OTP", error: error.message });
  }
};

// Login existing user
export const loginUser = async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile) return res.status(400).json({ message: "Mobile number required" });

    const user = await User.findOne({ mobile });
    if (!user) return res.status(404).json({ message: "User not found. Please register." });

    const sessionId = await sendOtpSMS(mobile);
    otpSessions[mobile] = { sessionId };

    res.json({ message: "OTP sent via SMS (login)" });
  } catch (error) {
    res.status(500).json({ message: "Error sending OTP", error: error.message });
  }
};
 // otp verifcation and user creation after opt verifies
export const verifyOtp = async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    const sessionData = otpSessions[mobile];
    if (!sessionData) return res.status(400).json({ message: "OTP session expired or not found" });

    const isValid = await verifyOtpSMS(sessionData.sessionId, otp);
    if (!isValid) return res.status(400).json({ message: "Invalid or expired OTP" });

    let user = await User.findOne({ mobile });
    if (!user) {
      user = new User({ name: sessionData.name, mobile, isVerified: true });
      await user.save();
    } else {
      user.isVerified = true;
      await user.save();
    }

    delete otpSessions[mobile];

    const token = generateToken(user);
    res.json({ message: "OTP verified successfully", token, role: user.role, name: user.name });
  } catch (error) {
    res.status(500).json({ message: "OTP verification failed", error: error.message });
  }
};

// Logout
export const logoutUser = async (req, res) => {
  try {
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed", error: error.message });
  }
};
