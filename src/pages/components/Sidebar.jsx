import React, { useState, useEffect } from "react";
import { FaBars } from "react-icons/fa"; // Ensure icons are imported
import SidebarLink from "./SidebarLink";

// Sidebar component — renders a collapsible sidebar with dynamic links
const Sidebar = ({ links, isInitialCollapsed = false }) => {
  const [isCollapsed, setIsCollapsed] = useState(isInitialCollapsed);

  // Effect hook to automatically collapse sidebar on smaller screens
  useEffect(() => {
    const handleResize = () => {
      // Collapse sidebar if screen width is less than or equal to 768px
      if (window.innerWidth <= 768) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    // Initial screen size check and resize event listener
    handleResize();
    window.addEventListener("resize", handleResize);

    // Cleanup event listener when component unmounts
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    // Sidebar container with dynamic width based on collapse state
    <aside
      className={`${
        isCollapsed ? "w-20" : "w-64"
      } bg-gray-900 text-white h-full py-4 px-2 border-r border-gray-700 transition-all duration-300 relative overflow-y-auto`}
    >
      {/* Toggle button to collapse/expand sidebar */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-4 left-4 text-white text-2xl focus:outline-none"
      >
        <FaBars />
      </button>

      {/* Sidebar links list */}
      <ul className="flex flex-col mt-12 overflow-y-auto">
        {/* Map through the links array to render SidebarLink components */}
        {links.map(({ to, icon: Icon, label }, index) => (
          <SidebarLink
            key={index} // Ensure each child has a unique key
            to={to} // Path to navigate
            icon={Icon} // Icon component to display
            label={label} // Text label for the link
            isCollapsed={isCollapsed} // Pass collapse state for styling
          />
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
