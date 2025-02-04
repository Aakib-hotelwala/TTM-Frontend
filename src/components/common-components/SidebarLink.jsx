import React from "react";
import { Link } from "react-router-dom";

const SidebarLink = ({ to, icon: Icon, label, isCollapsed }) => {
  return (
    <li className="mb-2 w-full">
      <Link
        to={to}
        className="w-full flex items-center gap-4 p-3 rounded-md hover:bg-gray-800 border border-white transition-all duration-200 ease-in-out group"
      >
        <Icon className="text-lg group-hover:text-blue-500 transition-all duration-200" />

        {!isCollapsed && (
          <span className="text-sm group-hover:text-blue-500 transition-all duration-200">
            {label}
          </span>
        )}
      </Link>
    </li>
  );
};

export default SidebarLink;
