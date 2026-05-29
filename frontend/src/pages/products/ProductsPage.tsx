import { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import type { Product, CreateProductResponse } from "../../services/apiService";
import {
  getProducts,
  createProduct,
  updateProduct,
  updateProductStock,
  deleteProduct,
  getProductImages,
  addProductImage,
  deleteAllProductImages,
} from "../../services/apiService";
import { hasAnyRole } from "../../services/jwtUtils";
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
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const [productImageMap, setProductImageMap] = useState<
    Record<number, string>
  >({});
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
  const canManageProducts = token
    ? hasAnyRole(token, ["admin", "product_manager"])
    : false;

  const loadProductImages = useCallback(async (): Promise<
    Record<number, string>
  > => {
    try {
      const allImages = await getProductImages(token);
      const map: Record<number, string> = {};
      for (const img of allImages) {
        if (!map[img.product_id]) {
          map[img.product_id] = img.image_url;
        }
      }
      return map;
    } catch (imgErr) {
      console.error("Admin - Failed to load product images:", imgErr);
      return {};
    }
  }, [token]);

  const fetchProductsList = useCallback(
    async (signal: AbortSignal, setLoadingOnStart: boolean = true) => {
      if (setLoadingOnStart) {
        setLoading(true);
      }
      try {
        const data = await getProducts(token, signal);
        if (!signal.aborted) {
          setProducts(data);
          const imageMap = await loadProductImages();
          if (!signal.aborted) {
            setProductImageMap(imageMap);
            setError(null);
          }
        }
      } catch (err) {
        if (!signal.aborted) {
          const message =
            typeof err === "object" && err !== null && "message" in err
              ? (err as { message: string }).message
              : "Failed to load products.";
          setError(message);
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    },
    [token, loadProductImages],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchProductsList(controller.signal, true);
    return () => {
      controller.abort();
    };
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

  const handleOpenEditModal = (product: Product) => {
    setModalMode("edit");
    setSelectedProduct(product);

    const imageUrl = productImageMap[product.id] || "";

    setFormData({
      name: product.name,
      description: product.description || "",
      price: String(product.price),
      stock_no: String(product.stock_no),
      brand: product.brand || "",
      color: product.color || "",
      size: product.size || "",
      image_url: imageUrl,
    });

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateFormData = (): string | null => {
    if (!formData.name.trim()) {
      return "Product Name is required.";
    }
    const priceNum = Number.parseFloat(formData.price);
    if (Number.isNaN(priceNum) || priceNum <= 0) {
      return "Please enter a valid positive price.";
    }
    const stockNum = Number.parseInt(formData.stock_no, 10);
    if (Number.isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
      return "Please enter a valid non-negative integer stock quantity.";
    }
    return null;
  };

  const buildProductPayload = () => {
    const priceNum = Number.parseFloat(formData.price);
    const stockNum = Number.parseInt(formData.stock_no, 10);
    return {
      name: formData.name,
      description: formData.description || undefined,
      price: priceNum,
      stock_no: stockNum,
      brand: formData.brand || undefined,
      color: formData.color || undefined,
      size: formData.size || undefined,
    };
  };

  const handleAddProduct = async (newProductId: number | null) => {
    toast.success("Product added successfully!");
    if (formData.image_url && newProductId) {
      try {
        await addProductImage(token, newProductId, formData.image_url);
      } catch (imgErr) {
        console.warn("Failed to attach image after create:", imgErr);
      }
    }
  };

  const handleEditProduct = async (payload: Partial<Product>) => {
    if (!selectedProduct) return;
    await updateProduct(token, selectedProduct.id, payload);
    if (formData.image_url) {
      await deleteAllProductImages(token, selectedProduct.id).catch((imgErr) =>
        console.warn("Failed to delete old images:", imgErr),
      );
      await addProductImage(
        token,
        selectedProduct.id,
        formData.image_url,
      ).catch((imgErr) => console.warn("Failed to add image:", imgErr));
    }
    toast.success("Product updated successfully!");
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationError = validateFormData();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const payload = buildProductPayload();

    try {
      if (modalMode === "add") {
        const created: CreateProductResponse = await createProduct(
          token,
          payload,
        );
        const newProductId = created.id ?? created.product?.id ?? null;
        await handleAddProduct(newProductId);
      } else if (modalMode === "edit") {
        await handleEditProduct(payload);
      }

      setIsModalOpen(false);
      const controller = new AbortController();
      fetchProductsList(controller.signal, false);
    } catch (err) {
      const message =
        typeof err === "object" && err !== null && "message" in err
          ? (err as { message: string }).message
          : "Failed to save product.";
      toast.error(message);
    }
  };

  const handleDeleteClick = (id: number, name: string, stock: number) => {
    if (stock > 0) {
      toast.error("Cannot delete product with stock > 0");
      return;
    }
    setDeleteConfirm({ id, name });
  };

  const confirmDeleteProduct = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteProduct(token, deleteConfirm.id);
      toast.success("Product deleted successfully!");
      setDeleteConfirm(null);
      const controller = new AbortController();
      fetchProductsList(controller.signal, false);
    } catch (err) {
      const message =
        typeof err === "object" && err !== null && "message" in err
          ? (err as { message: string }).message
          : "Failed to delete product.";
      toast.error(message);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const handleStartStockEdit = (product: Product) => {
    setEditingStockId(product.id);
    setTempStockValue(product.stock_no);
  };

  const handleSaveStockEdit = async (id: number) => {
    if (
      tempStockValue < 0 ||
      Number.isNaN(tempStockValue) ||
      !Number.isInteger(tempStockValue)
    ) {
      toast.error("Stock must be a non-negative integer.");
      return;
    }
    try {
      await updateProductStock(token, id, tempStockValue);
      setEditingStockId(null);
      const controller = new AbortController();
      fetchProductsList(controller.signal, false);
    } catch (err) {
      const message =
        typeof err === "object" && err !== null && "message" in err
          ? (err as { message: string }).message
          : "Failed to update stock.";
      toast.error(message);
    }
  };

  const uniqueBrands = useMemo(
    () =>
      Array.from(
        new Set(
          products
            .map((p) => p.brand?.trim())
            .filter((brand): brand is string => !!brand),
        ),
      ),
    [products],
  );

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesSearch =
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product.description || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (product.brand || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

        const matchesBrand =
          selectedBrand === "all" || product.brand?.trim() === selectedBrand;

        let matchesStock = true;
        if (stockFilter === "inStock") {
          matchesStock = product.stock_no > 10;
        } else if (stockFilter === "lowStock") {
          matchesStock = product.stock_no > 0 && product.stock_no <= 10;
        } else if (stockFilter === "outOfStock") {
          matchesStock = product.stock_no === 0;
        }

        return matchesSearch && matchesBrand && matchesStock;
      }),
    [products, searchQuery, selectedBrand, stockFilter],
  );

  const statsTotalProducts = products.length;
  const statsTotalValue = useMemo(
    () => products.reduce((acc, p) => acc + Number(p.price) * p.stock_no, 0),
    [products],
  );
  const statsLowStock = useMemo(
    () => products.filter((p) => p.stock_no > 0 && p.stock_no <= 10).length,
    [products],
  );
  const statsOutOfStock = useMemo(
    () => products.filter((p) => p.stock_no === 0).length,
    [products],
  );

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
        {canManageProducts && (
          <button className="add-product-btn" onClick={handleOpenAddModal}>
            + Add Product
          </button>
        )}
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
        {(() => {
          if (loading) {
            return <div className="table-message">Loading products...</div>;
          }
          if (error) {
            return <div className="table-message error">{error}</div>;
          }
          if (filteredProducts.length === 0) {
            return (
              <div className="table-message">
                No products match the selected filters.
              </div>
            );
          }
          return (
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
                        <span style={{ color: "#999", fontSize: "12px" }}>
                          —
                        </span>
                      )}
                    </td>
                    <td className="product-name-cell">
                      <strong>{product.name}</strong>
                      {product.description && (
                        <span className="product-desc">
                          {product.description}
                        </span>
                      )}
                    </td>
                    <td>{product.brand || "—"}</td>
                    <td className="price-cell">
                      ₹{Number(product.price).toFixed(2)}
                    </td>
                    <td>{product.size || "—"}</td>
                    <td>{product.color || "—"}</td>

                    <td className="stock-cell">
                      {editingStockId === product.id ? (
                        <div className="inline-stock-editor">
                          <input
                            type="number"
                            value={tempStockValue}
                            onChange={(e) =>
                              setTempStockValue(
                                Number.parseInt(e.target.value, 10) || 0,
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleSaveStockEdit(product.id);
                              } else if (e.key === "Escape") {
                                setEditingStockId(null);
                              }
                            }}
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
                          product.stock_no,
                        )}`}
                      >
                        {getStockStatusText(product.stock_no)}
                      </span>
                    </td>

                    <td className="actions-cell">
                      {canManageProducts && (
                        <>
                          <button
                            className="action-btn edit-btn"
                            onClick={() => handleOpenEditModal(product)}
                          >
                            Edit
                          </button>
                          <button
                            className="action-btn delete-btn"
                            onClick={() =>
                              handleDeleteClick(
                                product.id,
                                product.name,
                                product.stock_no,
                              )
                            }
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          );
        })()}
      </div>

      {deleteConfirm && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) cancelDelete();
          }}
          onKeyDown={(e) => e.key === "Escape" && cancelDelete()}
          tabIndex={0}
          role="button"
          aria-label="Cancel delete"
        >
          <div
            className="modal-content"
            style={{ maxWidth: "400px", textAlign: "center" }}
          >
            <h2 style={{ marginBottom: "8px" }}>Confirm Delete</h2>
            <p style={{ marginBottom: "24px", color: "#555" }}>
              Are you sure you want to delete{" "}
              <strong>"{deleteConfirm.name}"</strong>?
              <br />
              <span style={{ color: "#888", fontSize: "13px" }}>
                This action cannot be undone.
              </span>
            </p>
            <div
              style={{ display: "flex", gap: "12px", justifyContent: "center" }}
            >
              <button
                className="btn-cancel"
                onClick={cancelDelete}
                type="button"
              >
                Cancel
              </button>
              <button
                className="btn-submit"
                style={{ background: "#dc3545" }}
                onClick={confirmDeleteProduct}
                type="button"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
          onKeyDown={(e) => e.key === "Escape" && handleCloseModal()}
          tabIndex={0}
          role="button"
          aria-label="Close modal"
        >
          <dialog className="modal-content" open>
            <div className="modal-header">
              <h2>
                {modalMode === "add" ? "Add New Product" : "Edit Product"}
              </h2>
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
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="Wireless Headphones"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    placeholder="High-quality bluetooth headphones with active noise cancellation."
                    rows={3}
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="image_url">
                    Image URL (paste link - single image)
                  </label>
                  <input
                    type="text"
                    id="image_url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleFormChange}
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
                          display: "block",
                        }}
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.style.display = "none";
                          // Show error message after the image
                          const errorDiv = document.createElement("div");
                          errorDiv.className = "image-error-msg";
                          errorDiv.textContent =
                            "⚠️ Failed to load image. Check the URL.";
                          errorDiv.style.cssText =
                            "color: #dc3545; font-size: 12px; margin-top: 4px;";
                          target.parentElement?.appendChild(errorDiv);
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
                    name="price"
                    step="0.01"
                    value={formData.price}
                    onChange={handleFormChange}
                    placeholder="1999.00"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="stock_no">Stock Quantity *</label>
                  <input
                    type="number"
                    id="stock_no"
                    name="stock_no"
                    value={formData.stock_no}
                    onChange={handleFormChange}
                    placeholder="50"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="brand">Brand</label>
                  <input
                    type="text"
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleFormChange}
                    placeholder="Sony"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="color">Color</label>
                  <input
                    type="text"
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleFormChange}
                    placeholder="Black"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="size">Size</label>
                  <input
                    type="text"
                    id="size"
                    name="size"
                    value={formData.size}
                    onChange={handleFormChange}
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
          </dialog>
        </div>
      )}
    </div>
  );
}
