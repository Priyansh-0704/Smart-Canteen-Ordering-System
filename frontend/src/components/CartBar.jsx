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
    <div
      className="
        fixed bottom-4 left-1/2 -translate-x-1/2 
        bg-amber-600 text-white shadow-2xl 
        px-4 py-2 sm:px-6 sm:py-3 
        rounded-full flex items-center gap-2 sm:gap-4 
        z-50 animate-fade-in 
        max-w-[95%] sm:max-w-none 
      "
    >
      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />

      <p className="text-sm sm:text-lg font-semibold whitespace-nowrap">
        {cart.items.length} item{cart.items.length > 1 ? "s" : ""} — ₹
        {cart.totalAmount}
      </p>

      <button
        className="
          bg-white text-amber-700 font-bold 
          px-3 py-1.5 sm:px-4 sm:py-2 
          rounded-full 
          hover:bg-amber-100 transition 
          text-xs sm:text-sm 
        "
        onClick={() => (window.location.href = "/cart")}
      >
        Checkout
      </button>
    </div>
  );
}
