import CanteenRequest from "../models/Canteenrequest.models.js";
import Canteen from "../models/Canteen.models.js";
import User from "../models/User.models.js";
import bcrypt from "bcrypt";

export const getAllRequests = async (req, res) => {
  try {
    const requests = await CanteenRequest.find({ status: "pending" }).select("-adminPassword");
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const approveCanteenRequest = async (req, res) => {
  try {
    const request = await CanteenRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    const canteen = new Canteen({
      name: request.canteenName,
      workingHours: request.workingHours
    });
    await canteen.save();

    let user = await User.findOne({ mobile: request.adminMobile });
    if (user) {
      user.role = "CanteenAdmin";
      user.canteen = canteen._id;
      await user.save();
    } else {
      const hashedPassword = await bcrypt.hash(request.adminPassword, 10);
      user = new User({
        name: request.adminName,
        mobile: request.adminMobile,
        password: hashedPassword,
        role: "CanteenAdmin",
        canteen: canteen._id,
        isVerified: true
      });
      await user.save();
    }

    canteen.admin = user._id;
    await canteen.save();

    request.status = "approved";
    await request.save();

    res.json({ message: "Canteen approved successfully", canteen, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
