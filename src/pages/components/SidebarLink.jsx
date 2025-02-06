import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const SidebarLink = ({ to, icon: Icon, label, isCollapsed }) => {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext); // Get the current role from AuthContext

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

  const handleClick = () => {
    if (to) {
      // Navigate to the dynamically constructed path
      navigate(`${getBasePath()}${to}`, { replace: true }); // Assuming `auth.id` holds the dynamic ID
    } else {
      console.error("Invalid path provided to SidebarLink");
    }
  };

  return (
    <li className="mb-2 w-full">
      <button
        onClick={handleClick}
        className="w-full cursor-pointer flex items-center gap-4 p-3 rounded-md hover:bg-gray-800 border border-white transition-all duration-200 ease-in-out group"
      >
        <Icon className="text-lg group-hover:text-blue-500 transition-all duration-200" />

        {!isCollapsed && (
          <span className="text-sm group-hover:text-blue-500 transition-all duration-200">
            {label}
          </span>
        )}
      </button>
    </li>
  );
};

export default SidebarLink;
