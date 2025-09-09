import { useEffect, useState } from "react";
import axios from "axios";

function CanteenDashboard() {
  const [canteens, setCanteens] = useState([]);
  const [menu, setMenu] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", price: "", image: null });

  const token = localStorage.getItem("token"); // ✅ fixed

  useEffect(() => {
    axios
      .get("http://localhost:1230/api/v3/canteens/my", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCanteens(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (canteens.length > 0) {
      axios
        .get(
          `http://localhost:1230/api/v4/canteen-menu/${canteens[0]._id}/menu`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((res) => setMenu(res.data))
        .catch((err) => console.error(err));
    }
  }, [canteens]);

const handleAddMenu = async () => {
  if (!canteens[0]) return alert("No canteen found for this admin");

  try {
    const res = await axios.post(
      `http://localhost:1230/api/v4/canteen-menu/${canteens[0]._id}/menu`,
      {
        name: newItem.name,
        price: newItem.price,
        photo: newItem.image,  
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setMenu([...menu, res.data.menuItem]);
    setNewItem({ name: "", price: "", image: null });
  } catch (err) {
    console.error("Add Menu Error:", err.response?.data || err.message);
  }
};


  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6">
        Canteen Dashboard
      </h1>

      {/* Canteen Details */}
      {canteens.map((c) => (
        <div
          key={c._id}
          className="bg-white p-6 rounded-2xl shadow-md mb-6 border-l-4 border-green-500"
        >
          <h2 className="text-2xl font-bold">{c.name}</h2>
          <p className="text-gray-600">📍 {c.location}</p>
          <p className="mt-2 font-semibold">
            Status:{" "}
            <span
              className={`${
                c.isOpen ? "text-green-600" : "text-red-600"
              } font-bold`}
            >
              {c.isOpen ? "Open ✅" : "Closed ❌"}
            </span>
          </p>
        </div>
      ))}

      {/* Menu Section */}
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Menu Items</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {menu.map((m) => (
          <div
            key={m._id}
            className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition"
          >
            {m.photo && (
              <img
                src={m.photo}
                alt={m.name}
                className="w-full h-40 object-cover rounded-lg mb-3"
              />
            )}
            <h3 className="text-lg font-bold">{m.name}</h3>
            <p className="text-gray-600">₹ {m.price}</p>
          </div>
        ))}
      </div>

      {/* Add Menu Form */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">Add Menu Item</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            placeholder="Food Name"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            className="border rounded-xl p-3 flex-1"
          />
          <input
            placeholder="Price"
            value={newItem.price}
            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
            className="border rounded-xl p-3 flex-1"
          />
          <input
            type="file"
            onChange={(e) =>
              setNewItem({ ...newItem, image: e.target.files[0] })
            }
            className="border p-2 flex-1"
          />
          <button
            onClick={handleAddMenu}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl shadow-md"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

export default CanteenDashboard;
