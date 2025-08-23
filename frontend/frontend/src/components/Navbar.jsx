import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">CanteenApp</h1>
      <div className="space-x-4">
        <Link to="/" className="hover:underline">Home</Link>
        <Link to="/register" className="hover:underline">Register</Link>
        <Link to="/signin" className="hover:underline">Sign In</Link>
        <Link to="/signout" className="hover:underline">Sign Out</Link>
      </div>
    </nav>
  );
}