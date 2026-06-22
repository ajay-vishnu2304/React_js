import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import InfiniteScroll from "react-infinite-scroll-component";
import { useAuth } from "../../hooks/useAuth";
import { useAuthenticatedFetch } from "../../hooks/useAuthenticatedFetch";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setCart } from "../../store/slices/cartSlice";
import { decQty, incQty } from "../../store/slices/quantitySlice";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  brand: string;
  images?: string[];
  stock_no: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isAdmin } = useAuth();
  const { authFetch } = useAuthenticatedFetch();

  const [products, setProducts] = useState<Product[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const quantities = useAppSelector((state) => state.quantities.byProduct);

  const limit = 6;

  const getQty = (id: number) => quantities[id] ?? 1;

  const fetchProducts = async () => {
    try {
      const response = await authFetch(
        `/products?offset=${offset}&limit=${limit}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();

      setProducts((prevProducts) => [...prevProducts, ...data.products]);

      setHasMore(data.haveMore);

      setOffset((prevOffset) => prevOffset + limit);
    } catch (err) {
      console.error(err);
    }
  };

  const reloadCart = () => {
    authFetch("/carts/cart")
      .then((res) => res.json())
      .then((data) => dispatch(setCart(data)));
  };

  const handleAddToCart = async (p: Product) => {
    if (p.stock_no === 0) return;
    try {
      const cartRes = await authFetch("/carts/cart");
      const cartData = await cartRes.json();
      await authFetch("/cart-items", {
        method: "POST",
        body: JSON.stringify({
          cart_id: cartData.cartId,
          product_id: p.id,
          quantity: getQty(p.id),
        }),
      });
      reloadCart();
      toast.success("Added to cart!");
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    if (isAdmin) {
      navigate("/admin/dashboard", { replace: true });
      return;
    }
  }, []);

  return (
    <div>
      <h1>User Dashboard</h1>
      <p>Welcome to your dashboard!</p>

      <h2 style={{ marginTop: "2rem" }}>Products</h2>

      <InfiniteScroll
        dataLength={products.length}
        next={fetchProducts}
        hasMore={hasMore}
        loader={
          <p
            style={{
              textAlign: "center",
              padding: "1.5rem",
              fontWeight: "bold",
            }}
          >
            Loading ...
          </p>
        }
        endMessage={
          <p
            style={{
              textAlign: "center",
              padding: "1rem",
              color: "#888",
              fontWeight: "bold",
            }}
          >
            End reached .
          </p>
        }
      >
        <div className="product-grid">
          {products.map((p) => (
            <div
              className="product-card"
              key={p.id}
              onClick={() => navigate(`/products/${p.id}`)}
              style={{ cursor: "pointer" }}
            >
              {p.images?.[0] ? (
                <img src={p.images[0]} alt={p.name} loading="lazy" />
              ) : (
                <div className="product-placeholder">No Image</div>
              )}
              <h3>{p.name}</h3>
              <p className="product-brand">{p.brand}</p>
              <p className="product-price">${p.price}</p>

              <div className="qty-control">
                <button
                  className="qty-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(decQty({ id: p.id }));
                  }}
                  disabled={getQty(p.id) <= 1}
                >
                  −
                </button>
                <span className="qty-value">{getQty(p.id)}</span>
                <button
                  className="qty-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(incQty({ id: p.id, max: p.stock_no }));
                  }}
                  disabled={getQty(p.id) >= p.stock_no}
                >
                  +
                </button>
              </div>

              <button
                className="btn-add-cart"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(p);
                }}
                disabled={p.stock_no === 0}
              >
                {p.stock_no === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default Dashboard;
