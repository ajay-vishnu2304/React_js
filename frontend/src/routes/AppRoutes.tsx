import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/Signup";
import Dashboard from "../pages/Dashboard/Dashboard";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import NotFound from "../pages/NotFound/NotFound";
import AdminDashboard from "../pages/AdminDashboard/AdminDashboard";
import ProductManagerDashboard from "../pages/ProductManagerDashboard/ProductManagerDashboard";
import UsersPage from "../pages/Users/UsersPage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/users" element={<UsersPage />} />
        </Route>
        
        <Route element={<ProtectedRoute allowedRoles={["admin", "product_manager"]} />}>
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
