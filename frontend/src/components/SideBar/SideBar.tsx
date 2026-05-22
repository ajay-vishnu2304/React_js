import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function Sidebar({ isOpen = true, onClose, activeTab, onTabChange }: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isMobile && !isOpen) return null;

  const handleItemClick = (path: string, tabName: string) => {
    if (onTabChange) {
      onTabChange(tabName);
    } else {
      navigate(path);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <>
      {isMobile && isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isMobile ? "mobile" : ""}`}>
        <div className="sidebar-header">
          <h2 className="logo">AJVX</h2>
          {isMobile && (
            <button className="close-btn" onClick={onClose} aria-label="Close sidebar">
              ×
            </button>
          )}
        </div>
        <nav>
          <ul className="nav-links">
            <li className={activeTab === "Dashboard" ? "active" : ""} onClick={() => handleItemClick("/", "Dashboard")}>Dashboard</li>
            <li className={activeTab === "Orders" ? "active" : ""} onClick={() => handleItemClick("/orders", "Orders")}>Orders</li>
            <li className={activeTab === "Users" ? "active" : ""} onClick={() => handleItemClick("/users", "Users")}>Users</li>
            <li className={activeTab === "Products" ? "active" : ""} onClick={() => handleItemClick("/products", "Products")}>Products</li>
          </ul>
        </nav>



        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </aside>
    </>
  );
}