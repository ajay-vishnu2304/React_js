import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setCart } from "../../store/slices/cartSlice";
import { logout } from "../../store/slices/authSlice";
import { useAuthenticatedFetch } from "../../hooks/useAuthenticatedFetch";

export default function Cart() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { authFetch } = useAuthenticatedFetch();
  const { items: cartItems } = useAppSelector((state) => state.cart);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

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

  const reloadCart = () => {
    authFetch("/carts/cart")
      .then((res) => res.json())
      .then((data) => dispatch(setCart(data)))
      .catch((err) => {
        if (err.message?.includes("401")) {
          dispatch(logout());
          navigate("/login");
        }
      });
  };

  const handleRemove = async (cartItemId: number) => {
    await authFetch(`/cart-items/${cartItemId}`, { method: "DELETE" });
    reloadCart();
  };

  const handleUpdateQty = async (cartItemId: number, quantity: number) => {
    if (quantity < 1) return;
    await authFetch(`/cart-items/${cartItemId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    });
    reloadCart();
  };

  const total = (cartItems ?? []).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  if ((cartItems ?? []).length === 0) {
    return (
      <div className="cart-empty">
        <h2>Your Cart is Empty</h2>
        <p>Go to products and add something!</p>
        <Link to="/dashboard" className="btn-shop">
          Purchase Products
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Shopping Cart</h1>

      <div className="cart-list">
        {cartItems.map((item) => (
          <div className="cart-row" key={item.id}>
            <div className="cart-img">
              {item.images?.[0] ? (
                <img src={item.images[0]} alt={item.name} />
              ) : (
                <div className="cart-img-placeholder">No Image</div>
              )}
            </div>
            <div className="cart-info">
              <h3>{item.name}</h3>
              <p>${item.price}</p>
            </div>
            <div className="cart-qty">
              <button
                className="qty-btn"
                onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
              >
                -
              </button>
              <span>Qty: {item.quantity}</span>
              <button
                className="qty-btn"
                onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
              >
                +
              </button>
            </div>
            <span className="cart-subtotal">${item.price * item.quantity}</span>
            <button
              className="btn-remove"
              onClick={() => handleRemove(item.id)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="cart-footer">
        <h2>Total: ${total}</h2>
        <button className="btn-checkout" onClick={() => navigate("/checkout")}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
