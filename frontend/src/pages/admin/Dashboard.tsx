import { useEffect, useState } from "react";
import Card from "../../components/Card";
import { useAuthenticatedFetch } from "../../hooks/useAuthenticatedFetch";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    userCount: 0,
    productCount: 0,
    orderCount: 0,
    totalRevenue: 0,
  });
  const {authFetch} = useAuthenticatedFetch()

  useEffect(() => {
    authFetch("/admin/dashboard")
      .then((r) => r.json())
      .then((data) => {
        setStats({
          userCount: data.users?.length ?? 0,
          productCount: data.products?.length ?? 0,
          orderCount: data.orders?.length ?? 0,
          totalRevenue: data.totalRevenue ?? 0,
        });
      });
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <div className="stats-row">
        <Card title="Total Users" value={stats.userCount} />
        <Card title="Total Products" value={stats.productCount} />
        <Card title="Total Orders" value={stats.orderCount} />
        <Card title="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} />
      </div>
    </div>
  );
};

export default AdminDashboard;
