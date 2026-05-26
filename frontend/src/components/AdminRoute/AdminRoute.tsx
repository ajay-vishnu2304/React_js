import { Outlet } from "react-router-dom";
import ProtectedRoute from "../ProtectedRoute/ProtectedRoute";

export default function AdminRoute() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <Outlet />
    </ProtectedRoute>
  );
}
