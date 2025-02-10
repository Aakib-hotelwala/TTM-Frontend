import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Header = ({ title }) => {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleLogoClick = () => {
    if (auth.token) {
      // Redirect user to their respective dashboard
      switch (auth.role) {
        case "admin":
          navigate("/admin-homepage");
          break;
        case "teacher":
          navigate("/teacher-homepage");
          break;
        case "student":
          navigate("/student-homepage");
          break;
        case "dean":
          navigate("/dean-homepage");
          break;
        case "hod":
          navigate("/hod-homepage");
          break;
        case "ttm":
          navigate("/ttm-homepage");
          break;
        default:
          navigate("/login"); // If role is unknown, send to login
      }
    } else {
      navigate("/login"); // If not authenticated, go to login
    }
  };

  return (
    <header className="bg-gray-900 text-white py-4 px-6 flex items-center justify-between shadow-md">
      <div className="flex items-center">
        <img
          src="/src/assets/Image.png"
          alt="Logo"
          className="object-contain w-15 h-15 filter invert cursor-pointer"
          onClick={handleLogoClick} // Redirect based on role
        />
      </div>

      <div className="flex items-center gap-4">
        <span className="text-lg font-semibold">{title}</span>
        <button
          onClick={handleLogout}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium px-4 py-2 rounded-lg shadow-md transition-all duration-300 ease-in-out cursor-pointer"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
