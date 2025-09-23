import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SignOut() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("token");

    const timer = setTimeout(() => {
      navigate("/signin");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className="relative min-h-screen bg-cover bg-center flex items-center justify-center text-center px-6"
      style={{ backgroundImage: "url('/images/background.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div className="relative z-10 max-w-2xl text-white">
        <h1 className="text-5xl font-extrabold mb-4 drop-shadow-lg">
          You’re Signed Out
        </h1>
        <p className="text-lg md:text-xl font-light leading-relaxed mb-6">
          Thanks for using <span className="text-amber-400 font-semibold">HostelEats</span>.  
          We’ll be waiting when you’re hungry again! 🍴
        </p>
        <p className="text-sm text-gray-200 italic">
          Redirecting you back to Sign In...
        </p>
      </div>
    </div>
  );
}