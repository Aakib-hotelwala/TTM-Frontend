import React, { useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { FaChevronDown } from "react-icons/fa";

const Header = ({ title }) => {
  const { auth, logout, switchRole } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(auth?.role);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null); // Ref for dropdown

  const roleMap = {
    1: "admin",
    2: "dean",
    3: "hod",
    4: "ttm",
    5: "teacher",
    6: "student",
  };

  // Logout function: clears auth context and navigates to login page
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Handles role change: updates selected role, switches role in context, and redirects to the new homepage
  const handleRoleChange = (newRole) => {
    setSelectedRole(newRole);
    switchRole(newRole);
    navigate(`/${newRole}-homepage`);
    setIsOpen(false);
  };

  // Close dropdown if click happens outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <header className="bg-gray-900 text-white py-4 px-6 flex items-center justify-between shadow-md">
      <div className="flex items-center">
        <img
          src="/src/assets/Image.png"
          alt="Logo"
          className="w-16 h-16 object-contain filter invert cursor-pointer"
          onClick={() => navigate(`/${selectedRole}-homepage`)}
        />
      </div>

      <div className="flex items-center gap-4">
        <span className="text-lg font-semibold">Role:</span>

        {auth?.roleIds?.length > 0 && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => auth.roleIds.length > 1 && setIsOpen(!isOpen)}
              className={`bg-gray-800 hover:bg-gray-600 text-white border border-gray-600 rounded-lg px-4 py-2 flex items-center justify-between w-28 shadow-md focus:outline-none cursor-pointer ${
                auth.roleIds.length === 1 ? "cursor-default" : ""
              }`}
            >
              {selectedRole === "ttm" || selectedRole === "hod"
                ? selectedRole.toUpperCase()
                : selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
              {auth.roleIds.length > 1 && (
                <FaChevronDown className="ml-2 text-sm" />
              )}
            </button>
            {isOpen && auth.roleIds.length > 1 && (
              <ul className="absolute top-12 left-0 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-lg overflow-hidden z-50">
                {auth.roleIds.map((roleId) => (
                  <li
                    key={roleId}
                    onClick={() => handleRoleChange(roleMap[roleId])}
                    className="px-4 py-3 text-white hover:bg-blue-600 transition-all cursor-pointer"
                  >
                    {roleMap[roleId] === "ttm" || roleMap[roleId] === "hod"
                      ? roleMap[roleId].toUpperCase()
                      : roleMap[roleId].charAt(0).toUpperCase() +
                        roleMap[roleId].slice(1)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

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
