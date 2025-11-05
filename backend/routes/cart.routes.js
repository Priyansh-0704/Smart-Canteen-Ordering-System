import express from "express";
import Cart from "../models/Cart.models.js";
import Menu from "../models/Menu.models.js"; // ✅ needed to get canteen info
import { authMiddleware } from "../middleware/auth.middle.js";

const router = express.Router();

// 🛒 Get user's cart
router.get("/", authMiddleware(["User"]), async (req, res) => {
  try {
    const cart = await Cart.findOne({ customer: req.user.id })
      .populate("canteen", "name _id")
      .populate("items.itemId", "name price");
    res.json(
      cart
        ? {
            items: cart.items,
            totalAmount: cart.totalAmount,
            canteenId: cart.canteen?._id || null,
          }
        : { items: [], totalAmount: 0, canteenId: null }
    );
  } catch (err) {
    console.error("Get cart error:", err);
    res.status(500).json({ message: "Error fetching cart" });
  }
});

// ➕ Add or update item
router.post("/add", authMiddleware(["User"]), async (req, res) => {
  try {
    const { itemId } = req.body;

    // ✅ Fetch item from Menu to get price, name, and canteen
    const menuItem = await Menu.findById(itemId).populate("canteen", "_id");
    if (!menuItem)
      return res.status(404).json({ message: "Menu item not found" });

    let cart = await Cart.findOne({ customer: req.user.id });

    // ✅ If no cart, create a new one with this item's canteen
    if (!cart) {
      cart = new Cart({
        customer: req.user.id,
        canteen: menuItem.canteen._id,
        items: [
          {
            itemId,
            name: menuItem.name,
            price: menuItem.price,
            quantity: 1,
          },
        ],
      });
    } else {
      // ✅ If existing cart belongs to a different canteen, reset it
      if (
        cart.canteen &&
        cart.canteen.toString() !== menuItem.canteen._id.toString()
      ) {
        cart.items = []; // clear items
        cart.canteen = menuItem.canteen._id;
      }

      // ✅ Add or update item quantity
      const itemIndex = cart.items.findIndex(
        (i) => i.itemId.toString() === itemId
      );
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += 1;
      } else {
        cart.items.push({
          itemId,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1,
        });
      }
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ message: "Error adding to cart" });
  }
});

// ➖ Remove item or decrease quantity
router.post("/remove", authMiddleware(["User"]), async (req, res) => {
  try {
    const { itemId } = req.body;
    const cart = await Cart.findOne({ customer: req.user.id });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.items.findIndex(
      (i) => i.itemId.toString() === itemId
    );
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity -= 1;
      if (cart.items[itemIndex].quantity <= 0) cart.items.splice(itemIndex, 1);
      await cart.save();
    }

    res.json(cart);
  } catch (err) {
    console.error("Remove from cart error:", err);
    res.status(500).json({ message: "Error removing from cart" });
  }
});

// 🧹 Clear cart
router.delete("/clear", authMiddleware(["User"]), async (req, res) => {
  try {
    await Cart.findOneAndDelete({ customer: req.user.id });
    res.json({ message: "Cart cleared" });
  } catch (err) {
    console.error("Clear cart error:", err);
    res.status(500).json({ message: "Error clearing cart" });
  }
});

export default router;
