import User from "../models/User.models.js";
import Canteen from "../models/Canteen.models.js";

// List all users (for MainAdmin dashboard)
export const listUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -otp"); // hide password & otp
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
};

// Promote user to CanteenAdmin + create canteen
export const promoteToCanteenAdmin = async (req, res) => {
  try {
    const { userId, canteenName, location } = req.body;

    if (!userId || !canteenName) {
      return res.status(400).json({ message: "User ID and canteen name required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "CanteenAdmin") {
      return res.status(400).json({ message: "User is already a canteen admin" });
    }

    // Promote
    user.role = "CanteenAdmin";

    // Create canteen
    const canteen = new Canteen({
      name: canteenName,
      location: location || "",
      admin: user._id,
      menu: [],
    });
    await canteen.save();

    // 🔗 Link user to canteen
    user.canteenId = canteen._id;
    await user.save();

    res.json({ message: "User promoted to CanteenAdmin", user, canteen });
  } catch (err) {
    res.status(500).json({ message: "Error promoting user", error: err.message });
  }
};