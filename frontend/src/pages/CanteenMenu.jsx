import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Search, Plus, Minus } from "lucide-react";
import CartBar from "../components/CartBar";

export default function CanteenMenu() {
  const { canteenId } = useParams();
  const [canteen, setCanteen] = useState(null);
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState({ items: [] });
  const [search, setSearch] = useState("");
  const [refresh, setRefresh] = useState(0);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const fetchMenu = async () => {
    try {
      const res = await axios.get(
        `http://localhost:1230/api/v5/customer/canteens/${canteenId}/menu`,
        {
          params: { onlyAvailable: true },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      setCanteen(res.data.canteen);
      setMenu(res.data.menu);
    } catch (err) {
      console.error("Menu Fetch Error:", err.response?.data || err.message);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/signin");
      }
    }
  };

  const fetchCart = async () => {
    if (!token) return;
    try {
      const res = await axios.get("http://localhost:1230/api/v6/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data || { items: [] });
    } catch (err) {
      console.error("Cart Fetch Error:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, [canteenId]);

  useEffect(() => {
    fetchCart();
  }, [refresh]);

  const handleAdd = async (item) => {
    if (!token) return navigate("/signin");
    try {
      await axios.post(
        "http://localhost:1230/api/v6/cart/add",
        {
          itemId: item._id,
          name: item.name,
          price: item.price,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRefresh((prev) => prev + 1);
    } catch (err) {
      console.error("Add Error:", err.response?.data || err.message);
    }
  };

  const handleRemove = async (item) => {
    if (!token) return;
    try {
      await axios.post(
        "http://localhost:1230/api/v6/cart/remove",
        { itemId: item._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRefresh((prev) => prev + 1);
    } catch (err) {
      console.error("Remove Error:", err.response?.data || err.message);
    }
  };

  const getItemQty = (id) => {
    const found = cart.items?.find((i) => i.itemId === id || i.itemId?._id === id);
    return found ? found.quantity : 0;
  };

  const filteredMenu = menu.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed p-6 pt-24"
      style={{ backgroundImage: "url('/public/images/background.jpg')" }}
    >
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-5 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition"
      >
        ← Back
      </button>

      {canteen && (
        <div className="mb-6 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-orange-950 drop-shadow-lg">
            {canteen.name}
          </h1>
          <p className="text-md md:text-lg text-orange-950">{canteen.location}</p>
        </div>
      )}

      {/* Search Bar */}
      <div className="max-w-md mx-auto mb-8 relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-600 w-5 h-5" />
        <input
          type="text"
          placeholder="Search food items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-10 py-2.5 rounded-2xl shadow-md border border-amber-400 focus:ring-2 focus:ring-amber-500 outline-none bg-white/90 backdrop-blur-md text-gray-800 text-sm md:text-base"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        )}
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
        {filteredMenu.length > 0 ? (
          filteredMenu.map((item) => {
            const qty = getItemQty(item._id);
            return (
              <div
                key={item._id}
                className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-xl transform transition hover:scale-105 p-3 flex flex-col items-center"
              >
                <img
                  src={
                    item.photo ||
                    "https://via.placeholder.com/150?text=No+Image"
                  }
                  alt={item.name}
                  className="w-full h-36 sm:h-40 md:h-48 object-cover rounded-xl mb-3"
                />
                <h3 className="text-base md:text-lg font-bold text-amber-900 text-center">
                  {item.name}
                </h3>
                <p className="text-gray-800 font-medium mb-2 text-sm md:text-base">
                  ₹{item.price}
                </p>

                {qty === 0 ? (
                  <button
                    onClick={() => handleAdd(item)}
                    className="bg-amber-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-amber-700 transition"
                  >
                    Add to Cart
                  </button>
                ) : (
                  <div className="flex items-center gap-3 mt-auto">
                    <button
                      onClick={() => handleRemove(item)}
                      className="bg-amber-600 text-white p-2 rounded-full hover:bg-amber-700"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-lg font-semibold text-amber-900">
                      {qty}
                    </span>
                    <button
                      onClick={() => handleAdd(item)}
                      className="bg-amber-600 text-white p-2 rounded-full hover:bg-amber-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-orange-950 text-lg text-center col-span-full">
            No matching food items found.
          </p>
        )}
      </div>

      {/* Floating Cart Bar */}
      <CartBar refresh={refresh} />
    </div>
  );
}