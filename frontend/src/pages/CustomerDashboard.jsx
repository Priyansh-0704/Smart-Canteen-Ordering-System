import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CustomerDashboard() {
  const [canteens, setCanteens] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchCanteens = async () => {
    try {
      const res = await axios.get("http://localhost:1230/api/v5/customer/canteens", {
        params: { q: search }
      });
      setCanteens(res.data.canteens || []);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchCanteens();
  }, [search]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-24">
      <h1 className="text-3xl font-bold text-amber-800 mb-6">Browse Canteens</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search canteens..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-amber-500 outline-none"
      />

      {/* Canteen Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {canteens.map((c) => (
          <div
            key={c._id}
            onClick={() => c.isOpen && navigate(`/canteen/${c._id}`)}
            className={`p-6 rounded-2xl shadow-lg transition transform hover:scale-105 cursor-pointer ${
              c.isOpen ? "bg-white hover:shadow-xl" : "bg-gray-200 opacity-60 cursor-not-allowed"
            }`}
          >
            <h2 className="text-xl font-bold text-gray-800">{c.name}</h2>
            <p className="text-gray-600">{c.location}</p>
            <p className={`mt-2 font-semibold ${c.isOpen ? "text-green-600" : "text-red-600"}`}>
              {c.isOpen ? "Open" : "Closed"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}