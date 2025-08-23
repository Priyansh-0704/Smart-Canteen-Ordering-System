import { useState } from "react";
import axios from "axios";
import FormInput from "../components/FormInput";
import OtpModal from "../components/OtpModal";
import { useNavigate } from "react-router-dom"; // 👈 add useNavigate

export default function SignIn() {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const navigate = useNavigate(); // 👈 initialize

  const handleLogin = async () => {
    try {
      await axios.post("http://localhost:1230/api/v1/auth/login", { mobile });
      setShowOtp(true);
    } catch (err) {
      console.error(err.response?.data);
    }
  };

  const handleVerify = async () => {
    try {
      const res = await axios.post("http://localhost:1230/api/v1/auth/verify-otp", { mobile, otp });
      localStorage.setItem("token", res.data.token);
      alert("Login Successful!");
      setShowOtp(false);
      navigate("/"); // 👈 redirect to home after success
    } catch (err) {
      console.error(err.response?.data);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Sign In</h2>
      <FormInput label="Mobile" type="text" value={mobile} onChange={(e) => setMobile(e.target.value)} />
      <button
        onClick={handleLogin}
        className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
      >
        Send OTP
      </button>

      {showOtp && <OtpModal otp={otp} setOtp={setOtp} onSubmit={handleVerify} />}
    </div>
  );
}