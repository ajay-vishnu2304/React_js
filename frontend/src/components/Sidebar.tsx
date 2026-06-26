import { Link } from "react-router-dom";

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ open, onClose }: SidebarProps) => {
  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <h3 className="sidebar-title">Admin Panel</h3>
      <ul className="sidebar-links">
        <li>
          <Link to="/admin/dashboard" onClick={onClose}>Dashboard</Link>
        </li>
        <li>
          <Link to="/admin/users" onClick={onClose}>Users</Link>
        </li>
        <li>
          <Link to="/admin/orders" onClick={onClose}>Orders</Link>
        </li>
        <li>
          <Link to="/admin/products" onClick={onClose}>Products</Link>
        </li>
        <li>
          <Link to="/admin/coupons" onClick={onClose}>Coupons</Link>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
