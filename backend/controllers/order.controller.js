import Order from "../models/Order.models.js";
import Canteen from "../models/Canteen.models.js";
import crypto from "crypto";
import Cart from "../models/Cart.models.js";
import client from "../services/twilioClient.js";
import User from "../models/User.models.js";

// helper to format WhatsApp number
const formatWhatsappNumber = (mobile) => {
  if (!mobile) return null;
  const digits = mobile.toString().replace(/\D/g, "");

  if (digits.length === 10) return `whatsapp:+91${digits}`; 
  if (digits.length === 12 && digits.startsWith("91"))
    return `whatsapp:+${digits}`;
  if (digits.length === 11 && digits.startsWith("0"))
    return `whatsapp:+91${digits.slice(1)}`;

  return `whatsapp:+${digits}`;
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      cart,
    } = req.body;

    const userId = req.user.id;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details",
      });
    }

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

    // canteen with admins so we can notify them
    const canteen = await Canteen.findById(cart?.canteen).populate(
      "admins",
      "name mobile"
    );
    if (!canteen) {
      return res.status(404).json({
        success: false,
        message: "Canteen not found",
      });
    }

    const newOrder = await Order.create({
      user: userId,
      canteen: canteen._id,
      items: cart.items,
      amount: cart.totalAmount,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      status: "Paid",
    });

    await Cart.findOneAndDelete({ customer: userId });

    // ---------- WhatsApp notifications on order creation ----------
    try {
      const user = await User.findById(userId);

      const itemsSummary = newOrder.items
        .map(
          (i) =>
            `• ${i.itemId?.name || "Item"} × ${i.quantity} = ₹${
              i.price || "?"
            }`
        )
        .join("\n");

      // 1) Notify user
      if (user?.mobile) {
        const to = formatWhatsappNumber(user.mobile);
        const body = `✅ Hi ${user.name}, your order from *${canteen.name}* has been placed successfully.\n\n💰 Amount: ₹${newOrder.amount}\n🧾 Order ID: ${newOrder._id}\n\nWe'll notify you when it is ready for pickup.`;

        console.log("🔔 WhatsApp to user (order create):", {
          rawMobile: user.mobile,
          to,
        });

        const resp = await client.messages.create({
          from: process.env.TWILIO_WHATSAPP_FROM,
          to,
          body,
        });

        console.log("✅ Twilio user order SID:", resp.sid);
      }

      // 2) Notify all canteen admins
      if (canteen?.admins?.length > 0) {
        for (const admin of canteen.admins) {
          if (!admin.mobile) continue;

          const to = formatWhatsappNumber(admin.mobile);
          const body = `🆕 *New Order Received*\n\nUser: *${user?.name}*\nCanteen: *${canteen.name}*\n\n🛒 Items:\n${itemsSummary}\n\n💰 Total: ₹${newOrder.amount}\nStatus: ${newOrder.status}`;

          console.log("🔔 WhatsApp to admin (order create):", {
            rawMobile: admin.mobile,
            to,
          });

          const resp = await client.messages.create({
            from: process.env.TWILIO_WHATSAPP_FROM,
            to,
            body,
          });

          console.log("✅ Twilio admin order SID:", resp.sid);
        }
      }
    } catch (twilioErr) {
      console.log("❌ Twilio notify on create error:", {
        message: twilioErr.message,
        code: twilioErr.code,
        moreInfo: twilioErr.moreInfo,
        status: twilioErr.status,
      });
    }
    // -------------------------------------------------------------

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

export const getCanteenOrders = async (req, res) => {
  try {
    const canteens = await Canteen.find({ admins: req.user.id }).select("_id");
    const canteenIds = canteens.map((c) => c._id);

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

    const validStatuses = [
      "Pending",
      "Paid",
      "Preparing",
      "Ready",
      "Completed",
      "Cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findById(req.params.id).populate("canteen");
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (!order.canteen.admins.map((a) => a.toString()).includes(req.user.id)) {
      return res
        .status(403)
        .json({ message: "Unauthorized: not your canteen order" });
    }

    order.status = status;
    await order.save();

    const user = await User.findById(order.user);

    if (user?.mobile) {
      let messageBody = "";

      if (status === "Ready") {
        messageBody = `🍱 Hi ${user.name}, your order from ${order.canteen.name} is ready! Please pick it up.`;
      } else if (status === "Cancelled") {
        messageBody = `⚠️ Hi ${user.name}, your order from ${order.canteen.name} has been cancelled by the canteen. If payment was made, it will be refunded as per policy.`;
      }

      if (messageBody) {
        const to = formatWhatsappNumber(user.mobile);

        console.log("🔔 WhatsApp to user (status):", {
          rawMobile: user.mobile,
          to,
          status,
        });

        try {
          const resp = await client.messages.create({
            from: process.env.TWILIO_WHATSAPP_FROM,
            to,
            body: messageBody,
          });
          console.log("✅ Twilio user notify SID:", resp.sid);
        } catch (twilioErr) {
          console.log("❌ Twilio Notification Error:", {
            message: twilioErr.message,
            code: twilioErr.code,
            moreInfo: twilioErr.moreInfo,
            status: twilioErr.status,
          });
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

    const order = await Order.findById(orderId)
      .populate("canteen")
      .populate("items.itemId", "name price");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.user.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not your order" });
    }

    if (!["Paid", "Pending"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order once it is ${order.status}`,
      });
    }

    order.status = "Cancelled";
    await order.save();

    const cartSummary = order.items
      .map(
        (i) =>
          `• ${i.itemId.name} × ${i.quantity} = ₹${
            i.itemId.price * i.quantity
          }`
      )
      .join("\n");

    const canteen = await Canteen.findById(order.canteen._id).populate(
      "admins",
      "name mobile"
    );
    const user = await User.findById(userId);

    try {
      if (canteen?.admins?.length > 0) {
        for (const admin of canteen.admins) {
          if (admin.mobile) {
            const to = formatWhatsappNumber(admin.mobile);

            console.log("🔔 WhatsApp to admin (cancel):", {
              rawMobile: admin.mobile,
              to,
            });

            const resp = await client.messages.create({
              from: process.env.TWILIO_WHATSAPP_FROM,
              to,
              body: `🚫 *Order Cancelled*\n\nUser: *${user.name}*\nCanteen: *${canteen.name}*\n\n🛒 *Cancelled Items:*\n${cartSummary}\n\n💰 Total: ₹${order.amount}\n\nStatus: Cancelled`,
            });

            console.log("✅ Twilio admin notify SID:", resp.sid);
          }
        }
      }
    } catch (twilioErr) {
      console.log("❌ Twilio Admin Notify Error:", {
        message: twilioErr.message,
        code: twilioErr.code,
        moreInfo: twilioErr.moreInfo,
        status: twilioErr.status,
      });
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
