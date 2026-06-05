import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
  const token = localStorage.getItem("token");
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

function AdminRoute() {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;

  let payload;
  try {
    payload = JSON.parse(atob(token.split(".")[1]));
  } catch {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  return payload.role === "admin" ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
export { AdminRoute };