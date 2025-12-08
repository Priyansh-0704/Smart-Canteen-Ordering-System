import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

export default function CustomerDashboard() {
  const [canteens, setCanteens] = useState([]);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("browse");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

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
  if (!token) return;
  if (activeTab === "orders") fetchOrders();
}, [activeTab, token]);

useEffect(() => {
  if (activeTab !== "orders") return;

  const interval = setInterval(fetchOrders, 10000);
  return () => clearInterval(interval);
}, [activeTab]);


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

  return (
 <div
  className="min-h-screen bg-contain bg-repeat bg-top p-4 sm:p-6 pt-32 lg:pt-40"
  style={{ backgroundImage: "url('/images/background.jpg')" }}
>

    

      {/* TABS */}
      <div className="flex justify-center gap-3 sm:gap-4 mb-8 sm:mb-10">
        <button
          onClick={() => setActiveTab("browse")}
          className={`px-4 sm:px-5 py-2 rounded-xl font-semibold text-sm sm:text-base ${
            activeTab === "browse"
              ? "bg-amber-600 text-white shadow-lg"
              : "bg-white/70 text-amber-800"
          }`}
        >
          Browse Canteens
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 sm:px-5 py-2 rounded-xl font-semibold text-sm sm:text-base ${
            activeTab === "orders"
              ? "bg-amber-600 text-white shadow-lg"
              : "bg-white/70 text-amber-800"
          }`}
        >
          My Orders
        </button>
      </div>

      {/* ------------------------- BROWSE TAB ------------------------- */}
      {activeTab === "browse" && (
        <>
          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-8 sm:mb-10 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-600 w-4 sm:w-5" />
            <input
              type="text"
              placeholder="Search canteens..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 sm:py-3 rounded-2xl shadow-lg border border-amber-400 focus:ring-2 focus:ring-amber-500 outline-none bg-white/80 backdrop-blur-md text-sm sm:text-base"
            />
          </div>

          {/* Canteen Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {canteens.map((c) => (
              <div
                key={c._id}
                onClick={() => isOpenNow(c) && navigate(`/canteen/${c._id}`)}
                className={`relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-105 cursor-pointer ${
                  isOpenNow(c) ? "" : "opacity-60 cursor-not-allowed"
                }`}
              >
                {c.previewImage ? (
                  <img
                    src={c.previewImage}
                    alt={c.name}
                    className="w-full h-48 sm:h-60 md:h-64 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 sm:h-60 md:h-64 bg-gray-400 flex items-center justify-center text-white text-lg">
                    No Image
                  </div>
                )}

                <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-3 sm:p-5 text-white">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold drop-shadow-md">
                    {c.name}
                  </h2>
                  <p className="text-xs sm:text-sm">{c.location}</p>

                  {c.openingTime && c.closingTime && (
                    <p className="text-xs sm:text-sm mt-1">
                      🕒 {c.openingTime} – {c.closingTime}
                    </p>
                  )}

                  <p
                    className={`mt-1 font-semibold text-xs sm:text-sm ${
                      isOpenNow(c) ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {isOpenNow(c) ? "Open" : "Closed"}
                  </p>

                  {/* Crowd Level Badge */}
                  {c.crowdLevel && (
                    <div className="mt-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                          c.crowdLevel === "Low"
                            ? "bg-green-500 text-white"
                            : c.crowdLevel === "Moderate"
                            ? "bg-yellow-500 text-black"
                            : "bg-red-600 text-white"
                        }`}
                      >
                        {c.crowdLevel === "Low" && "🟢 Low Crowd"}
                        {c.crowdLevel === "Moderate" && "🟡 Moderate Crowd"}
                        {c.crowdLevel === "Busy" && "🔴 Busy Crowd"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ------------------------- MY ORDERS TAB ------------------------- */}
      {activeTab === "orders" && (
      <div className="max-w-3xl mx-auto bg-white/90 rounded-2xl shadow-xl p-4 sm:p-6 min-h-[70vh]">

          <h2 className="text-xl sm:text-2xl font-bold text-amber-800 mb-6">
            My Orders
          </h2>

          {orders.length === 0 ? (
            <p className="text-gray-600 text-center py-10 text-sm sm:text-base">
              No orders yet.
            </p>
          ) : (
            orders.map((order) => (
              <div
                key={order._id}
                className="border rounded-xl p-4 sm:p-5 mb-4 bg-white shadow-sm hover:shadow-md transition"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
                  <div>
                    <p className="font-semibold text-gray-800 text-base sm:text-lg">
                      {order.canteen?.name || "Unknown Canteen"}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>

                  <span
                    className={`text-xs sm:text-sm font-semibold px-3 py-1 rounded-lg ${
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

                <div className="text-xs sm:text-sm text-gray-700 border-t pt-2 mb-3">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>
                        {it.name || it.itemId?.name} × {it.quantity}
                      </span>
                      <span>
                        ₹{(it.price || it.itemId?.price) * it.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <span className="font-semibold text-gray-800 text-base sm:text-lg">
                    Total: ₹{order.amount}
                  </span>

                  {/* Cancel Button */}
                  {order.status === "Paid" && (
                    <button
                      onClick={async () => {
                        if (!window.confirm("Cancel this order?")) return;

                        try {
                          const res = await axios.put(
                            `http://localhost:1230/api/v8/order/${order._id}/cancel`,
                            {},
                            { headers: { Authorization: `Bearer ${token}` } }
                          );

                          if (res.data.success) {
                            setOrders((prev) =>
                              prev.map((o) =>
                                o._id === order._id
                                  ? { ...o, status: "Cancelled" }
                                  : o
                              )
                            );
                          }
                        } catch {
                          alert("Cancel failed");
                        }
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm px-4 py-2 rounded-lg font-semibold"
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
