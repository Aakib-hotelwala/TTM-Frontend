import { Outlet, useParams } from "react-router-dom"; // Removed unused useNavigate
import { AiOutlineCalendar } from "react-icons/ai"; // Calendar icon
import { FaUserAlt } from "react-icons/fa"; // User icon
import { FiMapPin } from "react-icons/fi";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const HodHomepage = () => {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          links={[
            {
              label: "View Timetable",
              icon: AiOutlineCalendar,
              to: "/view-timetable",
            },
            {
              label: "View Teacher's Details",
              icon: FaUserAlt,
              to: "/view-teacher-details",
            },
            {
              label: "View Location's Details",
              icon: FiMapPin,
              to: "/view-location-details",
            },
          ]}
        />

        <main className="flex-1 p-6 bg-gray-100 overflow-auto">
          <Outlet /> {/* This will render the nested route content */}
        </main>
      </div>
    </div>
  );
};

export default HodHomepage;
