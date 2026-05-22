import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import Dashboard from "../pages/dashboard/Dashboard";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import NotFound from "../pages/NotFound";
import AdminDashboard from "../pages/adminDashboard/adminDashboard";
import ProductManagerDashboard from "../pages/productManagerDashboard/ProductManagerDashboard";
import UsersPage from "../pages/users/UsersPage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/product-manager" element={<ProductManagerDashboard />} />
          <Route path="/users" element={<UsersPage />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
