import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { auth } = useContext(AuthContext);

  // If the user is not authenticated or their role is not allowed, redirect to login
  if (!auth.token || !allowedRoles.includes(auth.role)) {
    return <Navigate to="/login" replace />; // Redirect and replace history stack to prevent back navigation
  }

  // If authenticated and role is allowed, render the Outlet (nested route)
  return <Outlet />;
};

export default ProtectedRoute;
