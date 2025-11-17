import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import FormInput from "../components/FormInput";
import OtpModal from "../components/OtpModal";

export default function Register() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      setError("");
      await axios.post("http://localhost:1230/api/v1/auth/register", {
        name,
        mobile,
        password,
      });
      setShowOtp(true);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    }
  };

  const handleVerify = async () => {
    try {
      const res = await axios.post("http://localhost:1230/api/v1/auth/verify-otp", {
        mobile,
        otp,
      });

      localStorage.setItem("token", res.data.token);
      window.dispatchEvent(new Event("storage"));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed.");
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen px-4 sm:px-6 bg-cover bg-center"
      style={{ backgroundImage: "url('/images/background.jpg')" }}
    >
      <div className="w-full max-w-sm sm:max-w-md bg-white/30 backdrop-blur-xl shadow-xl rounded-2xl p-6 sm:p-8 border border-amber-200/60">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-amber-900 mb-6 tracking-wide drop-shadow">
          Create Account
        </h2>

        <FormInput
          label="Full Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon="user"
        />

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

        {error && (
          <p className="text-red-600 text-sm sm:text-base font-medium mb-3 text-center">
            {error}
          </p>
        )}

        <button
          onClick={handleRegister}
          className="w-full mt-6 bg-gradient-to-r from-amber-600 to-orange-700 text-white py-2.5 sm:py-3 rounded-xl text-base sm:text-lg font-semibold shadow-lg hover:from-amber-700 hover:to-orange-800 transition-transform hover:scale-105"
        >
          Request Verification
        </button>

        <p className="mt-5 text-center text-gray-800 text-sm sm:text-base">
          Already have an account?{" "}
          <Link to="/signin" className="text-orange-800 font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>

      {showOtp && <OtpModal otp={otp} setOtp={setOtp} onSubmit={handleVerify} />}
    </div>
  );
}
