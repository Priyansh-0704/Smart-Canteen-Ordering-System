import { useState } from "react";
import axios from "axios";

export default function ForgotPassword() {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const requestOtp = async () => {
    try {
      setError("");
      await axios.post("http://localhost:1230/api/v1/auth/forgot-password", { mobile });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Error sending OTP");
    }
  };

  const resetPassword = async () => {
    try {
      setError("");
      const res = await axios.post("http://localhost:1230/api/v1/auth/reset-password", {
        mobile,
        otp,
        newPassword,
      });
      setSuccess(res.data.message);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Error resetting password");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-cover bg-center"
         style={{ backgroundImage: "url('/images/background.jpg')" }}>
      <div className="w-full max-w-md bg-white/30 backdrop-blur-xl p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-amber-900 mb-6">
          Forgot Password
        </h2>

        {step === 1 && (
          <>
            <input
              type="text"
              placeholder="Enter Mobile Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full mb-4 px-4 py-2 border rounded-lg"
            />
            <button
              onClick={requestOtp}
              className="w-full bg-amber-600 text-white py-2 rounded-lg"
            >
              Send OTP
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full mb-4 px-4 py-2 border rounded-lg"
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full mb-4 px-4 py-2 border rounded-lg"
            />
            <button
              onClick={resetPassword}
              className="w-full bg-amber-600 text-white py-2 rounded-lg"
            >
              Reset Password
            </button>
          </>
        )}

        {step === 3 && <p className="text-green-600">{success}</p>}

        {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
      </div>
    </div>
  );
}