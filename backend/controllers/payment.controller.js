import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import Order from "../models/Order.models.js";
import Cart from "../models/Cart.models.js";
import Canteen from "../models/Canteen.models.js";

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

// Verify payment signature
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    console.log("Received payment data:", req.body);

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing payment data" });
    }

    // Compute expected signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    console.log("Expected signature:", expectedSignature);
    console.log("Received signature:", razorpay_signature);

    if (expectedSignature === razorpay_signature) {
      // Update order as Paid
      const order = await Order.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { status: "Paid", paymentId: razorpay_payment_id },
        { new: true }
      );

      // Clear user cart
      await Cart.findOneAndDelete({ customer: order.user });

      console.log("Payment verified and cart cleared for user:", order.user);

      res.json({ success: true, message: "Payment verified", order });
    } else {
      console.error("Invalid signature. Payment verification failed.");
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (err) {
    console.error("Payment verification error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};