import { User, Phone, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function FormInput({ label, type, value, onChange, icon }) {
  const [show, setShow] = useState(false);
  const Icon = icon === "user" ? User : icon === "phone" ? Phone : Lock;

  return (
    <div className="mb-4 sm:mb-5">
      <label className="block text-sm sm:text-base font-semibold text-amber-900 mb-2 tracking-wide drop-shadow-sm">
        {label}
      </label>

      <div className="flex items-center border border-amber-300/60 rounded-xl px-3 py-2 sm:px-4 sm:py-3 shadow-sm bg-white/40 backdrop-blur-md focus-within:ring-2 focus-within:ring-amber-500 transition">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700 mr-2" />

        <input
          type={type === "password" && show ? "text" : type}
          value={value}
          onChange={onChange}
          placeholder={`Enter ${label}`}
          className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500 text-sm sm:text-base"
        />

        {type === "password" && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="ml-2 text-amber-700 hover:text-orange-800 transition"
          >
            {show ? (
              <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
