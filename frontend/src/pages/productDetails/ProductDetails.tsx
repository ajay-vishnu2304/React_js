import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthenticatedFetch } from "../../hooks/useAuthenticatedFetch";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setCart } from "../../store/slices/cartSlice";
import { setWishlist } from "../../store/slices/wishlistSlice";
import { decQty, incQty } from "../../store/slices/quantitySlice";
import "./ProductDetails.css";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  brand: string;
  images?: string[];
  color: string;
  size: string;
  stock_no: number;
}

function buildImageList(product: Product): string[] {
  return product.images?.length ? product.images : [];
}

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authFetch } = useAuthenticatedFetch();
  const dispatch = useAppDispatch();
  const productId = Number(id);
  const quantity = useAppSelector(
    (state) => state.quantities.byProduct[productId] ?? 1,
  );
  const wishlistItems = useAppSelector((state) => state.wishlist.items);

  const wishlistProductIds = new Set(wishlistItems.map((i) => i.productId));

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomOpen, setZoomOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    authFetch(`/products/${id}`)
      .then((res: Response) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data: Product) => {
        setProduct(data);
        setCurrentImageIndex(0);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to fetch product");
        setLoading(false);
      });
  }, [id, authFetch]);

  if (loading) return <div className="product-details">Loading...</div>;
  if (!product) return <div className="product-details">Product not found</div>;

  const imageList = buildImageList(product);
  const shownImage = imageList[currentImageIndex] || "";

  const showPreviousImage = () => {
    if (currentImageIndex === 0) {
      setCurrentImageIndex(imageList.length - 1);
    } else {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const showNextImage = () => {
    if (currentImageIndex === imageList.length - 1) {
      setCurrentImageIndex(0);
    } else {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const closeZoom = () => setZoomOpen(false);

  const reloadCart = () => {
    authFetch("/carts/cart")
      .then((res) => res.json())
      .then((data) => dispatch(setCart(data)));
  };

  const reloadWishlist = () => {
    authFetch("/wishlists/wishlist")
      .then((res) => res.json())
      .then((data) => dispatch(setWishlist(data)));
  };

  const handleAddToCart = async () => {
    if (!product || product.stock_no === 0) return;
    try {
      const cartRes = await authFetch("/carts/cart");
      const cartData = await cartRes.json();
      await authFetch("/cart-items", {
        method: "POST",
        body: JSON.stringify({
          cart_id: cartData.cartId,
          product_id: product.id,
          quantity,
        }),
      });
      reloadCart();
      toast.success("Added to cart!");
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    try {
      const existing = wishlistItems.find((i) => i.productId === product.id);
      if (existing) {
        await authFetch(`/wishlist-items/${existing.id}`, {
          method: "DELETE",
        });
        toast.success("Removed from wishlist");
      } else {
        const wishlistRes = await authFetch("/wishlists/wishlist");
        const wishlistData = await wishlistRes.json();
        await authFetch("/wishlist-items", {
          method: "POST",
          body: JSON.stringify({
            wishlist_id: wishlistData.wishlistId,
            product_id: product.id,
          }),
        });
        toast.success("Added to wishlist!");
      }
      reloadWishlist();
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  return (
    <div className="product-details">
      <button className="btn-back link" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="product-details-layout">
        <div className="product-gallery">
          {shownImage ? (
            <img
              src={shownImage}
              alt={product.name}
              className="product-details-img main-image"
              onClick={() => setZoomOpen(true)}
            />
          ) : (
            <div className="product-placeholder large">No Image</div>
          )}

          {imageList.length > 1 && (
            <div className="product-thumbs">
              {imageList.map((img, index) => {
                const isActive = index === currentImageIndex;
                return (
                  <img
                    key={index}
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    className={`product-thumb ${isActive ? "active" : ""}`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className="product-details-info">
          <div className="product-header">
            <span className="product-brand-tag">{product.brand}</span>
            <h1 className="product-title">{product.name}</h1>
            <div className="product-meta-row">
              <span className="product-price large">${product.price}</span>
            </div>
          </div>

          <div className="product-attrs">
            <div className="attr-row">
              <span className="attr-label">Color</span>
              <span className="attr-value">{product.color || "N/A"}</span>
            </div>
            <div className="attr-row">
              <span className="attr-label">Size</span>
              <span className="attr-value">{product.size || "N/A"}</span>
            </div>
            <div className="attr-row">
              <span className="attr-label">Stock</span>
              <span className="attr-value">{product.stock_no} units</span>
            </div>
          </div>

          <p className="product-description">{product.description}</p>

          <div className="product-actions">
            <div className="qty-control">
              <button
                className="qty-btn"
                onClick={() => dispatch(decQty({ id: product.id }))}
                disabled={quantity <= 1}
              >
                −
              </button>
              <span className="qty-value">{quantity}</span>
              <button
                className="qty-btn"
                onClick={() =>
                  dispatch(incQty({ id: product.id, max: product.stock_no }))
                }
                disabled={quantity >= product.stock_no}
              >
                +
              </button>
            </div>
            <button
              className="btn-add-cart"
              onClick={handleAddToCart}
              disabled={product.stock_no === 0}
            >
              {product.stock_no === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
            <button
              className={`btn-wishlist ${wishlistProductIds.has(product.id) ? "active" : ""}`}
              title="Toggle wishlist"
              onClick={handleToggleWishlist}
            >
              <svg
                viewBox="0 0 24 24"
                width="22"
                height="22"
                aria-hidden="true"
              >
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  fill={wishlistProductIds.has(product.id) ? "#ef4444" : "none"}
                  stroke="#ef4444"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isZoomOpen && (
        <div className="zoom-overlay" onClick={closeZoom}>
          <button className="zoom-close" onClick={closeZoom}>
            ×
          </button>

          {imageList.length > 1 && (
            <>
              <button
                className="zoom-arrow zoom-prev"
                onClick={(e) => {
                  e.stopPropagation();
                  showPreviousImage();
                }}
              >
                ‹
              </button>
              <button
                className="zoom-arrow zoom-next"
                onClick={(e) => {
                  e.stopPropagation();
                  showNextImage();
                }}
              >
                ›
              </button>
            </>
          )}

          <img
            src={shownImage}
            alt={product.name}
            className="zoom-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
