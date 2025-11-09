import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

export default function CustomerDashboard() {
  const [canteens, setCanteens] = useState([]);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("browse"); // browse | orders
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // ------------------- Fetch Canteens -------------------
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

  // ------------------- Fetch My Orders -------------------
  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:1230/api/v8/order/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error("My Orders Fetch Error:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    if (activeTab === "orders") fetchOrders();

    // Auto-refresh orders every 10 seconds
    const interval = setInterval(() => {
      if (activeTab === "orders") fetchOrders();
    }, 10000);
    return () => clearInterval(interval);
  }, [activeTab]);

  // ------------------- Helpers -------------------
  const isOpenNow = (c) => {
    if (!c.openingTime || !c.closingTime) return c.isOpen;
    const now = new Date();
    const [openH, openM] = c.openingTime.split(":").map(Number);
    const [closeH, closeM] = c.closingTime.split(":").map(Number);
    const openDate = new Date();
    const closeDate = new Date();
    openDate.setHours(openH, openM, 0);
    closeDate.setHours(closeH, closeM, 0);
    return now >= openDate && now <= closeDate && c.isOpen;
  };

  // ------------------- UI -------------------
  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed p-6 pt-24"
      style={{ backgroundImage: "url('/public/images/background.jpg')" }}>
      
      <h1 className="text-4xl font-extrabold text-orange-950 text-center mb-8 drop-shadow-lg">
        Welcome to Campus Canteens
      </h1>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-10">
        <button
          onClick={() => setActiveTab("browse")}
          className={`px-5 py-2 rounded-xl font-semibold ${
            activeTab === "browse"
              ? "bg-amber-600 text-white shadow-lg"
              : "bg-white/70 text-amber-800"
          }`}
        >
          Browse Canteens
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-5 py-2 rounded-xl font-semibold ${
            activeTab === "orders"
              ? "bg-amber-600 text-white shadow-lg"
              : "bg-white/70 text-amber-800"
          }`}
        >
          My Orders
        </button>
      </div>

      {/* ---------------- Browse Canteens Tab ---------------- */}
      {activeTab === "browse" && (
        <>
          {/* Search Bar */}
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
        </>
      )}

      {/* ---------------- My Orders Tab ---------------- */}
      {activeTab === "orders" && (
        <div className="max-w-3xl mx-auto bg-white/90 rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-amber-800 mb-6">My Orders</h2>

          {orders.length === 0 ? (
            <p className="text-gray-600 text-center py-10">No orders yet.</p>
          ) : (
            orders.map((order) => (
              <div
                key={order._id}
                className="border rounded-xl p-5 mb-4 bg-white shadow-sm hover:shadow-md transition"
              >
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {order.canteen?.name || "Unknown Canteen"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>

                  <span
                    className={`text-sm font-semibold px-3 py-1 rounded-lg ${
                      order.status === "Paid"
                        ? "bg-teal-100 text-teal-800"
                        : order.status === "Preparing"
                        ? "bg-blue-100 text-blue-800"
                        : order.status === "Ready"
                        ? "bg-purple-100 text-purple-800"
                        : order.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : order.status === "Cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="text-sm text-gray-700 border-t pt-2 mb-3">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>
                        {it.name || it.itemId?.name} × {it.quantity}
                      </span>
                      <span>₹{(it.price || it.itemId?.price) * it.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-800">
                    Total: ₹{order.amount}
                  </span>

                  {/* 🚫 Allow cancel only if still Paid */}
                  {order.status === "Paid" && (
                    <button
                      onClick={async () => {
                        const confirmCancel = window.confirm(
                          "⚠️ Are you sure you want to request cancellation for this order?"
                        );
                        if (!confirmCancel) return;

                        await axios.put(
                          `http://localhost:1230/api/v8/order/${order._id}/status`,
                          { status: "Cancelled" },
                          { headers: { Authorization: `Bearer ${token}` } }
                        );

                        setOrders((prev) =>
                          prev.map((o) =>
                            o._id === order._id
                              ? { ...o, status: "Cancelled" }
                              : o
                          )
                        );
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg font-semibold"
                    >
                      Request Cancellation
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