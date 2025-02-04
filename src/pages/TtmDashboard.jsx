import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "../components/common-components/Header";
import Sidebar from "../components/common-components/Sidebar";

import CreateTimetableEntry from "../components/ttm-components/CreateTimetableEntry";
import { AiOutlineCalendar } from "react-icons/ai";

const TtmDashboard = () => {
  const [isCollapsed, setIsCollapsed] = useState(false); // Add state for sidebar collapse

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

  const ttmLinks = [
    {
      to: "/create-timetable-entry",
      icon: AiOutlineCalendar,
      label: "Create Timetable Entry",
    },
  ];

  return (
    <Router>
      <div className="h-screen flex flex-col">
        <Header title="TTM" />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            links={ttmLinks}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />

          <main className="flex-1 p-6 bg-gray-100 overflow-auto">
            <Routes>
              <Route
                path="/"
                element={
                  <h1 className="text-2xl font-bold">
                    Welcome to the Ttm Dashboard
                  </h1>
                }
              />
              <Route
                path="/create-timetable-entry"
                element={<CreateTimetableEntry />}
              />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default TtmDashboard;
