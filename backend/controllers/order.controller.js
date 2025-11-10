import Order from "../models/Order.models.js";
import Canteen from "../models/Canteen.models.js";
import crypto from "crypto";
import Cart from "../models/Cart.models.js"; // ✅ added to clear cart after payment

/**
 * 🧾 Verify Razorpay Payment and Create Order
 * This endpoint is called after successful Razorpay checkout on the frontend.
 */
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, cart } = req.body;

    // ✅ Always use req.user.id — because auth middleware stores `id`, not `_id`
    const userId = req.user.id;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details",
      });
    }

    // ✅ Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed (invalid signature)",
      });
    }

    // ✅ Verify canteen exists
    const canteen = await Canteen.findById(cart?.canteen);
    if (!canteen) {
      return res.status(404).json({
        success: false,
        message: "Canteen not found",
      });
    }

    // ✅ Create order document
    const newOrder = await Order.create({
      user: userId,
      canteen: canteen._id,
      items: cart.items,
      amount: cart.totalAmount,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      status: "Paid", // start in Paid state after verification
    });

    // ✅ Clear user's cart after successful order
    await Cart.findOneAndDelete({ customer: userId });

    res.json({
      success: true,
      message: "Payment verified and order created successfully",
      order: newOrder,
    });
  } catch (err) {
    console.error("verifyPayment error:", err);
    res.status(500).json({
      success: false,
      message: "Server error during payment verification",
      error: err.message,
    });
  }
};

/**
 * 🧾 Get all orders for the logged-in Canteen Admin
 */
export const getCanteenOrders = async (req, res) => {
  try {
    // ✅ Find canteens managed by this admin
    const canteens = await Canteen.find({ admins: req.user.id }).select("_id");
    const canteenIds = canteens.map((c) => c._id);

    // ✅ Fetch all orders from those canteens (latest first)
    const orders = await Order.find({ canteen: { $in: canteenIds } })
      .populate("user", "name mobile")
      .populate("items.itemId", "name price photo")
      .populate("canteen", "name location")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      total: orders.length,
      orders,
    });
  } catch (err) {
    console.error("getCanteenOrders error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch canteen orders",
      error: err.message,
    });
  }
};

/**
 * 🧾 Update order status (Admin only)
 * - Allowed statuses: Pending, Paid, Preparing, Ready, Completed, Cancelled
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ["Pending", "Paid", "Preparing", "Ready", "Completed", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findById(req.params.id).populate("canteen");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ✅ Ensure only the canteen’s admins can modify its orders
    if (!order.canteen.admins.map((a) => a.toString()).includes(req.user.id)) {
      return res.status(403).json({ message: "Unauthorized: not your canteen order" });
    }

    // ✅ Update status
    order.status = status;
    await order.save();

    res.json({
      success: true,
      message: `Order status updated to "${status}"`,
      order,
    });
  } catch (err) {
    console.error("updateOrderStatus error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update order",
      error: err.message,
    });
  }
};

export const cancelOrderByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // ✅ Ensure this order belongs to the logged-in user
    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Not your order" });
    }

    // ✅ Only allow cancel if still Paid or Pending
    if (!["Paid", "Pending"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order once it is ${order.status}`,
      });
    }

    order.status = "Cancelled";
    await order.save();

    res.json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (err) {
    console.error("cancelOrderByUser error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
      error: err.message,
    });
  }
};