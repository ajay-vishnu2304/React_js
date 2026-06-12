import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthenticatedFetch } from "../../hooks/useAuthenticatedFetch";
import { useAppDispatch } from "../../store/hooks";
import { setCart } from "../../store/slices/cartSlice";
import "./ProductDetails.css";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  brand: string;
  image: string;
  color: string;
  size: string;
  stock_no: number;
}

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authFetch } = useAuthenticatedFetch();
  const dispatch = useAppDispatch();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id) return;

    authFetch(`/products/${id}`)
      .then((res: Response) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data: Product) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to fetch product");
        setLoading(false);
      });
  }, [id, authFetch]);

  if (loading) return <div className="product-details">Loading...</div>;
  if (!product) return <div className="product-details">Product not found</div>;

  const reloadCart = () => {
    authFetch("/carts/cart")
      .then((res) => res.json())
      .then((data) => dispatch(setCart(data)));
  };

  const handleAddToCart = async () => {
    if (!product || product.stock_no === 0) return;
    try {
      const cartRes = await authFetch("/carts/cart");
      const cartData = await cartRes.json();
      await authFetch("/cart-items", {
        method: "POST",
        body: JSON.stringify({ cart_id: cartData.cartId, product_id: product.id, quantity }),
      });
      reloadCart();
      toast.success("Added to cart!");
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  return (
    <div className="product-details">
      <button className="btn-back link" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="product-details-layout">
        <div className="product-gallery">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="product-details-img"
            />
          ) : (
            <div className="product-placeholder large">No Image</div>
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
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                −
              </button>
              <span className="qty-value">{quantity}</span>
              <button
                className="qty-btn"
                onClick={() =>
                  setQuantity((q) => Math.min(product.stock_no, q + 1))
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
          </div>
        </div>
      </div>
    </div>
  );
}
