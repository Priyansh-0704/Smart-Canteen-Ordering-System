import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-amber-600 to-orange-700 text-white px-6 py-4 flex justify-between items-center shadow-md z-50">
      {/* Brand */}
      <h1 className="text-2xl font-extrabold tracking-wide">
        Hostel<span className="text-yellow-300">Eats</span>
      </h1>

      {/* Links */}
      <div className="space-x-6 text-lg font-medium">
        <Link
          to="/"
          className="hover:text-yellow-200 transition-colors"
        >
          Home
        </Link>
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
        <Link
          to="/signout"
          className="hover:text-yellow-200 transition-colors"
        >
          Sign Out
        </Link>
      </div>
    </nav>
  );
}
