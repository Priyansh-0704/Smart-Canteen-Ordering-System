import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:1230/api/v3/admin/requests", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRequests(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:1230/api/v3/admin/approve/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Request approved");
      setRequests(requests.filter(r => r._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Error approving request");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Pending Canteen Requests</h1>
      {requests.map(req => (
        <div key={req._id} className="border p-4 mb-2 rounded-lg shadow">
          <p><b>{req.canteenName}</b> ({req.workingHours})</p>
          <p>Mobile: {req.adminMobile}</p>
          <button
            onClick={() => handleApprove(req._id)}
            className="bg-green-600 text-white px-3 py-1 rounded mt-2"
          >
            Approve
          </button>
        </div>
      ))}
    </div>
  );
}
