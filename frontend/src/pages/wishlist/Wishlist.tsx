import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setWishlist } from "../../store/slices/wishlistSlice";
import { useAuthenticatedFetch } from "../../hooks/useAuthenticatedFetch";
import "./Wishlist.css";

export default function Wishlist() {
  const dispatch = useAppDispatch();
  const { authFetch } = useAuthenticatedFetch();
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);

  useEffect(() => {
    authFetch("/wishlists/wishlist")
      .then((res) => res.json())
      .then((data) => dispatch(setWishlist(data)))
      .catch((err) => console.error("Failed to fetch wishlist:", err));
  }, []);

  const handleRemove = async (wishlistItemId: number) => {
    await authFetch(`/wishlist-items/${wishlistItemId}`, { method: "DELETE" });
    authFetch("/wishlists/wishlist")
      .then((res) => res.json())
      .then((data) => dispatch(setWishlist(data)));
  };

  if ((wishlistItems ?? []).length === 0) {
    return (
      <div className="wishlist-empty">
        <h2>Your Wishlist is Empty</h2>
        <p>Browse products and add items you love!</p>
        <Link to="/dashboard" className="btn-shop">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <h1>My Wishlist</h1>
      <div className="wishlist-grid">
        {wishlistItems.map((item) => (
          <div className="wishlist-card" key={item.id}>
            <Link to={`/products/${item.productId}`} className="wishlist-card-link">
              <div className="wishlist-img">
                {item.images?.[0] ? (
                  <img src={item.images[0]} alt={item.name} />
                ) : (
                  <div className="wishlist-img-placeholder">No Image</div>
                )}
              </div>
              <div className="wishlist-info">
                <h3>{item.name || "Product"}</h3>
                <p>${item.price ?? 0}</p>
              </div>
            </Link>
            <button
              className="btn-remove"
              onClick={() => handleRemove(item.id)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
