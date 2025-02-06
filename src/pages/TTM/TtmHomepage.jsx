import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { FaUserAlt } from "react-icons/fa";
import { BsPlusSquare } from "react-icons/bs";
import { IoMdListBox } from "react-icons/io";
import { FiClipboard, FiMapPin } from "react-icons/fi";

const TtmHomepage = () => {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          links={[
            {
              label: "Create Timetable Entry",
              icon: BsPlusSquare,
              to: "/create-timetable-entry", // This ensures the correct path is passed
            },
            {
              label: "Timetable Management",
              icon: IoMdListBox,
              to: "/timetable-management", // This ensures the correct path is passed
            },
            {
              label: "Assign Subject-teacher",
              icon: FiClipboard,
              to: "/assign-subject-teacher", // This ensures the correct path is passed
            },
            {
              label: "View Teacher's Detail",
              icon: FaUserAlt,
              to: "/view-teacher-details", // This ensures the correct path is passed
            },
            {
              label: "View Location's Details",
              icon: FiMapPin,
              to: "/view-location-details",
            },
          ]}
        />

        <main className="flex-1 p-6 bg-gray-100 overflow-auto">
          {/* This will render nested routes */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TtmHomepage;
