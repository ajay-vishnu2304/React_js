import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar from "../../components/SideBar/SideBar";
import NavBar from "../../components/NavBar/NavBar";
import "./ProductManagerDashboard.css";
import StatsCard from "../../components/StatsCard/StatsCard";
import RecentOrders from "../../components/Tables/RecentOrders";
import ProductsPage from "../products/ProductsPage";

export default function ProductManagerDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const rawTab = searchParams.get("tab");
  const activeTab =
    rawTab === "products"
      ? "Products"
      : "Dashboard";

  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Products":
        return <ProductsPage />;
      default:
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
            <RecentOrders />
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
            setSearchParams({}); // clean URL = main dashboard view
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