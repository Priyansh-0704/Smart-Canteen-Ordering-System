import { useEffect, useState } from "react";
import axios from "axios";

function CanteenDashboard() {
  const [canteens, setCanteens] = useState([]);
  const [menu, setMenu] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", price: "", image: null });
  const token = localStorage.getItem("token");

  // Fetch admin's canteens
  useEffect(() => {
    axios
      .get("http://localhost:1230/api/v3/canteens/my", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCanteens(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Fetch menu for first canteen
  useEffect(() => {
    if (canteens.length > 0) {
      axios
        .get(
          `http://localhost:1230/api/v4/canteen-menu/${canteens[0]._id}/menu`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((res) => {
          const sorted = [...res.data].sort((a, b) => {
            return (b.isAvailable ? 1 : 0) - (a.isAvailable ? 1 : 0);
          });
          setMenu(sorted);
        })
        .catch((err) => console.error(err));
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

      setMenu(
        [...menu, res.data.menuItem].sort(
          (a, b) => (b.isAvailable ? 1 : 0) - (a.isAvailable ? 1 : 0)
        )
      );
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
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const updatedItem = res.data.menuItem || res.data;

      setMenu(
        menu
          .map((m) => (m._id === item._id ? updatedItem : m))
          .sort((a, b) =>
            a.isAvailable === b.isAvailable ? 0 : a.isAvailable ? -1 : 1
          )
      );
    } catch (err) {
      console.error("Toggle Error:", err.response?.data || err.message);
    }
  };

  const handleUpdatePrice = async (item, newPrice) => {
    try {
      const res = await axios.put(
        `http://localhost:1230/api/v4/canteen-menu/menu/${item._id}`,
        { price: newPrice },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const updatedItem = res.data.menuItem || res.data;
      setMenu(menu.map((m) => (m._id === item._id ? updatedItem : m)));
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
      setMenu(
        menu
          .filter((m) => m._id !== itemId)
          .sort((a, b) => (b.isAvailable ? 1 : 0) - (a.isAvailable ? 1 : 0))
      );
    } catch (err) {
      console.error("Delete Error:", err.response?.data || err.message);
    }
  };

  const handleToggleCanteenStatus = async () => {
    if (!canteens[0]) return;

    try {
      const res = await axios.put(
        `http://localhost:1230/api/v3/canteens/${canteens[0]._id}/toggle-status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCanteens([res.data.canteen]);
    } catch (err) {
      console.error(
        "Toggle Canteen Status Error:",
        err.response?.data || err.message
      );
    }
  };

  const handleUpdateTimes = async () => {
    if (!canteens[0]) return;
    try {
      await axios.put(
        `http://localhost:1230/api/v3/canteens/${canteens[0]._id}/update-times`,
        {
          openingTime: canteens[0].openingTime,
          closingTime: canteens[0].closingTime,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Canteen times updated!");
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  // ----------------- Helpers -----------------
  const isCanteenOpenNow = (canteen) => {
    if (!canteen?.openingTime || !canteen?.closingTime) return canteen?.isOpen;
    const now = new Date();
    const [openH, openM] = canteen.openingTime.split(":").map(Number);
    const [closeH, closeM] = canteen.closingTime.split(":").map(Number);

    const openDate = new Date();
    openDate.setHours(openH, openM, 0);

    const closeDate = new Date();
    closeDate.setHours(closeH, closeM, 0);

    return now >= openDate && now <= closeDate && canteen.isOpen;
  };

  // ----------------- UI -----------------
  return (
    <div
      className={`p-8 pt-24 min-h-screen transition-colors duration-500 ${
        isCanteenOpenNow(canteens[0]) ? "bg-gray-50" : "bg-red-200"
      }`}
    >
      {canteens[0] && (
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-extrabold">{canteens[0].name} Dashboard</h1>
          <div className="flex gap-2 items-center">
            <p
              className={`font-bold ${
                isCanteenOpenNow(canteens[0]) ? "text-green-600" : "text-red-600"
              }`}
            >
              {isCanteenOpenNow(canteens[0]) ? "Open Now" : "Closed"}
            </p>
            <button
              onClick={handleToggleCanteenStatus}
              className={`px-4 py-2 rounded-lg font-semibold shadow-md ${
                canteens[0].isOpen
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {canteens[0].isOpen ? "Close Canteen" : "Open Canteen"}
            </button>
          </div>
        </div>
      )}

      {/* Canteen Timings */}
      {canteens[0] && (
        <div className="mt-6 bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Canteen Timings</h2>
          <div className="flex gap-4 flex-col sm:flex-row items-center">
            <div>
              <label className="block mb-1 font-medium">Opening Time</label>
              <input
                type="time"
                value={canteens[0].openingTime || ""}
                onChange={(e) =>
                  setCanteens([{ ...canteens[0], openingTime: e.target.value }])
                }
                className="border rounded-xl p-2"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Closing Time</label>
              <input
                type="time"
                value={canteens[0].closingTime || ""}
                onChange={(e) =>
                  setCanteens([{ ...canteens[0], closingTime: e.target.value }])
                }
                className="border rounded-xl p-2"
              />
            </div>
            <button
              onClick={handleUpdateTimes}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl"
            >
              Save Timings
            </button>
          </div>
        </div>
      )}

      {/* Menu */}
      <h2 className="text-2xl font-semibold mt-8 mb-4">Menu Items</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {menu.map((m) => (
          <div
            key={m._id}
            className={`p-4 rounded-2xl shadow-md flex flex-col items-center transition ${
              m.isAvailable ? "bg-white" : "bg-gray-200 opacity-60"
            }`}
          >
            {m.photo ? (
              <img
                src={m.photo}
                alt={m.name}
                className="w-[300px] h-[300px] object-cover rounded-lg mb-3"
              />
            ) : (
              <div className="w-[300px] h-[300px] bg-gray-200 flex items-center justify-center rounded-lg mb-3 text-gray-500">
                No Image
              </div>
            )}
            <h3 className="text-lg font-bold">{m.name}</h3>

            <div className="flex items-center gap-2 mt-2">
              <input
                type="number"
                value={m.price}
                onChange={(e) =>
                  handleUpdatePrice(m, parseFloat(e.target.value))
                }
                className="border rounded-lg p-2 w-24"
              />
              <span>₹</span>
            </div>

            <div className="mt-2 flex items-center gap-3">
              <span
                className={
                  m.isAvailable
                    ? "text-green-600 font-semibold"
                    : "text-red-600 font-semibold"
                }
              >
                {m.isAvailable ? "Available" : "Unavailable"}
              </span>
              <button
                onClick={() => handleToggleAvailability(m)}
                className="px-3 py-1 bg-yellow-500 text-white rounded-lg"
              >
                Toggle
              </button>
            </div>

            <button
              onClick={() => handleDeleteMenu(m._id)}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg"
            >
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
            className="bg-green-600 text-white px-6 py-3 rounded-xl"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

export default CanteenDashboard;
