import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../services/jwtUtils";
import "./SideBar.css";

interface SidebarProps {
  readonly isOpen?: boolean;
  readonly onClose?: () => void;
  readonly activeTab?: string;
  readonly onTabChange?: (tab: string) => void;
}

export default function Sidebar({
  isOpen = true,
  onClose,
  activeTab,
  onTabChange,
}: Readonly<SidebarProps>) {
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(globalThis.innerWidth <= 1024);
    };
    checkMobile();
    globalThis.addEventListener("resize", checkMobile);
    return () => globalThis.removeEventListener("resize", checkMobile);
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
    logout(navigate);
  };

  return (
    <>
      {isMobile && isOpen && (
          <button
            type="button"
            className="sidebar-overlay"
            onClick={onClose}
            onKeyDown={(e) => e.key === "Escape" && onClose?.()}
            aria-label="Close sidebar overlay"
            aria-hidden={!isMobile}
          />
      )}
      <aside className={`sidebar ${isMobile ? "mobile" : ""}`}>
        <div className="sidebar-header">
          <h2 className="logo">AJVX</h2>
          {isMobile && (
            <button
              className="close-btn"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              ×
            </button>
          )}
        </div>
        <nav>
          <ul className="nav-links">
            <li className={activeTab === "Dashboard" ? "active" : ""}>
              <button
                type="button"
                className="nav-link-btn"
                onClick={() => handleItemClick("/", "Dashboard")}
              >
                Dashboard
              </button>
            </li>
            <li className={activeTab === "Orders" ? "active" : ""}>
              <button
                type="button"
                className="nav-link-btn"
                onClick={() => handleItemClick("/orders", "Orders")}
              >
                Orders
              </button>
            </li>
            <li className={activeTab === "Users" ? "active" : ""}>
              <button
                type="button"
                className="nav-link-btn"
                onClick={() => handleItemClick("/users", "Users")}
              >
                Users
              </button>
            </li>
            <li className={activeTab === "Products" ? "active" : ""}>
              <button
                type="button"
                className="nav-link-btn"
                onClick={() => handleItemClick("/products", "Products")}
              >
                Products
              </button>
            </li>
          </ul>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </aside>
    </>
  );
}
