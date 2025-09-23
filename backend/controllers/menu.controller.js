import Menu from "../models/Menu.models.js";
import Canteen from "../models/Canteen.models.js";

// -------------------- ADD MENU ITEM --------------------
export const addMenuItem = async (req, res) => {
  try {
    const { name, price } = req.body;
    const { canteenId } = req.params;

    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    const canteen = await Canteen.findById(canteenId);
    if (!canteen) return res.status(404).json({ message: "Canteen not found" });

    if (!canteen.admins.map(a => a.toString()).includes(req.user.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const photoUrl = req.file?.path || null;

    const menuItem = new Menu({
      canteen: canteenId,
      name,
      price,
      photo: photoUrl,
    });

    await menuItem.save();
    res.status(201).json({ message: "Menu item added", menuItem });
  } catch (err) {
    console.error("ADD MENU ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// -------------------- GET MENU --------------------
export const getMenu = async (req, res) => {
  try {
    const { canteenId } = req.params;
    const menu = await Menu.find({ canteen: canteenId });
    res.json(menu);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -------------------- UPDATE MENU --------------------
export const updateMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { name, price, isAvailable } = req.body;

    const menuItem = await Menu.findById(itemId).populate("canteen");
    if (!menuItem) return res.status(404).json({ message: "Menu item not found" });

    if (!menuItem.canteen.admins.map(a => a.toString()).includes(req.user.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (name) menuItem.name = name;
    if (price !== undefined) menuItem.price = price;
    if (isAvailable !== undefined) menuItem.isAvailable = isAvailable;

    await menuItem.save();
    res.json({ message: "Menu item updated", menuItem });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -------------------- DELETE MENU --------------------
export const deleteMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const menuItem = await Menu.findById(itemId).populate("canteen");
    if (!menuItem) return res.status(404).json({ message: "Menu item not found" });

    if (!menuItem.canteen.admins.map(a => a.toString()).includes(req.user.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    await menuItem.deleteOne();
    res.json({ message: "Menu item deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};