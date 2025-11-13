import express from "express";
import Cart from "../models/Cart.models.js";
import Menu from "../models/Menu.models.js";
import { authMiddleware } from "../middleware/auth.middle.js";

const router = express.Router();

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

router.post("/add", authMiddleware(["User"]), async (req, res) => {
  try {
    const { itemId } = req.body;

    const menuItem = await Menu.findById(itemId).populate("canteen", "_id");
    if (!menuItem)
      return res.status(404).json({ message: "Menu item not found" });

    let cart = await Cart.findOne({ customer: req.user.id });

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
      if (
        cart.canteen &&
        cart.canteen.toString() !== menuItem.canteen._id.toString()
      ) {
        cart.items = [];
        cart.canteen = menuItem.canteen._id;
      }

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