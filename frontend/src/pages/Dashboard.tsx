import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

interface DecodedToken {
  id: string | number;
  username: string;
  email: string;
  role: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<DecodedToken | null>(null);

 
  const parseJwt = (token: string): DecodedToken | null => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(window.atob(base64));
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    const decoded = parseJwt(token);
    if (!decoded) {
      localStorage.removeItem("token");
      navigate("/");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(decoded);
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
