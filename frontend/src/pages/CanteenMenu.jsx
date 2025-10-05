import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Search } from "lucide-react";

export default function CanteenMenu() {
  const { canteenId } = useParams();
  const [canteen, setCanteen] = useState(null);
  const [menu, setMenu] = useState([]);
  const [search, setSearch] = useState(""); 
  const navigate = useNavigate();

  // Fetch menu and canteen info once
  const fetchMenu = async () => {
    try {
      const token = localStorage.getItem("token");
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

  useEffect(() => {
    fetchMenu();
  }, [canteenId]);

  const filteredMenu = menu.filter(item =>
    item.name.toLowerCase().startsWith(search.toLowerCase())
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
          <h1 className="text-4xl font-extrabold text-orange-950 drop-shadow-lg">{canteen.name}</h1>
          <p className="text-lg text-orange-950">{canteen.location}</p>
        </div>
      )}

      {/* 🔍 Food Search */}
      <div className="max-w-xl mx-auto mb-10 relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-600 w-5 h-5" />
        <input
          type="text"
          placeholder="Search food items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-2xl shadow-lg border border-amber-400 focus:ring-2 focus:ring-amber-500 outline-none bg-white/80 backdrop-blur-md"
        />
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {filteredMenu.length > 0 ? (
          filteredMenu.map((item) => (
            <div
              key={item._id}
              className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl hover:shadow-2xl transform transition hover:scale-105 p-4 flex flex-col items-center"
            >
              {item.photo ? (
                <img
                  src={item.photo}
                  alt={item.name}
                  className="w-[400px] h-[400px] object-cover rounded-2xl mb-4"
                />
              ) : (
                <div className="w-[300px] h-[300px] bg-gray-200 flex items-center justify-center rounded-2xl text-gray-500 mb-4">
                  No Image
                </div>
              )}
              <h3 className="text-xl font-bold text-amber-900">{item.name}</h3>
              <p className="text-gray-800 font-medium">₹{item.price}</p>
              <p
                className={`mt-1 font-semibold ${
                  item.isAvailable ? "text-green-600" : "text-red-600"
                }`}
              >
                {item.isAvailable ? "Available" : "Unavailable"}
              </p>
            </div>
          ))
        ) : (
          <p className="text-orange-950 text-lg text-center col-span-full">
            No matching food items found.
          </p>
        )}
      </div>
    </div>
  );
}
