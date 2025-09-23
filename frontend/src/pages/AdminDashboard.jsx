import { useEffect, useState } from "react";
import axios from "axios";

function AdminDashboard() {
  const [canteens, setCanteens] = useState([]);
  const [newCanteen, setNewCanteen] = useState({ name: "", location: "" });

  // Admin form state (per canteen)
  const [adminForms, setAdminForms] = useState({}); // {canteenId: {mobile, name, password}}
  const [removeForms, setRemoveForms] = useState({}); // {canteenId: {mobile}}

  const token = localStorage.getItem("token");

  // Fetch all canteens
  useEffect(() => {
    axios
      .get("http://localhost:1230/api/v3/admin/canteens", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCanteens(res.data))
      .catch((err) => console.error(err));
  }, []);

  // ---------------- CREATE CANTEEN ----------------
  const handleCreate = async () => {
    try {
      const res = await axios.post(
        "http://localhost:1230/api/v3/admin/canteens",
        newCanteen,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCanteens([...canteens, res.data.canteen]);
      setNewCanteen({ name: "", location: "" });
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

const handleAddAdmin = async (canteenId) => {
  try {
    const adminData = adminForms[canteenId];
    if (!adminData || !adminData.mobile) {
      return alert("Please provide at least mobile number");
    }

    const res = await axios.post(
      `http://localhost:1230/api/v3/admin/canteens/${canteenId}/admins`,
      adminData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Admin added successfully");

    // If the added admin is the logged-in user → refresh token
    if (adminData.mobile === localStorage.getItem("mobile")) {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("mobile", res.data.user.mobile);
      localStorage.setItem("name", res.data.user.name);
      window.dispatchEvent(new Event("storage"));
    }

    // Refresh canteens
    const updated = await axios.get("http://localhost:1230/api/v3/admin/canteens", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setCanteens(updated.data);

    setAdminForms({ ...adminForms, [canteenId]: { mobile: "", name: "", password: "" } });
  } catch (err) {
    console.error("Add Admin Error:", err.response?.data || err.message);
  }
};


  const handleRemoveAdmin = async (canteenId) => {
    try {
      const removeData = removeForms[canteenId];
      if (!removeData || !removeData.mobile) {
        return alert("Please provide mobile number to remove");
      }

      await axios.delete(
        `http://localhost:1230/api/v3/admin/canteens/${canteenId}/admins/remove`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { mobile: removeData.mobile },
        }
      );

      alert("Admin removed successfully");

      const updated = await axios.get("http://localhost:1230/api/v3/admin/canteens", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCanteens(updated.data);

      setRemoveForms({ ...removeForms, [canteenId]: { mobile: "" } });
    } catch (err) {
      console.error("Remove Admin Error:", err.response?.data || err.message);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6">Admin Dashboard</h1>

      {/* Create Canteen Form */}
      <div className="bg-white p-6 rounded-2xl shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Canteen</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            placeholder="Canteen Name"
            value={newCanteen.name}
            onChange={(e) =>
              setNewCanteen({ ...newCanteen, name: e.target.value })
            }
            className="border rounded-xl p-3 flex-1"
          />
          <input
            placeholder="Location"
            value={newCanteen.location}
            onChange={(e) =>
              setNewCanteen({ ...newCanteen, location: e.target.value })
            }
            className="border rounded-xl p-3 flex-1"
          />
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-md"
          >
            Create
          </button>
        </div>
      </div>

      {/* List of Canteens */}
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">All Canteens</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {canteens.map((c) => (
          <div
            key={c._id}
            className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition"
          >
            <h3 className="text-lg font-bold text-gray-800">{c.name}</h3>
            <p className="text-gray-600">📍 {c.location}</p>

            {/* Current Admins */}
            <div className="mt-3">
              <p className="font-semibold">Admins:</p>
              <ul className="list-disc ml-5 text-gray-700">
                {c.admins && c.admins.length > 0 ? (
                  c.admins.map((a) => (
                    <li key={a._id}>
                      {a.name} ({a.mobile})
                    </li>
                  ))
                ) : (
                  <li>No admins yet</li>
                )}
              </ul>
            </div>

            {/* Add Admin Form */}
            <div className="mt-4">
              <h4 className="font-semibold">Add Admin</h4>
              <input
                type="text"
                placeholder="Mobile"
                value={adminForms[c._id]?.mobile || ""}
                onChange={(e) =>
                  setAdminForms({
                    ...adminForms,
                    [c._id]: { ...adminForms[c._id], mobile: e.target.value },
                  })
                }
                className="border p-2 rounded w-full mb-2"
              />
              <input
                type="text"
                placeholder="Name (if new)"
                value={adminForms[c._id]?.name || ""}
                onChange={(e) =>
                  setAdminForms({
                    ...adminForms,
                    [c._id]: { ...adminForms[c._id], name: e.target.value },
                  })
                }
                className="border p-2 rounded w-full mb-2"
              />
              <input
                type="password"
                placeholder="Password (if new)"
                value={adminForms[c._id]?.password || ""}
                onChange={(e) =>
                  setAdminForms({
                    ...adminForms,
                    [c._id]: { ...adminForms[c._id], password: e.target.value },
                  })
                }
                className="border p-2 rounded w-full mb-2"
              />
              <button
                onClick={() => handleAddAdmin(c._id)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Add Admin
              </button>
            </div>

            {/* Remove Admin Form */}
            <div className="mt-4">
              <h4 className="font-semibold">Remove Admin</h4>
              <input
                type="text"
                placeholder="Mobile"
                value={removeForms[c._id]?.mobile || ""}
                onChange={(e) =>
                  setRemoveForms({
                    ...removeForms,
                    [c._id]: { mobile: e.target.value },
                  })
                }
                className="border p-2 rounded w-full mb-2"
              />
              <button
                onClick={() => handleRemoveAdmin(c._id)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Remove Admin
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;