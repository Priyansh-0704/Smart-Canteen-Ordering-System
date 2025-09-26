import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function CanteenMenu() {
  const { canteenId } = useParams();
  const [menu, setMenu] = useState([]);
  const [search, setSearch] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const fetchMenu = async () => {
    try {
      const res = await axios.get(`http://localhost:1230/api/v5/customer/canteens/${canteenId}/menu`, {
        params: { q: search, onlyAvailable }
      });
      setMenu(res.data.menu || []);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, [search, onlyAvailable, canteenId]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-24">
      <h1 className="text-3xl font-bold text-amber-800 mb-6">Canteen Menu</h1>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search food items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-amber-500 outline-none"
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={(e) => setOnlyAvailable(e.target.checked)}
          />
          Show only available
        </label>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {menu.length === 0 ? (
          <p className="text-gray-600">No menu items found.</p>
        ) : (
          menu.map((item) => (
            <div key={item._id} className="bg-white p-6 rounded-2xl shadow hover:shadow-xl transition">
              {item.photo && (
                <img
                  src={item.photo}
                  alt={item.name}
                  className="w-full h-40 object-cover rounded-xl mb-4"
                />
              )}
              <h3 className="text-lg font-bold">{item.name}</h3>
              <p className="text-gray-600">₹ {item.price}</p>
              <p className={`mt-2 font-semibold ${item.isAvailable ? "text-green-600" : "text-red-600"}`}>
                {item.isAvailable ? "Available" : "Unavailable"}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}