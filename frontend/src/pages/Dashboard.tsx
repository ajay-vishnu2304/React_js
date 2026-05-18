import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

interface UserInfo {
  id: string | number;
  username: string;
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
  dob?: string;
  phone?: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const response = await fetch("http://localhost:3000/auth/dashboard", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Session expired or invalid");
        }

        const data = await response.json();
        setUser(data);
      } catch (err: unknown) {
        console.error("Dashboard fetch error:", err);
        localStorage.removeItem("token");
        navigate("/");
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h2>Dashboard</h2>
        <p>Welcome back, <strong>{user.username}</strong>!</p>
        
        <div className="user-info">
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
