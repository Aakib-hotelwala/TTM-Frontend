import { Outlet, useParams } from "react-router-dom"; // Removed unused useNavigate
import {
  AiOutlineUser,
  AiOutlineTeam,
  AiOutlineUserAdd,
  AiOutlineBook,
} from "react-icons/ai";
import { BiTask } from "react-icons/bi";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const AdminHomepage = () => {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          links={[
            {
              label: "Role Management",
              icon: AiOutlineTeam,
              to: "/role-management", // Relative path
            },
            {
              label: "User Management",
              icon: AiOutlineUser,
              to: "/user-management",
            },
            {
              label: "Staff Management",
              icon: AiOutlineUserAdd,
              to: "/staff-management",
            },
            {
              label: "Student Management",
              icon: AiOutlineBook,
              to: "/student-management",
            },
            {
              label: "Role Allocation",
              icon: BiTask,
              to: "/role-allocation",
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

export default AdminHomepage;
