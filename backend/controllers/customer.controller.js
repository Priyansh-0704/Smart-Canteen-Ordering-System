import mongoose from "mongoose";
import Canteen from "../models/Canteen.models.js";
import Menu from "../models/Menu.models.js";

/**
 * GET /api/v5/customer/canteens
 * Query: q, open (true|false), page, limit
 */
export const getAllCanteens = async (req, res) => {
  try {
    let { q, open, page = 1, limit = 50 } = req.query;
    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.min(200, Math.max(1, parseInt(limit, 10) || 50)); // cap limit

    const skip = (page - 1) * limit;
    const baseFilter = {};

    if (open === "true") baseFilter.isOpen = true;
    if (open === "false") baseFilter.isOpen = false;

    // Use text search when possible (requires text index)
    const filter = { ...baseFilter };
    if (q && q.trim().length) {
      // prefer text search
      filter.$text = { $search: q.trim() };
    }

    const [canteens, total] = await Promise.all([
      Canteen.find(filter)
        .select("name location photos isOpen")
        .populate("admins", "name")
        .skip(skip)
        .limit(limit)
        .lean(),
      Canteen.countDocuments(filter),
    ]);

    res.json({
      canteens,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("GET CANTEENS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/v5/customer/canteens/:canteenId/menu
 * Query: onlyAvailable=true, q (search within menu), page, limit
 */
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
      // prefer text search on Menu.name
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