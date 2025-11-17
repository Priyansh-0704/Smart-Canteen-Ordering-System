import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
      setRole(localStorage.getItem("role"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () =>
      window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    setRole(null);
    navigate("/signout");
  };

  return (
    <nav
      className="
        fixed top-0 left-0 w-full 
        bg-gradient-to-r from-amber-600 to-orange-700 text-white 
        px-4 py-3 sm:px-6 sm:py-4 
        flex justify-between items-center 
        shadow-md z-50
      "
    >
      <h1
        className="
          text-xl sm:text-2xl font-extrabold tracking-wide 
          cursor-pointer
        "
        onClick={() => navigate("/")}
      >
        Hostel<span className="text-yellow-300">Eats</span>
      </h1>

      <div
        className="
          flex items-center 
          space-x-3 sm:space-x-6 
          text-sm sm:text-lg font-medium
        "
      >
        <Link to="/" className="hover:text-yellow-200 transition-colors">
          Home
        </Link>

        {isLoggedIn && role === "Admin" && (
          <Link
            to="/admin-dashboard"
            className="hover:text-yellow-200 transition-colors"
          >
            Admin Dashboard
          </Link>
        )}

        {isLoggedIn && role === "CanteenAdmin" && (
          <>
            <Link
              to="/canteen-dashboard"
              className="hover:text-yellow-200 transition-colors"
            >
              Canteen Dashboard
            </Link>
            <Link
              to="/customer-dashboard"
              className="hover:text-yellow-200 transition-colors"
            >
              Customer Dashboard
            </Link>
          </>
        )}

        {isLoggedIn && role === "User" && (
          <Link
            to="/customer-dashboard"
            className="hover:text-yellow-200 transition-colors"
          >
            Customer Dashboard
          </Link>
        )}

        {!isLoggedIn ? (
          <>
            <Link
              to="/register"
              className="hover:text-yellow-200 transition-colors"
            >
              Register
            </Link>
            <Link
              to="/signin"
              className="hover:text-yellow-200 transition-colors"
            >
              Sign In
            </Link>
          </>
        ) : (
          <button
            onClick={handleLogout}
            className="hover:text-yellow-200 transition-colors text-sm sm:text-lg"
          >
            Sign Out
          </button>
        )}
      </div>
    </nav>
  );
}
