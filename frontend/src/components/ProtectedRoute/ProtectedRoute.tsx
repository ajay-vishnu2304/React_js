import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { isValidToken, hasAnyRole, logout } from "../../services/jwtUtils";

interface ProtectedRouteProps {
  readonly children?: React.ReactNode;
  readonly allowedRoles?: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  if (!token || !isValidToken(token)) {
    logout(navigate);
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!hasAnyRole(token, allowedRoles)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
}
