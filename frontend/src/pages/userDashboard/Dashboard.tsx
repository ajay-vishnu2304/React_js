import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthenticatedFetch } from "../../hooks/useAuthenticatedFetch";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  brand: string;
  image: string;
  color:string;
  size:string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const {authFetch}=useAuthenticatedFetch()

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
        return;
      }
    } catch {
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
      return;
    }

    authFetch(`/products`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch products");
        return r.json();
      })
      .then(setProducts)
      .catch(() => {});
  }, []);

  return (
    <div>
      <h1>User Dashboard</h1>
      <p>Welcome to your dashboard!</p>

      <h2 style={{ marginTop: "2rem" }}>Products</h2>
      <div className="product-grid">
        {products.map((p) => (
          <div
            className="product-card"
            key={p.id}
            onClick={() => navigate(`/products/${p.id}`)}
            style={{ cursor: "pointer" }}
          >
            {p.image ? (
              <img src={p.image} alt={p.name} />
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
    </div>
  );
};

export default Dashboard;
