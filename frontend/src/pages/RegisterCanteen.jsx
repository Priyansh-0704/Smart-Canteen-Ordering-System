import { useState } from "react";
import axios from "axios";

export default function RegisterCanteen() {
  const [formData, setFormData] = useState({
    canteenName: "",
    workingHours: "",
    adminName: "",   
    adminMobile: "",
    adminPassword: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:1230/api/v2/canteenrequest/request", formData);
      alert("Canteen request submitted, waiting for admin approval.");
    } catch (err) {
      alert(err.response?.data?.message || "Error submitting request");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Register Your Canteen</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="canteenName"
            placeholder="Canteen Name"
            value={formData.canteenName}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            name="workingHours"
            placeholder="Working Hours"
            value={formData.workingHours}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            name="adminName"   // ✅ New Field
            placeholder="Admin Name"
            value={formData.adminName}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            name="adminMobile"
            placeholder="Admin Mobile"
            value={formData.adminMobile}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          <input
            type="password"
            name="adminPassword"
            placeholder="Password"
            value={formData.adminPassword}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
}
