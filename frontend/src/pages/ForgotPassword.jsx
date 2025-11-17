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
    <div
      className="flex items-center justify-center min-h-screen p-4 sm:p-6 bg-cover bg-center"
      style={{ backgroundImage: "url('/images/background.jpg')" }}
    >
      <div className="w-full max-w-sm sm:max-w-md bg-white/40 backdrop-blur-xl p-6 sm:p-8 rounded-xl shadow-lg">
        <h2 className="text-xl sm:text-2xl font-bold text-center text-amber-900 mb-6">
          Forgot Password
        </h2>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <input
              type="text"
              placeholder="Enter Mobile Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full mb-4 px-4 py-2 border rounded-lg text-sm sm:text-base"
            />
            <button
              onClick={requestOtp}
              className="w-full bg-amber-600 text-white py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base"
            >
              Send OTP
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full mb-4 px-4 py-2 border rounded-lg text-sm sm:text-base"
            />

            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full mb-4 px-4 py-2 border rounded-lg text-sm sm:text-base"
            />

            <button
              onClick={resetPassword}
              className="w-full bg-amber-600 text-white py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base"
            >
              Reset Password
            </button>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <p className="text-green-600 text-center text-sm sm:text-base">{success}</p>
        )}

        {error && (
          <p className="text-red-600 text-sm mt-3 text-center">{error}</p>
        )}
      </div>
    </div>
  );
}
