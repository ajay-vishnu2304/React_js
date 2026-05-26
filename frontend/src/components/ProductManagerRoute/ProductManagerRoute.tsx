import { Outlet } from "react-router-dom";
import ProtectedRoute from "../ProtectedRoute/ProtectedRoute";

export default function ProductManagerRoute() {
  return (
    <ProtectedRoute allowedRoles={["admin", "product_manager"]}>
      <Outlet />
    </ProtectedRoute>
  );
}
