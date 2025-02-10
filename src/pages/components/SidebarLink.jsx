import { useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const SidebarLink = ({ to, icon: Icon, label, isCollapsed }) => {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext); // Get the current role from AuthContext
  const location = useLocation(); // Access current route

  // Determine the base path based on the user's role
  const getBasePath = () => {
    switch (auth.role) {
      case "admin":
        return "/admin-homepage";
      case "teacher":
        return "/teacher-homepage";
      case "student":
        return "/student-homepage";
      case "dean":
        return "/dean-homepage";
      case "hod":
        return "/hod-homepage";
      case "ttm":
        return "/ttm-homepage";
      default:
        return "/login"; // Fallback if no role matches
    }
  };

  // Check if the current link is active
  const isActive = location.pathname === `${getBasePath()}${to}`;

  const handleClick = () => {
    if (to) {
      // Navigate to the dynamically constructed path
      navigate(`${getBasePath()}${to}`, { replace: true });
    } else {
      console.error("Invalid path provided to SidebarLink");
    }
  };

  return (
    <li className="mb-2 w-full">
      <button
        onClick={handleClick}
        className={`w-full cursor-pointer flex items-center gap-4 p-3 rounded-md transition-all duration-200 ease-in-out group ${
          isActive
            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
            : "hover:bg-gray-800"
        }`}
      >
        <Icon
          className={`text-lg transition-all duration-200 ${
            isActive ? "text-white" : "group-hover:text-blue-500"
          }`}
        />

        {!isCollapsed && (
          <span
            className={`text-sm transition-all duration-200 ${
              isActive ? "text-white" : "group-hover:text-blue-500"
            }`}
          >
            {label}
          </span>
        )}
      </button>
    </li>
  );
};

export default SidebarLink;
