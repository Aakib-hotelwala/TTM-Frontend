import React, { useState, useEffect } from "react";
import { FaBars } from "react-icons/fa"; // Ensure icons are imported
import SidebarLink from "./SidebarLink";

const Sidebar = ({ links, isInitialCollapsed = false }) => {
  const [isCollapsed, setIsCollapsed] = useState(isInitialCollapsed);

  // Handle screen resize to collapse sidebar automatically
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    // Initial check and event listener
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <aside
      className={`${
        isCollapsed ? "w-20" : "w-64"
      } bg-gray-900 text-white h-full py-4 px-2 border-r border-gray-700 transition-all duration-300 relative overflow-y-auto`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-4 left-4 text-white text-2xl focus:outline-none"
      >
        <FaBars />
      </button>

      <ul className="flex flex-col mt-12 overflow-y-auto">
        {/* Iterate through the links and pass them to SidebarLink */}
        {links.map(({ to, icon: Icon, label }, index) => (
          <SidebarLink
            key={index}
            to={to}
            icon={Icon}
            label={label}
            isCollapsed={isCollapsed}
          />
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
