import Order from "../models/Order.models.js";
import Canteen from "../models/Canteen.models.js";

// Get orders for canteen admin
export const getCanteenOrders = async (req, res) => {
  try {
    const canteens = await Canteen.find({ admins: req.user.id }).select("_id");
    const canteenIds = canteens.map(c => c._id);

    const orders = await Order.find({ canteen: { $in: canteenIds } })
      .populate("user", "name mobile")
      .sort({ createdAt: -1 });

    res.json({ success: true, total: orders.length, orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["Preparing", "Ready", "Completed", "Cancelled"];
    if (!allowedStatuses.includes(status)) return res.status(400).json({ message: "Invalid status" });

    const order = await Order.findById(req.params.id).populate("canteen");
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (!order.canteen.admins.map(a => a.toString()).includes(req.user.id))
      return res.status(403).json({ message: "Access denied" });

    order.status = status;
    await order.save();

    res.json({ success: true, message: "Order status updated", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update order" });
  }
};
