import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Minus, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch cart
  const fetchCart = async () => {
    try {
      const res = await axios.get("http://localhost:1230/api/v6/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data || { items: [], totalAmount: 0 });
      setLoading(false);
    } catch (err) {
      console.error("Fetch Cart Error:", err.response?.data || err.message);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/signin");
      }
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Add quantity (+)
  const handleIncrease = async (itemId, name, price) => {
    await axios.post(
      "http://localhost:1230/api/v6/cart/add",
      { itemId, name, price },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchCart();
  };

  // Subtract quantity (-)
  const handleDecrease = async (itemId) => {
    await axios.post(
      "http://localhost:1230/api/v6/cart/remove",
      { itemId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchCart();
  };

  // Clear cart
  const handleClearCart = async () => {
    if (!window.confirm("Clear all items from cart?")) return;
    await axios.delete("http://localhost:1230/api/v6/cart/clear", {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchCart();
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading cart...</p>
      </div>
    );

  if (!cart.items.length)
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-2">🛒 Your cart is empty!</h2>
        <button
          onClick={() => navigate("/customer-dashboard")}
          className="mt-4 bg-amber-600 text-white px-6 py-3 rounded-xl hover:bg-amber-700 transition"
        >
          Browse Canteens
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-24">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-amber-700 font-semibold hover:underline"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <h1 className="text-3xl font-extrabold text-amber-900">Your Cart</h1>
          <button
            onClick={handleClearCart}
            className="text-red-600 hover:text-red-800 font-semibold flex items-center gap-1"
          >
            <Trash2 size={18} /> Clear All
          </button>
        </div>

        {/* Cart Items */}
        <div className="divide-y">
          {cart.items.map((item) => (
            <div
              key={item.itemId}
              className="flex justify-between items-center py-4"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-600">₹{item.price}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDecrease(item.itemId)}
                  className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-700"
                >
                  <Minus size={16} />
                </button>
                <span className="font-semibold">{item.quantity}</span>
                <button
                  onClick={() =>
                    handleIncrease(item.itemId, item.name, item.price)
                  }
                  className="p-2 rounded-full bg-green-100 hover:bg-green-200 text-green-700"
                >
                  <Plus size={16} />
                </button>
              </div>

              <p className="text-lg font-bold text-gray-800">
                ₹{item.price * item.quantity}
              </p>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="flex justify-between items-center mt-6 border-t pt-4">
          <h2 className="text-xl font-bold text-gray-800">Total:</h2>
          <p className="text-2xl font-extrabold text-amber-700">
            ₹{cart.totalAmount}
          </p>
        </div>

        <button
          onClick={() => alert("Checkout coming soon!")}
          className="mt-6 w-full bg-amber-600 text-white py-3 rounded-xl text-lg font-semibold hover:bg-amber-700 transition"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}