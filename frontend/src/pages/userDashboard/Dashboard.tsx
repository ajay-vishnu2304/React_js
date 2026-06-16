import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import { useAuth } from "../../hooks/useAuth";
import { useAuthenticatedFetch } from "../../hooks/useAuthenticatedFetch";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  brand: string;
  image: string;
  color: string;
  size: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const { authFetch } = useAuthenticatedFetch();

  const [products, setProducts] = useState<Product[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const limit = 6;

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
              {p.image ? (
                <img src={p.image} alt={p.name} loading="lazy" />
              ) : (
                <div className="product-placeholder">No Image</div>
              )}
              <h3>{p.name}</h3>
              <p className="product-brand">{p.brand}</p>
              {p.color && <p className="product-info">Color: {p.color}</p>}
              {p.size && <p className="product-info">Size: {p.size}</p>}
              <p className="product-price">${p.price}</p>
            </div>
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default Dashboard;
