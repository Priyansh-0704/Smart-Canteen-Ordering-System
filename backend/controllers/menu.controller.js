import Menu from "../models/Menu.models.js";
import Canteen from "../models/Canteen.models.js";

// Add a new menu item
export const addMenuItem = async (req, res) => {
  try {
    const { name, price, photo } = req.body;
    const canteenId = req.params.canteenId;

    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    const canteen = await Canteen.findById(canteenId);
    if (!canteen) return res.status(404).json({ message: "Canteen not found" });

    if (!canteen.admins.map(a => a.toString()).includes(req.user.id)) {
      return res.status(403).json({ message: "Access denied (not your canteen)" });
    }

    const menuItem = new Menu({ canteen: canteenId, name, price, photo });
    await menuItem.save();

    res.status(201).json({ message: "Menu item added", menuItem });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get menu for a canteen
export const getMenu = async (req, res) => {
  try {
    const canteenId = req.params.canteenId;
    const menu = await Menu.find({ canteen: canteenId });
    res.json(menu);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update menu item
export const updateMenuItem = async (req, res) => {
  try {
    const { name, price, photo, isAvailable } = req.body;
    const itemId = req.params.itemId;

    const menuItem = await Menu.findById(itemId).populate("canteen");
    if (!menuItem) return res.status(404).json({ message: "Menu item not found" });

  
    if (!menuItem.canteen.admins.includes(req.user.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (name) menuItem.name = name;
    if (price) menuItem.price = price;
    if (photo) menuItem.photo = photo;
    if (isAvailable !== undefined) menuItem.isAvailable = isAvailable;

    await menuItem.save();
    res.json({ message: "Menu item updated", menuItem });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete menu item
export const deleteMenuItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const menuItem = await Menu.findById(itemId).populate("canteen");
    if (!menuItem) return res.status(404).json({ message: "Menu item not found" });

    if (!menuItem.canteen.admins.includes(req.user.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    await menuItem.deleteOne();
    res.json({ message: "Menu item deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
