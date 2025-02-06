import { Outlet, useParams } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { FiClock } from "react-icons/fi";

const StudentHomepage = () => {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          links={[
            {
              label: "My Timetable",
              icon: FiClock,
              to: "/my-timetable",
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

export default StudentHomepage;
