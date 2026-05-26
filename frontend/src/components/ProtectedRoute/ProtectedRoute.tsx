import { Navigate, Outlet } from "react-router-dom";
import { isValidToken, hasAnyRole } from "../../services/jwtUtils";

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const token = localStorage.getItem("token");

  if (!token || !isValidToken(token)) {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!hasAnyRole(token, allowedRoles)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
}
