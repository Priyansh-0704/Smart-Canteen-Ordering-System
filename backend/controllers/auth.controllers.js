import User from "../models/User.models.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendOtpSMS, verifyOtpSMS } from "../services/sms.services.js";

const otpSessions = {};

// Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "14d" }
  );
};
export const registerUser = async (req, res) => {
  try {
    const { name, mobile, password } = req.body;
    if (!name || !mobile || !password) {
      return res.status(400).json({ message: "Name, mobile, and password are required" });
    }
    const users = await User.find();
    for (let u of users) {
      const isMatch = await bcrypt.compare(mobile, u.mobile);
      if (isMatch) {
        return res.status(400).json({ message: "User already exists. Please login." });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedMobile = await bcrypt.hash(mobile, 10);

    const sessionId = await sendOtpSMS(mobile); 

    otpSessions[mobile] = { sessionId, name, hashedPassword, hashedMobile };

    res.json({ message: "OTP sent via SMS. Please verify to complete registration." });
  } catch (error) {
    res.status(500).json({ message: "Error during registration", error: error.message });
  }
};
export const verifyRegisterOtp = async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    const sessionData = otpSessions[mobile];

    if (!sessionData) {
      return res.status(400).json({ message: "OTP session expired or not found" });
    }

    const isValid = await verifyOtpSMS(sessionData.sessionId, otp);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    const user = new User({
      name: sessionData.name,
      mobile: sessionData.hashedMobile,
      password: sessionData.hashedPassword,
      isVerified: true,
    });
    await user.save();

    delete otpSessions[mobile];

    const token = generateToken(user);

    res.json({
      message: "Registration successful. OTP verified.",
      token,
      role: user.role,
      name: user.name,
    });
  } catch (error) {
    res.status(500).json({ message: "OTP verification failed", error: error.message });
  }
};

// Login
export const loginUser = async (req, res) => {
  try {
    const { mobile, password } = req.body;
    if (!mobile || !password) {
      return res.status(400).json({ message: "Mobile and password required" });
    }

    const users = await User.find();
    let matchedUser = null;

    for (let u of users) {
      const isMatch = await bcrypt.compare(mobile, u.mobile);
      if (isMatch) {
        matchedUser = u;
        break;
      }
    }

    if (!matchedUser) {
      return res.status(404).json({ message: "User not found. Please register." });
    }

    const isPassMatch = await bcrypt.compare(password, matchedUser.password);
    if (!isPassMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(matchedUser);

    res.json({
      message: "Login successful",
      token,
      role: matchedUser.role,
      name: matchedUser.name,
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
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
