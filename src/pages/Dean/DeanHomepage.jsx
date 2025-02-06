import { Outlet, useParams } from "react-router-dom"; // Removed unused useNavigate
import { AiOutlineCalendar } from "react-icons/ai";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const DeanHomepage = () => {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          links={[
            {
              label: "View Timetable",
              icon: AiOutlineCalendar,
              to: "/view-timetable", // Relative path
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

export default DeanHomepage;
