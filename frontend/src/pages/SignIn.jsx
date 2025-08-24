import { useState } from "react";
import axios from "axios";
import FormInput from "../components/FormInput";
import { useNavigate, Link } from "react-router-dom";

export default function SignIn() {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); 
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setError(""); 
      const res = await axios.post("http://localhost:1230/api/v1/auth/login", { mobile, password });
      localStorage.setItem("token", res.data.token);

      // Trigger Navbar update
      window.dispatchEvent(new Event("storage"));

      navigate("/");
    } catch (err) {
      console.error(err.response?.data);
      setError(err.response?.data?.message || "Login failed. Try again."); 
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center px-4"
      style={{ backgroundImage: "url('/images/background.jpg')" }} // 👈 same as Register page
    >
      <div className="w-full max-w-md bg-white/30 backdrop-blur-xl shadow-xl rounded-2xl p-8 border border-amber-200/60">
        <h2 className="text-3xl font-extrabold text-center text-amber-900 mb-6">Welcome Back</h2>

        <FormInput
          label="Mobile Number"
          type="text"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          icon="phone"
        />
        <FormInput
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon="lock"
        />

        {/* Error message */}
        {error && (
          <p className="text-red-600 text-sm font-medium mb-3 text-center">
            {error}
          </p>
        )}

        <button
          onClick={handleLogin}
          className="w-full mt-2 bg-gradient-to-r from-amber-600 to-orange-700 text-white py-3 rounded-xl text-lg font-semibold shadow-lg hover:from-amber-700 hover:to-orange-800 transition-transform transform hover:scale-105"
        >
          Sign In
        </button>

        <p className="mt-6 text-center text-gray-800">
          New here?{" "}
          <Link to="/register" className="text-orange-800 font-semibold hover:underline">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}