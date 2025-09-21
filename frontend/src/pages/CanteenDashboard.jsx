import { useEffect, useState } from "react";
import axios from "axios";

function CanteenDashboard() {
  const [canteens, setCanteens] = useState([]);
  const [menu, setMenu] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", price: "", image: null });
  const token = localStorage.getItem("token");

  // Fetch admin's canteens
  useEffect(() => {
    axios.get("http://localhost:1230/api/v3/canteens/my", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => setCanteens(res.data))
    .catch(err => console.error(err));
  }, []);

  // Fetch menu
  useEffect(() => {
    if (canteens.length > 0) {
      axios.get(`http://localhost:1230/api/v4/canteen-menu/${canteens[0]._id}/menu`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => setMenu(res.data))
      .catch(err => console.error(err));
    }
  }, [canteens]);

  // ----------------- Handlers -----------------
  const handleAddMenu = async () => {
    if (!canteens[0]) return alert("No canteen found for this admin");

    try {
      const formData = new FormData();
      formData.append("name", newItem.name);
      formData.append("price", newItem.price);
      if (newItem.image) formData.append("photo", newItem.image);

      const res = await axios.post(
        `http://localhost:1230/api/v4/canteen-menu/${canteens[0]._id}/menu`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMenu([...menu, res.data.menuItem]);
      setNewItem({ name: "", price: "", image: null });
    } catch (err) {
      console.error("Add Menu Error:", err.response?.data || err.message);
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      const res = await axios.put(
        `http://localhost:1230/api/v4/canteen-menu/menu/${item._id}`,
        { isAvailable: !item.isAvailable },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMenu(menu.map(m => m._id === item._id ? res.data.menuItem : m));
    } catch (err) {
      console.error("Toggle Error:", err.response?.data || err.message);
    }
  };

  const handleUpdatePrice = async (item, newPrice) => {
    try {
      const res = await axios.put(
        `http://localhost:1230/api/v4/canteen-menu/menu/${item._id}`,
        { price: newPrice },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMenu(menu.map(m => m._id === item._id ? res.data.menuItem : m));
    } catch (err) {
      console.error("Price Update Error:", err.response?.data || err.message);
    }
  };

  const handleDeleteMenu = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await axios.delete(
        `http://localhost:1230/api/v4/canteen-menu/menu/${itemId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMenu(menu.filter(m => m._id !== itemId));
    } catch (err) {
      console.error("Delete Error:", err.response?.data || err.message);
    }
  };

  // ----------------- UI -----------------
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold mb-6">Canteen Dashboard</h1>

      {/* Menu */}
      <h2 className="text-2xl font-semibold mb-4">Menu Items</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {menu.map(m => (
          <div key={m._id} className="bg-white p-4 rounded-2xl shadow-md flex flex-col">
            {m.photo && <img src={m.photo} alt={m.name} className="w-full h-40 object-cover rounded-lg mb-3" />}
            <h3 className="text-lg font-bold">{m.name}</h3>

            <div className="flex items-center gap-2 mt-2">
              <input
                type="number"
                value={m.price}
                onChange={e => handleUpdatePrice(m, parseFloat(e.target.value))}
                className="border rounded-lg p-2 w-24"
              />
              <span>₹</span>
            </div>

            <div className="mt-2 flex items-center gap-3">
              <span className={m.isAvailable ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                {m.isAvailable ? "Available" : "Unavailable"}
              </span>
              <button onClick={() => handleToggleAvailability(m)} className="px-3 py-1 bg-yellow-500 text-white rounded-lg">
                Toggle
              </button>
            </div>

            <button onClick={() => handleDeleteMenu(m._id)} className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg">
              ❌ Remove
            </button>
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
            onChange={e => setNewItem({ ...newItem, name: e.target.value })}
            className="border rounded-xl p-3 flex-1"
          />
          <input
            placeholder="Price"
            value={newItem.price}
            onChange={e => setNewItem({ ...newItem, price: e.target.value })}
            className="border rounded-xl p-3 flex-1"
          />
          <input
            type="file"
            onChange={e => setNewItem({ ...newItem, image: e.target.files[0] })}
            className="border p-2 flex-1"
          />
          <button onClick={handleAddMenu} className="bg-green-600 text-white px-6 py-3 rounded-xl">
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

export default CanteenDashboard;
