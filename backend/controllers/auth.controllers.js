import User from "../models/User.models.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendOtpSMS, verifyOtpSMS } from "../services/sms.services.js";

const otpSessions = {};

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id.toString(), role: user.role },
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
    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists. Please login." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const sessionId = await sendOtpSMS(mobile);

    otpSessions[mobile] = { sessionId, name, mobile, hashedPassword };

    res.json({ message: "OTP sent via SMS. Please verify to complete registration." });
  } catch (error) {
    res.status(500).json({ message: "Error during registration", error: error.message });
  }
};

export const verifyRegisterOtp = async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    const sessionData = otpSessions[mobile];

    if (!sessionData) return res.status(400).json({ message: "OTP session expired or not found" });

    const isValid = await verifyOtpSMS(sessionData.sessionId, otp);
    if (!isValid) return res.status(400).json({ message: "Invalid or expired OTP" });

    const user = new User({
      name: sessionData.name,
      mobile: sessionData.mobile,       
      password: sessionData.hashedPassword,
      isVerified: true,
      role: "User",
    });

    await user.save();
    delete otpSessions[mobile];

    const token = generateToken(user);

    res.json({
      message: "Registration successful",
      token,
      role: user.role,
      name: user.name,
    });
  } catch (error) {
    res.status(500).json({ message: "OTP verification failed", error: error.message });
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { mobile } = req.body;
    const user = await User.findOne({ mobile }); 

    if (!user) return res.status(404).json({ message: "User not found with this number" });

    const sessionId = await sendOtpSMS(mobile);
    otpSessions[mobile] = { sessionId, userId: user._id };

    res.json({ message: "OTP sent to your mobile" });
  } catch (err) {
    res.status(500).json({ message: "Error sending OTP", error: err.message });
  }
};
export const verifyResetOtp = async (req, res) => {
  try {
    const { mobile, otp, newPassword } = req.body;
    const sessionData = otpSessions[mobile];

    if (!sessionData) return res.status(400).json({ message: "OTP session expired or not found" });

    const isValid = await verifyOtpSMS(sessionData.sessionId, otp);
    if (!isValid) return res.status(400).json({ message: "Invalid or expired OTP" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(sessionData.userId, { password: hashedPassword });

    delete otpSessions[mobile];

    res.json({ message: "Password reset successful. Please login with your new password." });
  } catch (err) {
    res.status(500).json({ message: "Error resetting password", error: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { mobile, password } = req.body;
    if (!mobile || !password) {
      return res.status(400).json({ message: "Mobile and password required" });
    }

    const user = await User.findOne({ mobile });
    if (!user) return res.status(404).json({ message: "User not found. Please register." });

    const isPassMatch = await bcrypt.compare(password, user.password);
    if (!isPassMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      role: user.role,
      name: user.name,
      mobile: user.mobile,
      id: user._id
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed", error: error.message });
  }
};