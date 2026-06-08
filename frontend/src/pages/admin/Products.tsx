import { useEffect, useState } from "react";
import ProductFormModal from "../../components/ProductFormModal";
import { useAuthenticatedFetch } from "../../hooks/useAuthenticatedFetch";

interface Product {
  id: number;
  name: string;
  price: number;
  stock_no: number;
  brand?: string;
  color?: string;
  size?: string;
  image?: string;
  description?: string;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [brand, setBrand] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { authFetch } = useAuthenticatedFetch();

  const fetchProducts = () => {
    authFetch("/admin/products")
      .then((r) => r.json())
      .then(setProducts);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const resetForm = () => {
    setName("");
    setPrice("");
    setStock("");
    setBrand("");
    setColor("");
    setSize("");
    setImage("");
    setDescription("");
    setEditId(null);
  };

  const openAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setName(p.name);
    setPrice(String(p.price));
    setStock(String(p.stock_no));
    setBrand(p.brand || "");
    setColor(p.color || "");
    setSize(p.size || "");
    setImage(p.image || "");
    setDescription(p.description || "");
    setEditId(p.id);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editId ? `/admin/products/${editId}` : `/admin/products`;
    const method = editId ? "PUT" : "POST";

    await authFetch(url, {
      method,
      body: JSON.stringify({
        name,
        price: parseFloat(price),
        stock_no: parseInt(stock),
        brand,
        color,
        size,
        image,
        description,
      }),
    });

    setShowModal(false);
    fetchProducts();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this product?")) return;
    await authFetch(`/admin/products/${id}`, {
      method: "DELETE",
    });
    fetchProducts();
  };

  return (
    <div>
      <div className="page-header">
        <h1>Products</h1>
        <button className="btn-add" onClick={openAdd}>
          + Add Product
        </button>
      </div>

      <ProductFormModal
        show={showModal}
        editId={editId}
        name={name}
        price={price}
        stock={stock}
        brand={brand}
        color={color}
        size={size}
        image={image}
        description={description}
        onNameChange={setName}
        onPriceChange={setPrice}
        onStockChange={setStock}
        onBrandChange={setBrand}
        onColorChange={setColor}
        onSizeChange={setSize}
        onImageChange={setImage}
        onDescriptionChange={setDescription}
        onSubmit={handleSubmit}
        onClose={() => setShowModal(false)}
      />

      <table className="admin-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Brand</th>
            <th>Color</th>
            <th>Size</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p: Product) => (
            <tr key={p.id}>
              <td>
                {p.image ? (
                  <img src={p.image} alt={p.name} className="product-thumb" />
                ) : (
                  <span className="no-img">No img</span>
                )}
              </td>
              <td>{p.name}</td>
              <td>{p.price}</td>
              <td>{p.stock_no}</td>
              <td>{p.brand}</td>
              <td>{p.color}</td>
              <td>{p.size}</td>
              <td>
                <button className="btn-edit" onClick={() => openEdit(p)}>
                  Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(p.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Products;
