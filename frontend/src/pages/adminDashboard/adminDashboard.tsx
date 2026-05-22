import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar from "../../components/SideBar/SideBar";
import NavBar from "../../components/NavBar/NavBar";
import "./adminDashboard.css";
import StatsCard from "../../components/StatsCard/StatsCard";
import RecentOrders from "../../components/Tables/RecentOrders";
import UsersPage from "../users/UsersPage";
import OrdersPage from "../orders/OrdersPage";
import ProductsPage from "../products/ProductsPage";
import { getAdminDashboardData } from "../../services/apiService";

export interface AdminDashboardData {
  users: any[];
  products: any[];
  orders: any[];
  categories: any[];
  carts: any[];
  coupons: any[];
  payments: any[];
  productCategories: any[];
  reviews: any[];
  productImages: any[];
}

export default function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const rawTab = searchParams.get("tab");
  const activeTab =
    rawTab === "products"
      ? "Products"
      : rawTab === "orders"
      ? "Orders"
      : rawTab === "users"
      ? "Users"
      : "Dashboard";

  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Unauthorized");
      setLoading(false);
      return;
    }
    try {
      const data = await getAdminDashboardData(token);
      console.log("Dashboard API Response:", data);
      setDashboardData(data);
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
      setError(
        `Failed to load dashboard data: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [refreshTrigger]);

  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const calculateStats = () => {
    if (!dashboardData) return null;

    const orders = dashboardData.orders || [];
    const totalRevenue = orders.reduce((sum, order: any) => {
      const amount = parseFloat(order.total_amount) || 0;
      return sum + amount;
    }, 0);
    return {
      revenue: `₹${totalRevenue.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      users: (dashboardData.users || []).length.toString(),
      products: (dashboardData.products || []).length.toString(),
      orders: orders.length.toString(),
    };
  };

  const stats = calculateStats();

  const renderContent = () => {
    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!dashboardData) return null;

    console.log("Dashboard data being rendered:", dashboardData);

    switch (activeTab) {
      case "Users":
        return <UsersPage />;
      case "Orders":
        return <OrdersPage onStatusUpdated={refreshData} />;
      case "Products":
        return <ProductsPage />;

      default:
        return (
          <>
            <h2>Welcome Admin</h2>

            {stats ? (
              <div className="stats-grid">
                <StatsCard
                  title="Total Revenue"
                  value={stats.revenue || "₹0"}
                  percentage="Calculated from total orders"
                />

                <StatsCard
                  title="Users"
                  value={stats.users || "0"}
                  percentage="Total registered users"
                />

                <StatsCard
                  title="Products"
                  value={stats.products || "0"}
                  percentage="Total products in catalog"
                />

                <StatsCard
                  title="Orders"
                  value={stats.orders || "0"}
                  percentage="Total orders placed"
                />
              </div>
            ) : (
              <div className="no-data-message">
                <p>No dashboard data available</p>
              </div>
            )}
            <RecentOrders
              orders={dashboardData.orders || []}
              users={dashboardData.users || []}
            />
          </>
        );
    }
  };

  return (
    <div className="admin-dashboard">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === "Dashboard") {
            setSearchParams({}); // clean URL = main admin dashboard
          } else {
            setSearchParams({ tab: tab.toLowerCase() });
          }
        }}
      />
      <div className="dashboard-nav">
        <NavBar onMenuToggle={handleMenuToggle} />

        <main className="dashboard-main">{renderContent()}</main>
      </div>
    </div>
  );
}
