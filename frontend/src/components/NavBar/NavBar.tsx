import { useState } from "react";
import { FaRegBell, FaRegEnvelope, FaBars } from "react-icons/fa";
import "./NavBar.css";

interface NavBarProps {
  readonly onMenuToggle?: () => void;
}

export default function NavBar({ onMenuToggle }: Readonly<NavBarProps>) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    onMenuToggle?.();
  };

  return (
    <header className="navbar">
      <button
        className="mobile-menu-btn"
        onClick={handleMenuToggle}
        aria-label="Toggle menu"
      >
        <FaBars />
      </button>
      <div className="navbar-right">
        <div className="icon-btn">
          <FaRegEnvelope className="icon" />
        </div>
        <div className="icon-btn">
          <FaRegBell className="icon" />
        </div>
        <div className="profile">
          <img src="https://i.pravatar.cc/40" alt="profile" />
          <span>ADMIN</span>
        </div>
      </div>
    </header>
  );
}
