import { useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logout } from "../store/slices/authSlice";
import { setCart } from "../store/slices/cartSlice";
import { setWishlist } from "../store/slices/wishlistSlice";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";
import { socket } from "../socket";
import { FiShoppingCart, FiHeart, FiMessageCircle } from "react-icons/fi";

const Navbar = ({ isAdmin }: { isAdmin?: boolean }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { authFetch } = useAuthenticatedFetch();
  const { items: cartItems } = useAppSelector((state) => state.cart);
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const totalItems = useMemo(
    () => (cartItems ?? []).reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );

  const wishlistCount = (wishlistItems ?? []).length;

  useEffect(() => {
    if (isAuthenticated) {
      authFetch("/carts/cart")
        .then((res) => res.json())
        .then((data) => dispatch(setCart(data)))
        .catch((err) => console.error("Failed to fetch cart:", err));
        
      authFetch("/wishlists/wishlist")
        .then((res) => res.json())
        .then((data) => dispatch(setWishlist(data)))
        .catch((err) => console.error("Failed to fetch wishlist:", err));
    }
  }, [isAuthenticated, authFetch, dispatch, navigate]);

  const handleLogout = () => {
    socket.disconnect();
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
        <Link to={isAdmin ? "/admin/support" : "/chat"} className="chat-icon">
          <FiMessageCircle size={22} />
        </Link>
        {!isAdmin && (
          <Link to="/wishlist" className="wishlist-icon">
            <FiHeart size={22} />
            {wishlistCount > 0 && (
              <span className="cart-badge">{wishlistCount}</span>
            )}
          </Link>
        )}
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
