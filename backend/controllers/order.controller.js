import Order from "../models/Order.models.js";
import Canteen from "../models/Canteen.models.js";
import crypto from "crypto";

// 🧾 Create order after Razorpay payment (verify signature)
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, cart } = req.body;
    const userId = req.user._id;

    // ✅ Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    // ✅ Verify canteen exists
    const canteen = await Canteen.findById(cart.canteen);
    if (!canteen) {
      return res.status(404).json({ success: false, message: "Canteen not found" });
    }

    // ✅ Create order in DB
    const newOrder = await Order.create({
      user: userId,
      canteen: canteen._id,
      items: cart.items,
      amount: cart.totalAmount,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      status: "Paid", // ✅ Order starts in Paid state after successful Razorpay verification
    });

    res.json({
      success: true,
      message: "Payment verified and order created successfully",
      order: newOrder,
    });
  } catch (err) {
    console.error("verifyPayment error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🧾 Get orders for canteen admin
export const getCanteenOrders = async (req, res) => {
  try {
    // Find canteens managed by this admin
    const canteens = await Canteen.find({ admins: req.user.id }).select("_id");
    const canteenIds = canteens.map((c) => c._id);

    // Fetch all orders belonging to those canteens
    const orders = await Order.find({ canteen: { $in: canteenIds } })
      .populate("user", "name mobile email")
      .populate("items.itemId", "name price photo") // ✅ Include item details
      .populate("canteen", "name")
      .sort({ createdAt: -1 }); // ✅ Newest first

    res.json({
      success: true,
      total: orders.length,
      orders,
    });
  } catch (err) {
    console.error("getCanteenOrders error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

// 🧾 Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // ✅ Added "Paid" as a valid status
    const validStatuses = ["Pending", "Paid", "Preparing", "Ready", "Completed", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(req.params.id).populate("canteen");
    if (!order) return res.status(404).json({ message: "Order not found" });

    // ✅ Check if the current user is an admin of the canteen
    if (!order.canteen.admins.map((a) => a.toString()).includes(req.user.id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // ✅ Update status
    order.status = status;
    await order.save();

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (err) {
    console.error("updateOrderStatus error:", err);
    res.status(500).json({ success: false, message: "Failed to update order" });
  }
};