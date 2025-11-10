import Order from "../models/Order.models.js";
import Canteen from "../models/Canteen.models.js";
import crypto from "crypto";
import Cart from "../models/Cart.models.js";
import client from "../services/twilioClient.js";
import User from "../models/User.models.js";
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


export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ["Pending", "Paid", "Preparing", "Ready", "Completed", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findById(req.params.id).populate("canteen");
    if (!order) return res.status(404).json({ message: "Order not found" });

    // ✅ ensure admin owns the canteen
    if (!order.canteen.admins.map(a => a.toString()).includes(req.user.id)) {
      return res.status(403).json({ message: "Unauthorized: not your canteen order" });
    }

    // ✅ update status
    order.status = status;
    await order.save();

    // ✅ Fetch user
    const user = await User.findById(order.user);

    // ✅ Send WhatsApp notification
    if (user?.mobile) {
      let messageBody = "";

      if (status === "Ready") {
        messageBody = `🍱 Hi ${user.name}, your order from ${order.canteen.name} is ready! Please pick it up.`;
      } else if (status === "Cancelled") {
        messageBody = `⚠️ Hi ${user.name}, your order from ${order.canteen.name} has been cancelled by the canteen. If payment was made, it will be refunded as per policy.`;
      }

      if (messageBody) {
        try {
          await client.messages.create({
            from: process.env.TWILIO_WHATSAPP_FROM,
            to: `whatsapp:+91${user.mobile}`,
            body: messageBody,
          });
        } catch (twilioErr) {
          console.log("Twilio Notification Error:", twilioErr.message);
        }
      }
    }

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

    // Populate full order info (canteen + items)
    const order = await Order.findById(orderId)
      .populate("canteen")
      .populate("items.itemId", "name price");
      
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

    // ✅ Update status
    order.status = "Cancelled";
    await order.save();

    // ✅ Prepare a readable summary of cart items
    const cartSummary = order.items
      .map(
        (i) => `• ${i.itemId.name} × ${i.quantity} = ₹${i.itemId.price * i.quantity}`
      )
      .join("\n");

    // ✅ Fetch canteen + user to notify admins
    const canteen = await Canteen.findById(order.canteen._id).populate("admins", "name mobile");
    const user = await User.findById(userId);

    // ✅ Notify all canteen admins via WhatsApp
    try {
      if (canteen?.admins?.length > 0) {
        for (const admin of canteen.admins) {
          if (admin.mobile) {
            await client.messages.create({
              from: process.env.TWILIO_WHATSAPP_FROM,
              to: `whatsapp:+91${admin.mobile}`,
              body: `🚫 *Order Cancelled*\n\nUser: *${user.name}*\nCanteen: *${canteen.name}*\n\n🛒 *Cancelled Items:*\n${cartSummary}\n\n💰 Total: ₹${order.amount}\n\nStatus: Cancelled`,
            });
          }
        }
      }
    } catch (twilioErr) {
      console.log("Twilio Admin Notify Error:", twilioErr.message);
    }

    res.json({
      success: true,
      message: "Order cancelled successfully and canteen notified",
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

