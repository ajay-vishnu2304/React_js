import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <h3 className="sidebar-title">Admin Panel</h3>
      <ul className="sidebar-links">
        <li>
          <Link to="/admin/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link to="/admin/users">Users</Link>
        </li>
        <li>
          <Link to="/admin/orders">Orders</Link>
        </li>
        <li>
          <Link to="/admin/products">Products</Link>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
