import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import Dashboard from "../pages/dashboard/Dashboard";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import AdminRoute from "../components/AdminRoute/AdminRoute";
import ProductManagerRoute from "../components/ProductManagerRoute/ProductManagerRoute";
import NotFound from "../pages/notfound/NotFound";
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
        </Route>
        
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/users" element={<UsersPage />} />
        </Route>
        
        <Route element={<ProductManagerRoute />}>
          <Route path="/product-manager" element={<ProductManagerDashboard />} />
        </Route>
        
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
