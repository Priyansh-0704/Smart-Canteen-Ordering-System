import Canteen from "../models/Canteen.models.js";

// get all canteens that the logged-in admin manages
export const getMyCanteens = async (req, res) => {
  try {
    const canteens = await Canteen.find({ admins: req.user.id });
    res.json(canteens);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// toggle open/close
export const toggleCanteenStatus = async (req, res) => {
  try {
    const canteen = await Canteen.findOne({ _id: req.params.id, admins: req.user.id });
    if (!canteen) return res.status(404).json({ message: "Canteen not found or access denied" });

    canteen.isOpen = !canteen.isOpen;
    await canteen.save();

    res.json({ message: "Canteen status updated", canteen });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};