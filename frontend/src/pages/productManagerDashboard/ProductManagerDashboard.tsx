import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/SideBar/SideBar";
import NavBar from "../../components/NavBar/NavBar";
import "./ProductManagerDashboard.css";
import StatsCard from "../../components/StatsCard/StatsCard";
import RecentOrders from "../../components/Tables/RecentOrders";
import ProductsPage from "../Products/ProductsPage";
import { hasAnyRole } from "../../services/jwtUtils";

export default function ProductManagerDashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const token = localStorage.getItem("token");
  const hasAccess = token ? hasAnyRole(token, ["admin", "product_manager"]) : false;

  useEffect(() => {
    if (!token || !hasAccess) {
      navigate("/login");
    }
  }, [token, hasAccess, navigate]);

  const rawTab = searchParams.get("tab");
  let activeTab: string;
  if (rawTab === "products") {
    activeTab = "Products";
  } else {
    activeTab = "Dashboard";
  }

  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderContent = () => {
    if (activeTab === "Products") {
      return <ProductsPage />;
    }
    return (
      <>
        <h2>Welcome Product Manager</h2>

        <div className="stats-grid">
          <StatsCard
            title="Total Products"
            value="1,250"
            percentage="+8% than last month"
          />

          <StatsCard
            title="Low Stock"
            value="45"
            percentage="-3% than last month"
          />

          <StatsCard
            title="New Arrivals"
            value="120"
            percentage="+15% than last month"
          />

          <StatsCard
            title="Out of Stock"
            value="12"
            percentage="-5% than last month"
          />

          <StatsCard
            title="Trending Product"
            value="Acoustic Pro Headphones"
            percentage="+35% views this week"
          />

          <StatsCard
            title="Most Sold Product"
            value="Smart Watch Series 5"
            percentage="420 units sold"
          />

          <StatsCard
            title="Top Sold Category"
            value="Electronics"
            percentage="58% of total sales"
          />
        </div>
        <RecentOrders orders={[]} />
      </>
    );
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

        <main className="dashboard-main">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
