import { useEffect, useState } from "react";
import axios from "axios";

function CanteenDashboard() {
  const [canteens, setCanteens] = useState([]);
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", price: "", image: null });
  const [activeTab, setActiveTab] = useState("menu"); // "menu" or "orders"
  const [editTimes, setEditTimes] = useState(false);
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

  // ----------------- Fetch menu helper -----------------
  const fetchMenu = async () => {
    if (!canteens[0]?._id) return;
    try {
      const res = await axios.get(
        `http://localhost:1230/api/v4/canteen-menu/${canteens[0]._id}/menu`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const sorted = [...res.data].sort(
        (a, b) => (b.isAvailable ? 1 : 0) - (a.isAvailable ? 1 : 0)
      );
      setMenu(sorted);
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------- Fetch menu -----------------
  useEffect(() => {
    fetchMenu();
  }, [canteens]);

  // ----------------- Fetch orders -----------------
  const fetchOrders = async () => {
    try {
      const res = await axios.get(`http://localhost:1230/api/v8/order/canteen`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.orders) setOrders(res.data.orders);
      else setOrders([]);
    } catch (err) {
      console.error("Order fetch error:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Auto-refresh orders every 10 seconds
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [canteens]);


  // ----------------- Menu Handlers -----------------
  const handleAddMenu = async () => {
    if (!canteens[0]?._id) return alert("No canteen found");
    try {
      const formData = new FormData();
      formData.append("name", newItem.name);
      formData.append("price", parseFloat(newItem.price));
      if (newItem.image) formData.append("photo", newItem.image);

      await axios.post(
        `http://localhost:1230/api/v4/canteen-menu/${canteens[0]._id}/menu`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setNewItem({ name: "", price: "", image: null });
      fetchMenu(); // Refresh menu instead of pushing item manually
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
      setEditTimes(false);
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
      className={`p-8 pt-24 min-h-screen ${isCanteenOpenNow(canteens[0]) ? "bg-gray-50" : "bg-red-200"
        }`}
    >
      {/* Canteen Info */}
      {canteens[0] && (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold mb-2">
              {canteens[0].name} Dashboard
            </h1>

            <div className="flex items-center gap-4">
              {editTimes ? (
                <>
                  <label className="text-sm">
                    Opens:
                    <input
                      type="time"
                      value={canteens[0].openingTime}
                      onChange={(e) =>
                        setCanteens([
                          { ...canteens[0], openingTime: e.target.value },
                        ])
                      }
                      className="ml-2 border rounded-lg px-2 py-1"
                    />
                  </label>
                  <label className="text-sm">
                    Closes:
                    <input
                      type="time"
                      value={canteens[0].closingTime}
                      onChange={(e) =>
                        setCanteens([
                          { ...canteens[0], closingTime: e.target.value },
                        ])
                      }
                      className="ml-2 border rounded-lg px-2 py-1"
                    />
                  </label>
                  <button
                    onClick={handleUpdateTimes}
                    className="ml-4 bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-lg"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditTimes(false)}
                    className="text-gray-600 underline text-sm ml-2"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <p className="text-gray-700">
                    🕒 {canteens[0].openingTime} – {canteens[0].closingTime}
                  </p>
                  <button
                    onClick={() => setEditTimes(true)}
                    className="text-blue-600 underline text-sm"
                  >
                    Edit Timings
                  </button>
                </>
              )}
            </div>

            <p
              className={`mt-1 font-semibold ${isCanteenOpenNow(canteens[0])
                ? "text-green-600"
                : "text-red-600"
                }`}
            >
              {isCanteenOpenNow(canteens[0])
                ? "Currently Open"
                : "Currently Closed"}
            </p>
          </div>

          <button
            onClick={handleToggleCanteenStatus}
            className={`px-4 py-2 rounded-lg text-white ${canteens[0].isOpen
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
          className={`px-4 py-2 rounded-lg ${activeTab === "menu"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-black"
            }`}
          onClick={() => setActiveTab("menu")}
        >
          Menu
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${activeTab === "orders"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {menu.map((m) => (
              <div
                key={m._id}
                className={`group relative flex flex-col items-center text-center rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:scale-[1.02] ${m.isAvailable
                  ? "bg-white/95"
                  : "bg-gray-100/90 opacity-80 grayscale"
                  }`}
              >
                {/* Image */}
                {m.photo ? (
                  <img
                    src={m.photo}
                    alt={m.name}
                    className="w-full h-64 object-cover rounded-t-2xl transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-300 flex items-center justify-center text-gray-600 rounded-t-2xl">
                    No Image
                  </div>
                )}

                {/* Content */}
                <div className="p-5 w-full flex flex-col items-center">
                  {/* Item Name */}
                  <h3 className="text-lg font-semibold text-gray-900 capitalize tracking-wide">
                    {m.name}
                  </h3>

                  {/* Price & Availability Row */}
                  <div className="flex items-center justify-center gap-3 mt-3">
                    <div className="flex items-center border border-gray-300 rounded-lg px-2 py-1 focus-within:ring-2 focus-within:ring-blue-400 transition-all">
                      <input
                        type="number"
                        value={m.price}
                        onChange={(e) =>
                          handleUpdatePrice(m, parseFloat(e.target.value))
                        }
                        className="w-20 text-center outline-none bg-transparent"
                      />
                      <span className="font-semibold text-gray-600 ml-1">₹</span>
                    </div>

                    <button
                      onClick={() => handleToggleAvailability(m)}
                      className={`px-4 py-2 font-semibold rounded-lg shadow-sm transition-colors duration-200 ${m.isAvailable
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-red-500 hover:bg-red-600 text-white"
                        }`}
                    >
                      {m.isAvailable ? "Available" : "Unavailable"}
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleDeleteMenu(m._id)}
                    className="mt-5 bg-gray-800 hover:bg-black text-white font-semibold px-6 py-2 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Remove
                  </button>
                </div>
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
                className="border p-5 rounded-xl flex flex-col gap-3 mb-4 shadow-sm bg-gray-50 hover:bg-gray-100 transition"
              >
                {/* Top info */}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">
                      Order ID: {order.orderId || order._id.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Placed on:{" "}
                      {new Date(order.createdAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                    <p className="text-sm text-gray-700">
                      Customer: {order.user?.name || "Unknown"}
                    </p>
                  </div>

                  <div className="flex flex-col items-end">
                    <span
                      className={`text-sm font-semibold px-3 py-1 rounded-lg ${order.status === "Pending"
                        ? "bg-yellow-200 text-yellow-800"
                        : order.status === "Preparing"
                          ? "bg-blue-200 text-blue-800"
                          : order.status === "Ready"
                            ? "bg-purple-200 text-purple-800"
                            : "bg-green-200 text-green-800"
                        }`}
                    >
                      {order.status}
                    </span>
                    <span className="text-gray-700 font-semibold mt-1">
                      ₹{order.amount}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="mt-2 border-t pt-2">
                  <h4 className="font-semibold text-gray-800 mb-2">Items:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {order.items?.map((it, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span>
                          {it.name || it.itemId?.name} × {it.quantity}
                        </span>
                        <span>₹{(it.price || it.itemId?.price) * it.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Buttons */}
                <div className="mt-3 flex flex-wrap gap-3 justify-end">
                  {/* Only show "Mark Preparing" if payment is completed */}
                  {order.status === "Paid" && (
                    <button
                      onClick={async () => {
                        await axios.put(
                          `http://localhost:1230/api/v8/order/${order._id}/status`,
                          { status: "Preparing" },
                          { headers: { Authorization: `Bearer ${token}` } }
                        );
                        setOrders((prev) =>
                          prev.map((o) =>
                            o._id === order._id ? { ...o, status: "Preparing" } : o
                          )
                        );
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold"
                    >
                      Mark Preparing
                    </button>
                  )}

                  {order.status === "Preparing" && (
                    <>
                      <button
                        onClick={async () => {
                          await axios.put(
                            `http://localhost:1230/api/v8/order/${order._id}/status`,
                            { status: "Ready" },
                            { headers: { Authorization: `Bearer ${token}` } }
                          );
                          setOrders((prev) =>
                            prev.map((o) =>
                              o._id === order._id ? { ...o, status: "Ready" } : o
                            )
                          );
                        }}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold"
                      >
                        Mark Ready
                      </button>

                      {/* Allow revert to Paid */}
                      <button
                        onClick={async () => {
                          await axios.put(
                            `http://localhost:1230/api/v8/order/${order._id}/status`,
                            { status: "Paid" },
                            { headers: { Authorization: `Bearer ${token}` } }
                          );
                          setOrders((prev) =>
                            prev.map((o) =>
                              o._id === order._id ? { ...o, status: "Paid" } : o
                            )
                          );
                        }}
                        className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold"
                      >
                        Revert to Paid
                      </button>
                    </>
                  )}

                  {order.status === "Ready" && (
                    <>
                      <button
                        onClick={async () => {
                          await axios.put(
                            `http://localhost:1230/api/v8/order/${order._id}/status`,
                            { status: "Completed" },
                            { headers: { Authorization: `Bearer ${token}` } }
                          );
                          setOrders((prev) =>
                            prev.map((o) =>
                              o._id === order._id ? { ...o, status: "Completed" } : o
                            )
                          );
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
                      >
                        Mark Completed
                      </button>

                      {/* Allow revert to Preparing */}
                      <button
                        onClick={async () => {
                          await axios.put(
                            `http://localhost:1230/api/v8/order/${order._id}/status`,
                            { status: "Preparing" },
                            { headers: { Authorization: `Bearer ${token}` } }
                          );
                          setOrders((prev) =>
                            prev.map((o) =>
                              o._id === order._id ? { ...o, status: "Preparing" } : o
                            )
                          );
                        }}
                        className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold"
                      >
                        Revert to Preparing
                      </button>
                    </>
                  )}
                  {/* ✅ NEW: Allow revert to Ready after completed */}
                  {order.status === "Completed" && (
                    <button
                      onClick={async () => {
                        await axios.put(
                          `http://localhost:1230/api/v8/order/${order._id}/status`,
                          { status: "Ready" },
                          { headers: { Authorization: `Bearer ${token}` } }
                        );
                        setOrders((prev) =>
                          prev.map((o) =>
                            o._id === order._id ? { ...o, status: "Ready" } : o
                          )
                        );
                      }}
                      className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold"
                    >
                      Revert to Ready
                    </button>
                  )}
                </div>

              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}
export default CanteenDashboard;