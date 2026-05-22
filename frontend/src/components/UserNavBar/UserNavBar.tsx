import { FaSearch, FaRegUser, FaShoppingBag } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UserNavBar.css";

export default function UserNavBar() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleDropdown = () => setShowDropdown((prev) => !prev);

  return (
    <nav className="user-navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <h1 className="navbar-logo">AJVX.</h1>
        </div>
        
        <ul className="navbar-center">
          <li className="nav-item active">HOME</li>
          <li className="nav-item">MEN</li>
          <li className="nav-item">WOMEN</li>
          <li className="nav-item">ACCESSORIES</li>
          <li className="nav-item">JEWELRY</li>
          <li className="nav-item">ABOUT</li>
          <li className="nav-item">CONTACT</li>
        </ul>
        
        <div className="navbar-right">
          <button className="nav-icon-btn" aria-label="Search">
            <FaSearch />
          </button>
          <div className="nav-icon-btn profile-wrapper" aria-label="Profile" onClick={toggleDropdown}>
            <FaRegUser />
            {showDropdown && (
              <div className="profile-dropdown">
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
          <div className="cart-container">
            <button className="nav-icon-btn" aria-label="Cart">
              <FaShoppingBag />
            </button>
            <span className="cart-badge">2</span>
          </div>
        </div>
      </div>
    </nav>
  );
}