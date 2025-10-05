import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react"; 

export default function CustomerDashboard() {
  const [canteens, setCanteens] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchCanteens = async () => {
    try {
      const res = await axios.get("http://localhost:1230/api/v5/customer/canteens", {
        params: { q: search },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setCanteens(res.data.canteens || []);
    } catch (err) {
      console.error("Fetch Error:", err.response?.data || err.message);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/signin");
      }
    }
  };

  useEffect(() => {
    fetchCanteens();
  }, [search]);

  // Helper to check if canteen is open based on current time
  const isOpenNow = (c) => {
    if (!c.openingTime || !c.closingTime) return c.isOpen;
    const now = new Date();
    const [openH, openM] = c.openingTime.split(":").map(Number);
    const [closeH, closeM] = c.closingTime.split(":").map(Number);

    const openDate = new Date();
    openDate.setHours(openH, openM, 0);

    const closeDate = new Date();
    closeDate.setHours(closeH, closeM, 0);

    return now >= openDate && now <= closeDate && c.isOpen;
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed p-6 pt-24"
      style={{ backgroundImage: "url('/public/images/background.jpg')" }}
    >
      <h1 className="text-4xl font-extrabold text-orange-950 text-center mb-8 drop-shadow-lg">
        Browse Canteens
      </h1>

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-10 relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-600 w-5 h-5" />
        <input
          type="text"
          placeholder="Search canteens..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-2xl shadow-lg border border-amber-400 focus:ring-2 focus:ring-amber-500 outline-none bg-white/80 backdrop-blur-md"
        />
      </div>

      {/* Canteen Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {canteens.map((c) => (
          <div
            key={c._id}
            onClick={() => isOpenNow(c) && navigate(`/canteen/${c._id}`)}
            className={`relative rounded-3xl overflow-hidden shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer ${
              isOpenNow(c) ? "" : "opacity-60 cursor-not-allowed"
            }`}
          >
            {c.previewImage ? (
              <img
                src={c.previewImage}
                alt={`${c.name} Preview`}
                className="w-full h-64 object-cover"
              />
            ) : (
              <div className="w-full h-64 bg-gray-400 flex items-center justify-center text-white text-lg">
                No Image
              </div>
            )}
            <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-5 text-white">
              <h2 className="text-2xl font-bold drop-shadow-md">{c.name}</h2>
              <p className="text-sm">{c.location}</p>
              {/* Display Opening & Closing Time */}
              {c.openingTime && c.closingTime && (
                <p className="text-sm mt-1">
                  🕒 {c.openingTime} – {c.closingTime}
                </p>
              )}
              <p
                className={`mt-1 font-semibold ${
                  isOpenNow(c) ? "text-green-400" : "text-red-400"
                }`}
              >
                {isOpenNow(c) ? "Open" : "Closed"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
