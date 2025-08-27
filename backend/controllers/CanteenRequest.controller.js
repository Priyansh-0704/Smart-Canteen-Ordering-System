import CanteenRequest from "../models/Canteenrequest.models.js";
import bcrypt from "bcrypt";

// user submits request
export const submitCanteenRequest = async (req, res) => {
  try {
    const { canteenName, workingHours, adminName, adminMobile, adminPassword } = req.body;

    if (!canteenName || !workingHours || !adminName || !adminMobile || !adminPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const newRequest = new CanteenRequest({
      canteenName,
      workingHours,
      adminName, 
      adminMobile,
      adminPassword: hashedPassword
    });

    await newRequest.save();
    res.status(201).json({ message: "Canteen request submitted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error submitting request", error: err.message });
  }
};
