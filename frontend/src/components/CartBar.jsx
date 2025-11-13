import { useEffect, useState } from "react";
import axios from "axios";
import { ShoppingCart } from "lucide-react";

export default function CartBar({ refresh }) {
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const token = localStorage.getItem("token");

  const fetchCart = async () => {
    try {
      const res = await axios.get("http://localhost:1230/api/v6/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data);
    } catch (err) {
      console.error("Cart Fetch Error:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [refresh]);

  if (!cart.items || cart.items.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-amber-600 text-white shadow-2xl px-6 py-3 rounded-full flex items-center gap-4 z-50 animate-fade-in">
      <ShoppingCart className="w-5 h-5" />
      <p className="text-lg font-semibold">
        {cart.items.length} item{cart.items.length > 1 ? "s" : ""} — ₹
        {cart.totalAmount}
      </p>
      <button
        className="bg-white text-amber-700 font-bold px-4 py-2 rounded-full hover:bg-amber-100 transition"
        onClick={() => (window.location.href = "/cart")}
      >
        Checkout
      </button>
    </div>
  );
}