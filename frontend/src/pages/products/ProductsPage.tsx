import { useState, useEffect, useCallback } from "react";
import type { Product, ProductImage } from "../../services/apiService";
import {
  getProducts,
  createProduct,
  updateProduct,
  updateProductStock,
  deleteProduct,
  getProductImagesByProductId,
  addProductImage,
  deleteAllProductImages,
} from "../../services/apiService";
import StatsCard from "../../components/StatsCard/StatsCard";
import "./ProductsPage.css";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");

  const [editingStockId, setEditingStockId] = useState<number | null>(null);
  const [tempStockValue, setTempStockValue] = useState<number>(0);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [productImageMap, setProductImageMap] = useState<Record<number, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock_no: "",
    brand: "",
    color: "",
    size: "",
    image_url: "",
  });

  const token = localStorage.getItem("token") || "";

  const fetchProductsList = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProducts(token);
      setProducts(data);

      // Load images for preview in the table (using per-product endpoint for reliability)
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
              /* ignore image fetch error for this product */
            }
          })
        );
        setProductImageMap(map);
        console.log("Admin - Loaded product images map (per product):", map);
      } catch (imgErr) {
        console.error("Admin - Failed to load product images:", imgErr);
        setProductImageMap({});
      }

      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProductsList();
  }, [fetchProductsList]);

  const handleOpenAddModal = () => {
    setModalMode("add");
    setSelectedProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      stock_no: "",
      brand: "",
      color: "",
      size: "",
      image_url: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = async (product: Product) => {
    setModalMode("edit");
    setSelectedProduct(product);

    // Set basic fields first (so modal opens quickly)
    const baseForm = {
      name: product.name,
      description: product.description || "",
      price: String(product.price),
      stock_no: String(product.stock_no),
      brand: product.brand || "",
      color: product.color || "",
      size: product.size || "",
      image_url: "",
    };
    setFormData(baseForm);

    // Now try to load the existing image (this was the missing part)
    try {
      const images = await getProductImagesByProductId(token, product.id);
      console.log("Edit modal - raw response from getProductImagesByProductId:", images);

      let imageUrl = "";

      if (Array.isArray(images) && images.length > 0) {
        const first = images[0];
        // handle common possible field names from backend
        imageUrl = first.image_url || first.url || first.path || first.src || "";
      } else if (images && typeof images === "object") {
        // in case backend returns a single object instead of array
        const obj = images as any;
        imageUrl = obj.image_url || obj.url || obj.path || obj.src || "";
      }

      if (imageUrl) {
        setFormData(prev => ({ ...prev, image_url: imageUrl }));
        console.log("Edit modal - existing image URL loaded:", imageUrl);
      } else {
        console.log("Edit modal - no image found for this product");
      }
    } catch (err) {
      console.error("Edit modal - error while loading existing image:", err);
    }

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Product Name is required.");
      return;
    }
    const priceNum = parseFloat(formData.price);
    const stockNum = parseInt(formData.stock_no, 10);

    if (isNaN(priceNum) || priceNum < 0) {
      alert("Please enter a valid non-negative price.");
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      alert("Please enter a valid non-negative stock quantity.");
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description || undefined,
      price: priceNum,
      stock_no: stockNum,
      brand: formData.brand || undefined,
      color: formData.color || undefined,
      size: formData.size || undefined,
    };

    try {
      if (modalMode === "add") {
        const created: any = await createProduct(token, payload);
        const newProductId = created?.id ?? created?.data?.id ?? null;

        alert("Product added successfully!");

        if (formData.image_url && newProductId) {
          try {
            await addProductImage(token, newProductId, formData.image_url);
          } catch (imgErr) {
            console.warn("Failed to attach image after create:", imgErr);
          }
        }
      } else if (modalMode === "edit" && selectedProduct) {
        await updateProduct(token, selectedProduct.id, payload);

        // Replace image (single image per product)
        try {
          await deleteAllProductImages(token, selectedProduct.id);
          if (formData.image_url) {
            await addProductImage(token, selectedProduct.id, formData.image_url);
          }
        } catch (imgErr) {
          console.warn("Failed to update image:", imgErr);
        }

        alert("Product updated successfully!");
      }

      setIsModalOpen(false);
      fetchProductsList();
    } catch (err: any) {
      alert(err.message || "Failed to save product.");
    }
  };

  const handleDeleteClick = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteProduct(token, id);
        alert("Product deleted successfully!");
        fetchProductsList();
      } catch (err: any) {
        alert(err.message || "Failed to delete product.");
      }
    }
  };

  const handleStartStockEdit = (product: Product) => {
    setEditingStockId(product.id);
    setTempStockValue(product.stock_no);
  };

  const handleSaveStockEdit = async (id: number) => {
    if (tempStockValue < 0 || isNaN(tempStockValue)) {
      alert("Stock cannot be negative.");
      return;
    }
    try {
      await updateProductStock(token, id, tempStockValue);
      setEditingStockId(null);
      fetchProductsList();
    } catch (err: any) {
      alert(err.message || "Failed to update stock.");
    }
  };

  const uniqueBrands = Array.from(
    new Set(
      products
        .map((p) => p.brand?.trim())
        .filter((brand): brand is string => !!brand)
    )
  );

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.brand || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBrand =
      selectedBrand === "all" ||
      (product.brand && product.brand.trim() === selectedBrand);

    let matchesStock = true;
    if (stockFilter === "inStock") {
      matchesStock = product.stock_no > 10;
    } else if (stockFilter === "lowStock") {
      matchesStock = product.stock_no > 0 && product.stock_no <= 10;
    } else if (stockFilter === "outOfStock") {
      matchesStock = product.stock_no === 0;
    }

    return matchesSearch && matchesBrand && matchesStock;
  });

  const statsTotalProducts = products.length;
  const statsTotalValue = products.reduce((acc, p) => acc + Number(p.price) * p.stock_no, 0);
  const statsLowStock = products.filter((p) => p.stock_no > 0 && p.stock_no <= 10).length;
  const statsOutOfStock = products.filter((p) => p.stock_no === 0).length;

  const getStockStatusClass = (stock: number) => {
    if (stock === 0) return "stock-out";
    if (stock <= 10) return "stock-low";
    return "stock-in";
  };

  const getStockStatusText = (stock: number) => {
    if (stock === 0) return "Out of Stock";
    if (stock <= 10) return "Low Stock";
    return "In Stock";
  };

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Products Management</h1>
        <button className="add-product-btn" onClick={handleOpenAddModal}>
          + Add Product
        </button>
      </div>

      <div className="stats-grid">
        <StatsCard
          title="Total Products"
          value={String(statsTotalProducts)}
          percentage="Active catalog size"
        />
        <StatsCard
          title="Total Valuation"
          value={`₹${statsTotalValue.toLocaleString()}`}
          percentage="Full inventory value"
        />
        <StatsCard
          title="Low Stock Alert"
          value={String(statsLowStock)}
          percentage="Stock level <= 10"
        />
        <StatsCard
          title="Out of Stock"
          value={String(statsOutOfStock)}
          percentage="Stock level is 0"
        />
      </div>

      <div className="controls-panel">
        <div className="controls-row">
          <div className="control-group search-group">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="control-group">
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              <option value="all">All Brands</option>
              {uniqueBrands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
            >
              <option value="all">All Stock</option>
              <option value="inStock">In Stock</option>
              <option value="lowStock">Low Stock</option>
              <option value="outOfStock">Out of Stock</option>
            </select>
          </div>

          <button
            className="clear-filters-btn"
            onClick={() => {
              setSearchQuery("");
              setSelectedBrand("all");
              setStockFilter("all");
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="table-responsive">
        {loading ? (
          <div className="table-message">Loading products...</div>
        ) : error ? (
          <div className="table-message error">{error}</div>
        ) : filteredProducts.length > 0 ? (
          <table className="products-table">
            <thead>
               <tr>
                 <th>ID</th>
                 <th>Image</th>
                 <th>Product Name</th>
                 <th>Brand</th>
                 <th>Price</th>
                 <th>Size</th>
                 <th>Color</th>
                 <th>Stock Quantity</th>
                 <th>Status</th>
                 <th>Actions</th>
               </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                 <tr key={product.id}>
                   <td>#{product.id}</td>
                   <td style={{ textAlign: "center" }}>
                     {productImageMap[product.id] ? (
                       <img
                         src={productImageMap[product.id]}
                         alt={product.name}
                         style={{
                           width: 48,
                           height: 48,
                           objectFit: "cover",
                           borderRadius: 4,
                           border: "1px solid #eee",
                         }}
                       />
                     ) : (
                       <span style={{ color: "#999", fontSize: "12px" }}>—</span>
                     )}
                   </td>
                   <td className="product-name-cell">
                    <strong>{product.name}</strong>
                    {product.description && (
                      <span className="product-desc">{product.description}</span>
                    )}
                  </td>
                  <td>{product.brand || "—"}</td>
                  <td className="price-cell">₹{Number(product.price).toFixed(2)}</td>
                  <td>{product.size || "—"}</td>
                  <td>{product.color || "—"}</td>

                   <td className="stock-cell">
                    {editingStockId === product.id ? (
                      <div className="inline-stock-editor">
                        <input
                          type="number"
                          value={tempStockValue}
                          onChange={(e) =>
                            setTempStockValue(parseInt(e.target.value, 10) || 0)
                          }
                          min="0"
                        />
                        <button
                          className="stock-save-btn"
                          onClick={() => handleSaveStockEdit(product.id)}
                        >
                          ✓
                        </button>
                        <button
                          className="stock-cancel-btn"
                          onClick={() => setEditingStockId(null)}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="stock-view">
                        <span className="stock-qty">{product.stock_no}</span>
                        <button
                          className="quick-stock-edit-btn"
                          title="Quick update stock"
                          onClick={() => handleStartStockEdit(product)}
                        >
                          ✎
                        </button>
                      </div>
                    )}
                  </td>

                  <td>
                    <span
                      className={`status-badge ${getStockStatusClass(
                        product.stock_no
                      )}`}
                    >
                      {getStockStatusText(product.stock_no)}
                    </span>
                   </td>

                   <td className="actions-cell">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleOpenEditModal(product)}
                    >
                      Edit
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() =>
                        handleDeleteClick(product.id, product.name)
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="table-message empty">
            No products match the selected filters.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalMode === "add" ? "Add New Product" : "Edit Product"}</h2>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="name">Product Name *</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Wireless Headphones"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="High-quality bluetooth headphones with active noise cancellation."
                    rows={3}
                  />
                 </div>

                 <div className="form-group full-width">
                   <label htmlFor="image_url">Image URL (paste link - single image)</label>
                   <input
                     type="text"
                     id="image_url"
                     value={formData.image_url}
                     onChange={(e) =>
                       setFormData({ ...formData, image_url: e.target.value })
                     }
                     placeholder="https://example.com/your-product-image.jpg"
                   />
                   {formData.image_url && (
                     <div style={{ marginTop: "8px" }}>
                       <img
                         src={formData.image_url}
                         alt="Preview"
                         style={{
                           maxWidth: "120px",
                           maxHeight: "120px",
                           objectFit: "cover",
                           borderRadius: "4px",
                           border: "1px solid #ddd",
                         }}
                         onError={(e) => {
                           (e.currentTarget as HTMLImageElement).style.display = "none";
                         }}
                       />
                     </div>
                   )}
                 </div>

                 <div className="form-group">
                   <label htmlFor="price">Price (₹) *</label>
                  <input
                    type="number"
                    id="price"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="1999.00"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="stock_no">Stock Quantity *</label>
                  <input
                    type="number"
                    id="stock_no"
                    value={formData.stock_no}
                    onChange={(e) =>
                      setFormData({ ...formData, stock_no: e.target.value })
                    }
                    placeholder="50"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="brand">Brand</label>
                  <input
                    type="text"
                    id="brand"
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData({ ...formData, brand: e.target.value })
                    }
                    placeholder="Sony"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="color">Color</label>
                  <input
                    type="text"
                    id="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    placeholder="Black"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="size">Size</label>
                  <input
                    type="text"
                    id="size"
                    value={formData.size}
                    onChange={(e) =>
                      setFormData({ ...formData, size: e.target.value })
                    }
                    placeholder="M"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {modalMode === "add" ? "Create Product" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
