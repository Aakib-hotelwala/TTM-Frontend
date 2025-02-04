import React from "react";

const Header = ({ title }) => {
  return (
    <header className="bg-gray-900 text-white py-4 px-6 flex items-center justify-between shadow-md">
      <div className="flex items-center">
        <img
          src="/src/assets/Image.png"
          alt="Logo"
          className="object-contain w-15 h-15 filter invert"
        />
      </div>

      <div className="flex items-center gap-4">
        <span className="text-lg font-semibold">{title}</span>
        <button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium px-4 py-2 rounded-lg shadow-md transition-all duration-300 ease-in-out cursor-pointer">
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
