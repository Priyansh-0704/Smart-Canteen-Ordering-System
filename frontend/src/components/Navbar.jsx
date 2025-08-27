import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import RegisterCanteen from "../pages/RegisterCanteen"; 

export default function Navbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [showContactMenu, setShowContactMenu] = useState(false);
  const [showCanteenForm, setShowCanteenForm] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/signout");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-amber-600 to-orange-700 text-white px-6 py-4 flex justify-between items-center shadow-md z-50">
        {/* Brand */}
        <h1 className="text-2xl font-extrabold tracking-wide">
          Hostel<span className="text-yellow-300">Eats</span>
        </h1>

        {/* Links */}
        <div className="space-x-6 text-lg font-medium flex items-center">
          <Link to="/" className="hover:text-yellow-200 transition-colors">
            Home
          </Link>

          {/* Contact Us Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowContactMenu(!showContactMenu)}
              className="hover:text-yellow-200 transition-colors"
            >
              Contact Us ▾
            </button>

            {showContactMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg">
                <button
                  onClick={() => {
                    setShowCanteenForm(true);
                    setShowContactMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Register Your Canteen
                </button>
                <Link
                  to="/concern"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Raise a Concern
                </Link>
              </div>
            )}
          </div>

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
              className="hover:text-yellow-200 transition-colors"
            >
              Sign Out
            </button>
          )}
        </div>
      </nav>

      {/* Modal for Register Canteen */}
      {showCanteenForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 relative">
            <button
              onClick={() => setShowCanteenForm(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl"
            >
              ✕
            </button>
            <RegisterCanteen />
          </div>
        </div>
      )}
    </>
  );
}
