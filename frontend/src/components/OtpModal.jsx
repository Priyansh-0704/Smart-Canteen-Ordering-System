import { X } from "lucide-react";

export default function OtpModal({ otp, setOtp, onSubmit }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-indigo-700">Verify OTP</h3>
          <X className="w-6 h-6 text-gray-500 cursor-pointer" onClick={() => window.location.reload()} />
        </div>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          className="w-full px-4 py-3 border rounded-xl text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none mb-4"
        />
        <button
          onClick={onSubmit}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl text-lg font-semibold hover:bg-indigo-700 transition"
        >
          Verify!!
        </button>
      </div>
    </div>
  );
}