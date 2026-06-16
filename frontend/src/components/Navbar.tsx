import { useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logout } from "../store/slices/authSlice";
import { setCart } from "../store/slices/cartSlice";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";
import { FiShoppingCart } from "react-icons/fi";

const Navbar = ({ isAdmin }: { isAdmin?: boolean }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { authFetch } = useAuthenticatedFetch();
  const { items: cartItems } = useAppSelector((state) => state.cart);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const totalItems = useMemo(
    () => (cartItems ?? []).reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  useEffect(() => {
    if (isAuthenticated) {
      authFetch("/carts/cart")
        .then((res) => res.json())
        .then((data) => dispatch(setCart(data)))
        .catch((err) => {
          if (err.message?.includes("401")) {
            dispatch(logout());
            navigate("/login");
          }
        });
    }
  }, [isAuthenticated, authFetch, dispatch, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
      </div>
      <div className="navbar-right">
        {!isAdmin && (
          <Link to="/cart" className="cart-icon">
            <FiShoppingCart size={22} />
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </Link>
        )}
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
