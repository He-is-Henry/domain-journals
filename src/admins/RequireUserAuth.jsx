import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { useEffect } from "react";

const RequireUserAuth = ({ allowedRoles }) => {
  const { user, checked } = useUser();

  const location = useLocation();

  if (!checked) return <p>Loading...</p>;

  if (!user?.name) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default RequireUserAuth;
