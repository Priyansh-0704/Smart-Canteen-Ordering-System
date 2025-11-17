import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SignOut() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("mobile");

    const timer = setTimeout(() => {
      navigate("/signin");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className="relative min-h-screen bg-cover bg-center flex items-center justify-center text-center px-4 sm:px-6"
      style={{ backgroundImage: "url('/images/background.jpg')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      {/* Content */}
      <div className="relative z-10 max-w-md sm:max-w-2xl text-white px-2">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 sm:mb-4 drop-shadow-lg">
          You’re Signed Out
        </h1>

        <p className="text-sm sm:text-lg md:text-xl font-light leading-relaxed mb-4 sm:mb-6">
          Thanks for using{" "}
          <span className="text-amber-400 font-semibold">HostelEats</span>.  
          We’ll be waiting when you’re hungry again! 🍴
        </p>

        <p className="text-xs sm:text-sm text-gray-200 italic">
          Redirecting you back to Sign In...
        </p>
      </div>
    </div>
  );
}
