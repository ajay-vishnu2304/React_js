import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const UserLayout = () => {
  return (
    <div className="user-layout">
      <Navbar />
      <main className="user-content">
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;
