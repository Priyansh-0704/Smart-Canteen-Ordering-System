import Canteen from "../models/Canteen.models.js";
import User from "../models/User.models.js";
import bcrypt from "bcrypt";

export const adminCreateCanteen = async (req, res) => {
  try {
    const { name, location, photos } = req.body;

    if (!name || !location) {
      return res.status(400).json({ message: "Name and location are required" });
    }

    const canteen = new Canteen({ name, location, photos });
    await canteen.save();

    res.status(201).json({ message: "Canteen created successfully", canteen });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const adminListCanteens = async (req, res) => {
  try {
    const canteens = await Canteen.find().populate("admins", "name mobile role");
    res.json(canteens);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const adminUpdateCanteen = async (req, res) => {
  try {
    const { name, location, isOpen, photos } = req.body;

    const canteen = await Canteen.findByIdAndUpdate(
      req.params.id,
      { name, location, isOpen, photos },
      { new: true }
    );

    if (!canteen) return res.status(404).json({ message: "Canteen not found" });

    res.json({ message: "Canteen updated successfully", canteen });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const adminAddCanteenAdmin = async (req, res) => {
  try {
    const { userId } = req.body;
    const canteenId = req.params.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const canteen = await Canteen.findById(canteenId);
    if (!canteen) return res.status(404).json({ message: "Canteen not found" });

    // update user
    if (!user.canteens.includes(canteenId)) {
      user.canteens.push(canteenId);
    }
    user.role = "CanteenAdmin";
    await user.save();

    // update canteen
    if (!canteen.admins.includes(user._id)) {
      canteen.admins.push(user._id);
    }
    await canteen.save();

    res.json({ message: "Admin added to canteen successfully", user, canteen });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const adminRemoveCanteenAdmin = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const canteen = await Canteen.findById(id);
    if (!canteen) return res.status(404).json({ message: "Canteen not found" });

    user.canteens = user.canteens.filter(
      (cId) => cId.toString() !== canteen._id.toString()
    );
    if (user.canteens.length === 0) {
      user.role = "User"; // fallback role
    }
    await user.save();

    canteen.admins = canteen.admins.filter(
      (aId) => aId.toString() !== user._id.toString()
    );
    await canteen.save();

    res.json({ message: "Admin removed from canteen", user, canteen });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};