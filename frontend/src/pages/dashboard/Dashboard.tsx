import { useState, useEffect } from "react";
import UserLayout from "../../components/Layout/UserLayout";
import { getProducts, getProductImages } from "../../services/apiService";
import type { Product } from "../../services/apiService";
import "./Dashboard.css";

const placeholderImage = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400";

export default function UserDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productImageMap, setProductImageMap] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    const loadProductImages = async (t: string): Promise<Record<number, string>> => {
      try {
        const allImages = await getProductImages(t, controller.signal);
        const map: Record<number, string> = {};
        for (const img of allImages) {
          if (!map[img.product_id]) {
            map[img.product_id] = img.image_url;
          }
        }
        return map;
      } catch (imgErr) {
        if (!controller.signal.aborted) {
          console.error("User Dashboard - Failed to load product images:", imgErr);
        }
        return {};
      }
    };

    const fetchRealProducts = async () => {
      const token = localStorage.getItem("token") || "";
      try {
        const data = await getProducts(token, controller.signal);
        if (isMounted) {
          setProducts(data);
        }
        if (token && isMounted) {
          const imageMap = await loadProductImages(token);
          if (isMounted) {
            setProductImageMap(imageMap);
          }
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Failed to fetch products from backend:", err);
          if (isMounted) {
            setProducts([]);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchRealProducts();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  return (
    <UserLayout>
      <div className="user-dashboard-page">
        <section className="featured-section">
          <div className="container">
            <h3 className="section-title">New Arrivals</h3>
            <div className="product-grid">
              {(() => {
                if (loading) {
                  return <div className="product-grid-loading">Loading products...</div>;
                }
                if (products.length > 0) {
                  return products.map((product) => (
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
                  ));
                }
                return <div className="product-grid-empty">No products available.</div>;
              })()}
            </div>
          </div>
        </section>
      </div>
    </UserLayout>
  );
}
