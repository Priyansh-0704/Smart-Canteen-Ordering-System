import { useEffect, useState } from "react";
import axios from "axios";

function AdminDashboard() {
  const [canteens, setCanteens] = useState([]);
  const [newCanteen, setNewCanteen] = useState({ name: "", location: "" });
  const [adminForms, setAdminForms] = useState({});
  const [removeForms, setRemoveForms] = useState({});
  const [updateForms, setUpdateForms] = useState({});
  const token = localStorage.getItem("token");

  // Fetch all canteens
  const fetchCanteens = async () => {
    try {
      const res = await axios.get("http://localhost:1230/api/v3/admin/canteens", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCanteens(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchCanteens();
  }, []);

  // Create Canteen
  const handleCreateCanteen = async () => {
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

  // Update Canteen
  const handleUpdateCanteen = async (canteenId) => {
    try {
      const updateData = updateForms[canteenId];
      const res = await axios.put(
        `http://localhost:1230/api/v3/admin/canteens/${canteenId}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCanteens();
      setUpdateForms({ ...updateForms, [canteenId]: { name: "", location: "", isOpen: true } });
      alert("Canteen updated successfully");
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  // Remove Canteen
  const handleRemoveCanteen = async (canteenId) => {
    if (!window.confirm("Are you sure you want to remove this canteen?")) return;
    try {
      await axios.delete(
        `http://localhost:1230/api/v3/admin/canteens/${canteenId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCanteens();
      alert("Canteen removed successfully");
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  // Add Admin
  const handleAddAdmin = async (canteenId) => {
    try {
      const adminData = adminForms[canteenId];
      if (!adminData?.mobile) return alert("Mobile number required");

      const res = await axios.post(
        `http://localhost:1230/api/v3/admin/canteens/${canteenId}/admins`,
        adminData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCanteens();
      alert("Admin added successfully");
      setAdminForms({ ...adminForms, [canteenId]: { mobile: "", name: "", password: "" } });
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  // Remove Admin
  const handleRemoveAdmin = async (canteenId) => {
    try {
      const removeData = removeForms[canteenId];
      if (!removeData?.mobile) return alert("Mobile number required");

      await axios.delete(
        `http://localhost:1230/api/v3/admin/canteens/${canteenId}/admins/remove`,
        { headers: { Authorization: `Bearer ${token}` }, data: removeData }
      );
      fetchCanteens();
      alert("Admin removed successfully");
      setRemoveForms({ ...removeForms, [canteenId]: { mobile: "" } });
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Panel</h1>

      {/* Create Canteen */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Canteen</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Canteen Name"
            value={newCanteen.name}
            onChange={(e) => setNewCanteen({ ...newCanteen, name: e.target.value })}
            className="border rounded-xl p-3 flex-1"
          />
          <input
            type="text"
            placeholder="Location"
            value={newCanteen.location}
            onChange={(e) => setNewCanteen({ ...newCanteen, location: e.target.value })}
            className="border rounded-xl p-3 flex-1"
          />
          <button
            onClick={handleCreateCanteen}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
          >
            Create
          </button>
        </div>
      </div>

      {/* List of Canteens */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {canteens.map((c) => (
          <div key={c._id} className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{c.name}</h3>
                <p className="text-gray-600">Location: {c.location}</p>
              </div>
              <button
                onClick={() => handleRemoveCanteen(c._id)}
                className="text-red-600 hover:text-red-800 font-bold"
              >
                Remove
              </button>
            </div>

            {/* Update Canteen */}
            <div className="mt-4">
              <input
                type="text"
                placeholder="Name"
                value={updateForms[c._id]?.name || c.name}
                onChange={(e) =>
                  setUpdateForms({
                    ...updateForms,
                    [c._id]: { ...updateForms[c._id], name: e.target.value },
                  })
                }
                className="border p-2 rounded w-full mb-2"
              />
              <input
                type="text"
                placeholder="Location"
                value={updateForms[c._id]?.location || c.location}
                onChange={(e) =>
                  setUpdateForms({
                    ...updateForms,
                    [c._id]: { ...updateForms[c._id], location: e.target.value },
                  })
                }
                className="border p-2 rounded w-full mb-2"
              />
              <button
                onClick={() => handleUpdateCanteen(c._id)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded mb-4"
              >
                Update Canteen
              </button>
            </div>

            {/* Admin Management */}
            <div>
              <h4 className="font-semibold mb-2">Admins</h4>
              <ul className="list-disc ml-5 mb-3 text-gray-700">
                {c.admins && c.admins.length > 0 ? (
                  c.admins.map((a) => <li key={a._id}>{a.name} ({a.mobile})</li>)
                ) : (
                  <li>No admins yet</li>
                )}
              </ul>

              {/* Add Admin */}
              <div className="mb-3">
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
                  className="border p-2 rounded w-full mb-1"
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
                  className="border p-2 rounded w-full mb-1"
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
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full"
                >
                  Add Admin
                </button>
              </div>

              {/* Remove Admin */}
              <div>
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
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded w-full"
                >
                  Remove Admin
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;