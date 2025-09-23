import Canteen from "../models/Canteen.models.js";
import User from "../models/User.models.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "14d" }
  );
};

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
    const { mobile, name, password } = req.body || {};

    if (!mobile) {
      return res.status(400).json({ message: "Mobile number is required in body" });
    }

    const canteenId = req.params.id;
    const canteen = await Canteen.findById(canteenId);
    if (!canteen) return res.status(404).json({ message: "Canteen not found" });

    let user = await User.findOne({ mobile });

    if (!user) {
      if (!name || !password) {
        return res.status(400).json({ message: "New user requires name and password" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      user = new User({
        name,
        mobile,
        password: hashedPassword,
        role: "CanteenAdmin",
        isVerified: true,
        canteens: [canteen._id],
      });
      await user.save();
    } else {
      if (!user.canteens.includes(canteenId)) {
        user.canteens.push(canteenId);
      }
      user.role = "CanteenAdmin";
      await user.save();
    }

    if (!canteen.admins.includes(user._id)) {
      canteen.admins.push(user._id);
    }
    await canteen.save();

    const token = generateToken(user);

    res.json({
      message: "Admin added successfully",
      user,
      canteen,
      token,
      role: user.role,
    });
  } catch (err) {
    console.error("❌ Error in adminAddCanteenAdmin:", err);
    res.status(500).json({ message: err.message });
  }
};

export const adminRemoveCanteenAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { mobile } = req.body;

    if (!mobile) return res.status(400).json({ message: "Mobile number is required" });

    const user = await User.findOne({ mobile });
    if (!user) return res.status(404).json({ message: "User not found" });

    const canteen = await Canteen.findById(id);
    if (!canteen) return res.status(404).json({ message: "Canteen not found" });

    user.canteens = user.canteens.filter(
      (cId) => cId.toString() !== canteen._id.toString()
    );
    if (user.canteens.length === 0) {
      user.role = "User";
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
export const adminRemoveCanteen = async (req, res) => {
  try {
    const { id } = req.params;

    // Remove canteen admins references first
    const canteen = await Canteen.findById(id);
    if (!canteen) return res.status(404).json({ message: "Canteen not found" });

    await User.updateMany(
      { _id: { $in: canteen.admins } },
      { $pull: { canteens: canteen._id } }
    );

    const admins = await User.find({ _id: { $in: canteen.admins } });
    for (let admin of admins) {
      if (!admin.canteens.length) {
        admin.role = "User";
        await admin.save();
      }
    }

    // Use findByIdAndDelete instead of remove()
    const deletedCanteen = await Canteen.findByIdAndDelete(id);

    res.json({ message: "Canteen removed successfully", canteenId: id, deletedCanteen });
  } catch (err) {
    console.error("❌ Error in adminRemoveCanteen:", err);
    res.status(500).json({ message: err.message });
  }
};

