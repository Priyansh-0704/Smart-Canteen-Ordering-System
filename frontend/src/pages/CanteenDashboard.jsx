import { useEffect, useState } from "react";
import axios from "axios";

function CanteenDashboard() {
  const [canteens, setCanteens] = useState([]);
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", price: "", image: null });
  const [activeTab, setActiveTab] = useState("menu"); // "menu" or "orders"
  const token = localStorage.getItem("token");

  // ----------------- Fetch canteens -----------------
  useEffect(() => {
    axios
      .get("http://localhost:1230/api/v3/canteens/my", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCanteens(res.data))
      .catch((err) => console.error(err));
  }, []);

  // ----------------- Fetch menu -----------------
  useEffect(() => {
    if (!canteens[0]?._id) return;
    axios
      .get(`http://localhost:1230/api/v4/canteen-menu/${canteens[0]._id}/menu`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const sorted = [...res.data].sort(
          (a, b) => (b.isAvailable ? 1 : 0) - (a.isAvailable ? 1 : 0)
        );
        setMenu(sorted);
      })
      .catch((err) => console.error(err));
  }, [canteens]);

  // ----------------- Fetch orders -----------------
  useEffect(() => {
    axios
      .get(`http://localhost:1230/api/v8/order/canteen`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data?.orders) setOrders(res.data.orders);
        else setOrders([]);
      })
      .catch((err) =>
        console.error("Order fetch error:", err.response?.data || err.message)
      );
  }, [canteens]);

  // ----------------- Menu Handlers -----------------
  const handleAddMenu = async () => {
    if (!canteens[0]?._id) return alert("No canteen found");
    try {
      const formData = new FormData();
      formData.append("name", newItem.name);
      formData.append("price", parseFloat(newItem.price));
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

      setMenu((prev) => [res.data.menuItem, ...prev]);
      setNewItem({ name: "", price: "", image: null });
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      const res = await axios.put(
        `http://localhost:1230/api/v4/canteen-menu/menu/${item._id}`,
        { isAvailable: !item.isAvailable },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedItem = res.data.menuItem || res.data;
      setMenu((prev) =>
        prev.map((m) => (m._id === item._id ? updatedItem : m))
      );
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const handleUpdatePrice = async (item, price) => {
    try {
      const res = await axios.put(
        `http://localhost:1230/api/v4/canteen-menu/menu/${item._id}`,
        { price },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedItem = res.data.menuItem || res.data;
      setMenu((prev) =>
        prev.map((m) => (m._id === item._id ? updatedItem : m))
      );
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const handleDeleteMenu = async (id) => {
    if (!window.confirm("Delete this menu item?")) return;
    try {
      await axios.delete(
        `http://localhost:1230/api/v4/canteen-menu/menu/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMenu((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  // ----------------- Canteen Handlers -----------------
  const handleToggleCanteenStatus = async () => {
    if (!canteens[0]?._id) return;
    try {
      const res = await axios.put(
        `http://localhost:1230/api/v3/canteens/${canteens[0]._id}/toggle-status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCanteens([res.data.canteen]);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const handleUpdateTimes = async () => {
    if (!canteens[0]?._id) return;
    try {
      await axios.put(
        `http://localhost:1230/api/v3/canteens/${canteens[0]._id}/update-times`,
        {
          openingTime: canteens[0].openingTime,
          closingTime: canteens[0].closingTime,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Canteen timings updated!");
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const isCanteenOpenNow = (canteen) => {
    if (!canteen) return false;
    const now = new Date();
    const [h1, m1] = (canteen.openingTime || "00:00").split(":").map(Number);
    const [h2, m2] = (canteen.closingTime || "23:59").split(":").map(Number);
    const open = new Date();
    open.setHours(h1, m1, 0);
    const close = new Date();
    close.setHours(h2, m2, 0);
    return canteen.isOpen && now >= open && now <= close;
  };

  // ----------------- UI -----------------
  return (
    <div
      className={`p-8 pt-24 min-h-screen ${
        isCanteenOpenNow(canteens[0]) ? "bg-gray-50" : "bg-red-200"
      }`}
    >
      {/* Canteen Info */}
      {canteens[0] && (
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold">
            {canteens[0].name} Dashboard
          </h1>
          <button
            onClick={handleToggleCanteenStatus}
            className={`px-4 py-2 rounded-lg text-white ${
              canteens[0].isOpen
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {canteens[0].isOpen ? "Close Canteen" : "Open Canteen"}
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === "menu"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-black"
          }`}
          onClick={() => setActiveTab("menu")}
        >
          Menu
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === "orders"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-black"
          }`}
          onClick={() => setActiveTab("orders")}
        >
          Orders
        </button>
      </div>

      {/* ----------------- Menu Tab ----------------- */}
      {activeTab === "menu" && (
        <>
          <div className="bg-white p-6 rounded-2xl shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">Add Menu Item</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                placeholder="Name"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
                className="border p-3 rounded-xl flex-1"
              />
              <input
                placeholder="Price"
                value={newItem.price}
                onChange={(e) =>
                  setNewItem({ ...newItem, price: e.target.value })
                }
                className="border p-3 rounded-xl flex-1"
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

          {/* Menu Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {menu.map((m) => (
              <div
                key={m._id}
                className={`p-4 rounded-2xl shadow-md flex flex-col items-center ${
                  m.isAvailable ? "bg-white" : "bg-gray-200 opacity-70"
                }`}
              >
                {m.photo ? (
                  <img
                    src={m.photo}
                    alt={m.name}
                    className="w-[300px] h-[300px] object-cover rounded-lg mb-3"
                  />
                ) : (
                  <div className="w-[300px] h-[300px] bg-gray-200 flex items-center justify-center rounded-lg mb-3">
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
                <div className="mt-2 flex gap-2 items-center">
                  <span
                    className={
                      m.isAvailable ? "text-green-600" : "text-red-600"
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
        </>
      )}

      {/* ----------------- Orders Tab ----------------- */}
      {activeTab === "orders" && (
        <div className="bg-white p-6 rounded-2xl shadow-md">
          {orders.length === 0 ? (
            <p>No orders yet.</p>
          ) : (
            orders.map((order) => (
              <div
                key={order._id}
                className="border p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2"
              >
                <div>
                  <p>
                    <strong>Order ID:</strong> {order.orderId}
                  </p>
                  <p>
                    <strong>Customer:</strong> {order.user?.name || "Unknown"}
                  </p>
                  <p>
                    <strong>Total:</strong> ₹{order.amount}
                  </p>
                  <p>
                    <strong>Status:</strong> {order.status}
                  </p>
                </div>
                {order.status !== "Completed" && (
                  <button
                    onClick={async () => {
                      try {
                        await axios.put(
                          `http://localhost:1230/api/v8/order/${order._id}/status`,
                          { status: "Completed" },
                          { headers: { Authorization: `Bearer ${token}` } }
                        );
                        setOrders((prev) =>
                          prev.map((o) =>
                            o._id === order._id
                              ? { ...o, status: "Completed" }
                              : o
                          )
                        );
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-xl"
                  >
                    Mark Completed
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default CanteenDashboard;
