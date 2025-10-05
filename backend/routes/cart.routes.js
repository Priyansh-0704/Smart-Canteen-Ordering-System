import express from "express";
import Cart from "../models/Cart.models.js";
import { authMiddleware } from "../middleware/auth.middle.js";

const router = express.Router();

// Get user's cart
router.get("/", authMiddleware(["User"]), async (req, res) => {
  try {
    const cart = await Cart.findOne({ customer: req.user.id });
    res.json(cart || { items: [], totalAmount: 0 });
  } catch (err) {
    res.status(500).json({ message: "Error fetching cart" });
  }
});

// Add or update item
router.post("/add", authMiddleware(["User"]), async (req, res) => {
  try {
    const { itemId, name, price } = req.body;
    let cart = await Cart.findOne({ customer: req.user.id });

    if (!cart) {
      cart = new Cart({ customer: req.user.id, items: [{ itemId, name, price, quantity: 1 }] });
    } else {
      const itemIndex = cart.items.findIndex((i) => i.itemId.toString() === itemId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += 1;
      } else {
        cart.items.push({ itemId, name, price, quantity: 1 });
      }
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding to cart" });
  }
});

// Remove item or decrease quantity
router.post("/remove", authMiddleware(["User"]), async (req, res) => {
  try {
    const { itemId } = req.body;
    const cart = await Cart.findOne({ customer: req.user.id });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.items.findIndex((i) => i.itemId.toString() === itemId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity -= 1;
      if (cart.items[itemIndex].quantity <= 0) cart.items.splice(itemIndex, 1);
      await cart.save();
    }

    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Error removing from cart" });
  }
});

// Clear cart
router.delete("/clear", authMiddleware(["User"]), async (req, res) => {
  try {
    await Cart.findOneAndDelete({ customer: req.user.id });
    res.json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ message: "Error clearing cart" });
  }
});

export default router;