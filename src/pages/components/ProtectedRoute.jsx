import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

// Define role-based redirects
const roleBasedRedirects = {
  admin: "/admin-homepage",
  teacher: "/teacher-homepage",
  student: "/student-homepage",
  dean: "/dean-homepage",
  hod: "/hod-homepage",
  ttm: "/ttm-homepage",
};

const ProtectedRoute = ({ allowedRoles }) => {
  const { auth } = useContext(AuthContext);

  if (!auth?.token) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(auth.role)) {
    return <Navigate to={`/${auth.role}-homepage`} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
