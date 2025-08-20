export default function OtpModal({ otp, setOtp, onSubmit }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-80 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Enter OTP</h2>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full p-2 border rounded-lg mb-4"
          placeholder="Enter OTP"
        />
        <button
          onClick={onSubmit}
          className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
        >
          Verify OTP
        </button>
      </div>
    </div>
  );
}