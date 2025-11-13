import mongoose from "mongoose";
import Canteen from "../models/Canteen.models.js";
import Menu from "../models/Menu.models.js";
import Order from "../models/Order.models.js";

export const getAllCanteens = async (req, res) => {
  try {
    const searchQuery = req.query.q || "";

    const canteens = await Canteen.find({
      name: { $regex: searchQuery, $options: "i" },
    });

    const canteensWithDetails = await Promise.all(
      canteens.map(async (canteen) => {
        const menuItems = await Menu.find(
          { canteen: canteen._id, photo: { $exists: true, $ne: null } },
          "photo"
        );
        let randomPhoto = null;
        if (menuItems.length > 0) {
          const randomIndex = Math.floor(Math.random() * menuItems.length);
          randomPhoto = menuItems[randomIndex].photo;
        }

        const activeOrderCount = await Order.countDocuments({
          canteen: canteen._id,
          status: { $in: ["Paid", "Preparing"] },
        });

        let crowdLevel = "Low";
        if (activeOrderCount >= 6 && activeOrderCount <= 12) {
          crowdLevel = "Moderate";
        } else if (activeOrderCount > 12) {
          crowdLevel = "Busy";
        }

        return {
          ...canteen.toObject(),
          previewImage: randomPhoto,
          crowdLevel,
        };
      })
    );

    res.json({ canteens: canteensWithDetails });
  } catch (err) {
    console.error("Error fetching canteens:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getCanteenMenu = async (req, res) => {
  try {
    const { canteenId } = req.params;
    let { onlyAvailable, q, page = 1, limit = 200 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(canteenId)) {
      return res.status(400).json({ message: "Invalid canteen id" });
    }

    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.min(500, Math.max(1, parseInt(limit, 10) || 200));
    const skip = (page - 1) * limit;

    const canteen = await Canteen.findById(canteenId)
      .select("name location photos isOpen")
      .lean();
    if (!canteen) return res.status(404).json({ message: "Canteen not found" });

    const filter = { canteen: canteenId };
    if (onlyAvailable === "true") filter.isAvailable = true;
    if (onlyAvailable === "false") filter.isAvailable = false;

    if (q && q.trim().length) {
      filter.$text = { $search: q.trim() };
    }

    const [menu, total] = await Promise.all([
      Menu.find(filter)
        .select("name price photo isAvailable")
        .skip(skip)
        .limit(limit)
        .lean(),
      Menu.countDocuments(filter),
    ]);

    res.json({
      canteen,
      menu,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error("GET MENU ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};