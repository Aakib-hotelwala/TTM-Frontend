import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

// Define role-based redirects (based on roleNames from auth)
const roleBasedRedirects = {
  Admin: "/admin-homepage",
  Teacher: "/teacher-homepage",
  Student: "/student-homepage",
  Dean: "/dean-homepage",
  HOD: "/hod-homepage",
  TTM: "/ttm-homepage",
};

// ProtectedRoute component to handle route protection and role-based access
const ProtectedRoute = ({ allowedRoles }) => {
  const { auth } = useContext(AuthContext);

  // Ensure user is authenticated
  if (!auth?.token) {
    return <Navigate to="/login" replace />;
  }

  // Check if user's roles match allowedRoles
  const hasAccess = auth.roleNames?.some((role) => allowedRoles.includes(role));

  // Redirect to role-specific homepage if access is denied
  if (!hasAccess) {
    const defaultRole = auth.roleNames?.[0]; // Get the first available role
    const redirectPath = roleBasedRedirects[defaultRole] || "/login";
    return <Navigate to={redirectPath} replace />;
  }

  // Render child routes if user is authorized
  return <Outlet />;
};

export default ProtectedRoute;
