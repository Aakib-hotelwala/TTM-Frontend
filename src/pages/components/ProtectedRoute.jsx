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

  // If the user is not authenticated, redirect to login
  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }

  // If the user is authenticated but doesn't have access, redirect to their homepage
  if (!allowedRoles.includes(auth.role)) {
    return <Navigate to={roleBasedRedirects[auth.role] || "/login"} replace />;
  }

  // If authenticated and role is allowed, render the Outlet (nested route)
  return <Outlet />;
};

export default ProtectedRoute;
