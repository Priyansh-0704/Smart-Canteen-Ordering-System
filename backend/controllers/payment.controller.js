import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import Order from "../models/Order.models.js";
import Cart from "../models/Cart.models.js";
import Canteen from "../models/Canteen.models.js";
import client from "../services/twilioClient.js"
import User from "../models/User.models.js"
dotenv.config();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay Order
export const createPaymentOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { canteenId } = req.body;

    const cart = await Cart.findOne({ customer: userId });
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    const canteen = await Canteen.findById(canteenId);
    if (!canteen) return res.status(404).json({ message: "Canteen not found" });

    const options = {
      amount: cart.totalAmount * 100, // amount in paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Save order as pending
    const newOrder = await Order.create({
      user: userId,
      canteen: canteenId,
      items: cart.items,
      amount: cart.totalAmount,
      orderId: order.id,
      status: "Pending",
    });

    console.log("Created Razorpay order:", order);

    res.json({ success: true, order, newOrder });
  } catch (err) {
    console.error("Razorpay order creation error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user.id;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing payment details" });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    // ✅ Get pending order from DB
    const existingOrder = await Order.findOne({ orderId: razorpay_order_id }).populate("items.itemId");
    if (!existingOrder)
      return res.status(404).json({ success: false, message: "Order not found" });

    // ✅ Get canteen and user details
    const canteen = await Canteen.findById(existingOrder.canteen).populate("admins", "name mobile");
    const user = await User.findById(userId);

    // ✅ Mark order as paid
    existingOrder.paymentId = razorpay_payment_id;
    existingOrder.signature = razorpay_signature;
    existingOrder.status = "Paid";
    await existingOrder.save();

    // ✅ Clear user’s cart
    await Cart.findOneAndDelete({ customer: userId });

    // ✅ Format item list
    const itemList = existingOrder.items
      .map((i) => `${i.name} x${i.quantity}`)
      .join(", ");

    // ✅ Send WhatsApp notification to each canteen admin
    for (const admin of canteen.admins) {
      if (admin.mobile) {
        try {
          await client.messages.create({
            from: process.env.TWILIO_WHATSAPP_FROM,
            to: `whatsapp:+91${admin.mobile}`,
            body: `🧾 *New Order Alert!*\n👤 Customer: ${user.name}\n🏫 Canteen: ${canteen.name}\n🍱 Items: ${itemList}\n💰 Amount: ₹${existingOrder.amount} (Paid)\n\n✅ Please check your dashboard for order details.`,
          });
        } catch (twilioErr) {
          console.log("Twilio Admin Message Error:", twilioErr.message);
        }
      }
    }

    res.json({
      success: true,
      message: "Payment verified, order updated, and notification sent",
      order: existingOrder,
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
