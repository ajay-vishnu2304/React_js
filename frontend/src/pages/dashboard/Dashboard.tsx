import { useState, useEffect } from "react";
import UserNavBar from "../../components/UserNavBar/UserNavBar";
import { getProducts, getProductImagesByProductId } from "../../services/apiService";
import type { Product, ProductImage } from "../../services/apiService";
import "./Dashboard.css";

const placeholderImage = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400";

export default function UserDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productImageMap, setProductImageMap] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealProducts = async () => {
      const token = localStorage.getItem("token") || "";
      try {
        const data = await getProducts(token);
        setProducts(data);

        if (token) {
          try {
            const map: Record<number, string> = {};
            await Promise.all(
              data.map(async (product: Product) => {
                try {
                  const imgs: ProductImage[] = await getProductImagesByProductId(token, product.id);
                  if (imgs.length > 0) {
                    map[product.id] = imgs[0].image_url;
                  }
                } catch {
                  void 0;
                }
              })
            );
            setProductImageMap(map);
            console.log("User Dashboard - Loaded product images map (per product):", map);
          } catch (imgErr) {
            console.error("User Dashboard - Failed to load product images:", imgErr);
            setProductImageMap({});
          }
        }
      } catch (err) {
        console.error("Failed to fetch products from backend:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRealProducts();
  }, []);

  return (
    <div className="user-dashboard-page">
      <UserNavBar />
      <main>
        <section className="featured-section">
          <div className="container">
            <h3 className="section-title">New Arrivals</h3>
            <div className="product-grid">
              {loading ? (
                <div className="product-grid-loading">Loading products...</div>
              ) : products.length > 0 ? (
                products.map((product) => (
                  <div key={product.id} className="product-card">
                    <div className="product-image-container">
                      <img 
                        src={productImageMap[product.id] || placeholderImage} 
                        alt={product.name} 
                        className="product-image" 
                      />
                    </div>
                    <div className="product-info">
                      <h4 className="product-name">{product.name}</h4>
                      <p className="product-price">₹{Number(product.price).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="product-grid-empty">No products available.</div>
              )}
            </div>
          </div>
        </section>
      </main>
      
      <footer className="user-footer">
        <div className="container">
          <p>&copy; 2026 AJVX. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
