import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Minus, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const [cart, setCart] = useState({ items: [], totalAmount: 0, canteen: null });
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const res = await axios.get("http://localhost:1230/api/v6/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCart({
        items: res.data.items || [],
        totalAmount: res.data.totalAmount || 0,
        canteen: res.data.canteenId || null,
      });
    } catch (err) {
      console.error("Fetch cart error:", err.response || err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/signin");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleIncrease = async (itemId) => {
    try {
      await axios.post(
        "http://localhost:1230/api/v6/cart/add",
        { itemId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCart();
    } catch (err) {
      console.error("Increase item error:", err.response || err);
    }
  };

  const handleDecrease = async (itemId) => {
    try {
      await axios.post(
        "http://localhost:1230/api/v6/cart/remove",
        { itemId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCart();
    } catch (err) {
      console.error("Decrease item error:", err.response || err);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm("Clear all items from cart?")) return;
    try {
      await axios.delete("http://localhost:1230/api/v6/cart/clear", {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart();
    } catch (err) {
      console.error("Clear cart error:", err.response || err);
    }
  };

  const handlePayNow = async () => {
    try {
      if (!cart.canteen) return alert("Cannot determine canteen.");
      if (cart.totalAmount <= 0) return alert("Cart is empty.");

      const { data } = await axios.post(
        "http://localhost:1230/api/v7/payment/order",
        { canteenId: cart.canteen },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!data.order || !data.order.id) return alert("Order creation failed.");

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: "INR",
        name: "HostelEats",
        description: "Order Payment",
        order_id: data.order.id,
        handler: async (response) => {
          try {
            const verifyRes = await axios.post(
              "http://localhost:1230/api/v7/payment/verify",
              response,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!verifyRes.data.success) return alert("Payment failed.");

            fetchCart();
            alert("Payment successful!");
            navigate("/customer-dashboard");
          } catch (err) {
            alert("Verification failed.");
          }
        },
        theme: { color: "#F59E0B" },
      };

      if (!window.Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => new window.Razorpay(options).open();
        script.onerror = () => alert("Razorpay SDK failed to load.");
        document.body.appendChild(script);
      } else new window.Razorpay(options).open();
    } catch (err) {
      console.error("Payment error:", err);
      alert("Checkout failed.");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-lg">
        Loading cart...
      </div>
    );

  if (!cart.items.length)
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-700">
          🛒 Your cart is empty!
        </h2>
        <button
          onClick={() => navigate("/customer-dashboard")}
          className="mt-4 bg-amber-600 text-white px-6 py-3 rounded-xl hover:bg-amber-700 transition"
        >
          Browse Canteens
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 pt-[56px] sm:pt-[64px] lg:pt-[72px]">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-amber-700 font-semibold hover:underline"
          >
            <ArrowLeft size={18} /> Back
          </button>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-900">
            Your Cart
          </h1>

          <button
            onClick={handleClearCart}
            className="text-red-600 hover:text-red-800 font-semibold flex items-center gap-1"
          >
            <Trash2 size={18} /> Clear All
          </button>
        </div>

        <div className="divide-y">
          {cart.items.map((item) => (
            <div
              key={item.itemId?._id || item.itemId}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-4"
            >
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                  {item.name}
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  ₹{item.price}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Qty: {item.quantity}
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => handleDecrease(item.itemId._id || item.itemId)}
                  className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-700"
                >
                  <Minus size={16} />
                </button>

                <span className="font-semibold text-base sm:text-lg">
                  {item.quantity}
                </span>

                <button
                  onClick={() => handleIncrease(item.itemId._id || item.itemId)}
                  className="p-2 rounded-full bg-green-100 hover:bg-green-200 text-green-700"
                >
                  <Plus size={16} />
                </button>
              </div>

              <p className="text-lg sm:text-xl font-bold text-gray-800 mt-2 sm:mt-0">
                ₹{item.price * item.quantity}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-between sm:items-center mt-6 border-t pt-4 gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              Total:
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-700">
              ₹{cart.totalAmount}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate("/customer-dashboard")}
              className="w-full sm:w-auto px-5 py-3 border rounded-xl text-amber-700 font-semibold hover:bg-amber-50 transition"
            >
              Continue Shopping
            </button>

            <button
              onClick={handlePayNow}
              className="w-full sm:w-auto bg-amber-600 text-white py-3 px-6 rounded-xl text-lg font-semibold hover:bg-amber-700 transition"
            >
              Pay with Razorpay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
