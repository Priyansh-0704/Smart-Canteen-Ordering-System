import { useState } from "react";
import axios from "axios";
import { User, Phone, Lock, Store, Clock } from "lucide-react";

export default function RegisterCanteen() {
  const [formData, setFormData] = useState({
    canteenName: "",
    workingHours: "",
    adminName: "",
    adminMobile: "",
    adminPassword: ""
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      await axios.post("http://localhost:1230/api/v2/canteenrequest/request", formData);
      alert("Canteen request submitted, waiting for admin approval.");
    } catch (err) {
      setError(err.response?.data?.message || "Error submitting request");
    }
  };

  const InputField = ({ Icon, name, type, placeholder, value }) => (
    <div className="flex items-center border border-amber-300 rounded-xl px-3 py-2 mb-4 bg-white/70 shadow-sm focus-within:ring-2 focus-within:ring-amber-500 transition">
      <Icon className="text-amber-700 w-5 h-5 mr-2" />
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-500"
      />
    </div>
  );

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center px-4"
      style={{ backgroundImage: "url('/images/background.jpg')" }}
    >

      <div className="w-full max-w-md bg-white/30 backdrop-blur-xl shadow-xl rounded-2xl p-8 border border-amber-200/60">
        <h2 className="text-3xl font-extrabold text-center text-amber-900 mb-6 tracking-wide drop-shadow">
          Register Your Canteen
        </h2>

        <InputField Icon={Store} name="canteenName" type="text" placeholder="Canteen Name" value={formData.canteenName} />
        <InputField Icon={Clock} name="workingHours" type="text" placeholder="Working Hours" value={formData.workingHours} />
        <InputField Icon={User} name="adminName" type="text" placeholder="Admin Name" value={formData.adminName} />
        <InputField Icon={Phone} name="adminMobile" type="text" placeholder="Admin Mobile" value={formData.adminMobile} />
        <InputField Icon={Lock} name="adminPassword" type="password" placeholder="Password" value={formData.adminPassword} />

        {error && (
          <p className="text-red-600 text-sm font-medium mb-3 text-center">
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          className="w-full mt-4 bg-gradient-to-r from-amber-600 to-orange-700 text-white py-3 rounded-xl text-lg font-semibold shadow-lg hover:from-amber-700 hover:to-orange-800 transition-transform transform hover:scale-105"
        >
          Submit Request
        </button>
      </div>
    </div>
  );
}