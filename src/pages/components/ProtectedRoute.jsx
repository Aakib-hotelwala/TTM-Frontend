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

// ProtectedRoute component to handle route protection and role-based access
const ProtectedRoute = ({ allowedRoles }) => {
  // Get authentication data from AuthContext
  const { auth } = useContext(AuthContext);

  // If no token is present, redirect to login page
  if (!auth?.token) {
    return <Navigate to="/login" replace />;
  }

  // If user's role is not in allowedRoles, redirect them to their specific homepage or login page
  if (!allowedRoles.includes(auth.role)) {
    return <Navigate to={`/${auth.role}-homepage`} replace />;
  }

  // Render child components (nested routes)
  return <Outlet />;
};

export default ProtectedRoute;
