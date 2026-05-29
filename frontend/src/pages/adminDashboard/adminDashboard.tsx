import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/SideBar/SideBar";
import NavBar from "../../components/NavBar/NavBar";
import "./AdminDashboard.css";
import StatsCard from "../../components/StatsCard/StatsCard";
import RecentOrders from "../../components/Tables/RecentOrders";
import UsersPage from "../Users/UsersPage";
import OrdersPage from "../Orders/OrdersPage";
import ProductsPage from "../Products/ProductsPage";
import { getAdminDashboardData, type AdminDashboardData } from "../../services/apiService";
import { hasRole } from "../../services/jwtUtils";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const token = localStorage.getItem("token");
  const isAdmin = token ? hasRole(token, "admin") : false;

  useEffect(() => {
    if (!token || !isAdmin) {
      navigate("/login");
    }
  }, [token, isAdmin, navigate]);

  const rawTab = searchParams.get("tab");
  const activeTab = (() => {
    switch (rawTab) {
      case "products":
        return "Products";
      case "orders":
        return "Orders";
      case "users":
        return "Users";
      default:
        return "Dashboard";
    }
  })();

  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchData = useCallback(async (signal: AbortSignal) => {
    if (!token || !isAdmin) {
      if (!signal.aborted) {
        setError("Unauthorized");
        setLoading(false);
      }
      return;
    }
    try {
      const data = await getAdminDashboardData(token, signal);
      if (!signal.aborted) {
        setDashboardData(data as AdminDashboardData);
      }
    } catch (err) {
      if (!signal.aborted) {
        console.error("Dashboard data fetch error:", err);
        setError(
          `Failed to load dashboard data: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, [token, isAdmin]);

  const refreshData = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    if (isMounted) {
      fetchData(controller.signal);
    }

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [fetchData, refreshTrigger]);

  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const stats = useMemo(() => {
    if (!dashboardData) return null;

    const orders = dashboardData.orders || [];
    const totalRevenue = orders.reduce((sum: number, order) => {
      const amount = typeof order.total_amount === 'string'
        ? Number.parseFloat(order.total_amount)
        : Number(order.total_amount ?? 0);
      return sum + amount;
    }, 0);
    return {
      revenue: `₹${String(totalRevenue.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }))}`,
      users: (dashboardData.users || []).length.toString(),
      products: (dashboardData.products || []).length.toString(),
      orders: orders.length.toString(),
    };
  }, [dashboardData]);

  const renderContent = () => {
    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!dashboardData) return null;

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
                   value={stats.revenue}
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
            setSearchParams({});
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
