import { useEffect, useState } from "react";
import Card from "../../components/Card";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    userCount: 0,
    productCount: 0,
    orderCount: 0,
  });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((r) => r.json())
      .then(setStats);
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <div className="stats-row">
        <Card title="Total Users" value={stats.userCount} />
        <Card title="Total Products" value={stats.productCount} />
        <Card title="Total Orders" value={stats.orderCount} />
        <Card title="Total Revenue" value="$0" />
      </div>
    </div>
  );
};

export default AdminDashboard;
