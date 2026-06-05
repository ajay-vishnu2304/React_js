interface Props {
  show: boolean;
  editId: number | null;
  name: string;
  price: string;
  stock: string;
  brand: string;
  color: string;
  size: string;
  image: string;
  description: string;
  onNameChange: (v: string) => void;
  onPriceChange: (v: string) => void;
  onStockChange: (v: string) => void;
  onBrandChange: (v: string) => void;
  onColorChange: (v: string) => void;
  onSizeChange: (v: string) => void;
  onImageChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const ProductFormModal = ({
  show,
  editId,
  name,
  price,
  stock,
  brand,
  color,
  size,
  image,
  description,
  onNameChange,
  onPriceChange,
  onStockChange,
  onBrandChange,
  onColorChange,
  onSizeChange,
  onImageChange,
  onDescriptionChange,
  onSubmit,
  onClose,
}: Props) => {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}>
      <div className="modal">
        <h2>{editId ? "Edit Product" : "Add Product"}</h2>
        <form onSubmit={onSubmit}>
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            required
          />
          <input
            placeholder="Price"
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => onPriceChange(e.target.value)}
            required
          />
          <input
            placeholder="Stock"
            type="number"
            value={stock}
            onChange={(e) => onStockChange(e.target.value)}
            required
          />
          <input
            placeholder="Brand"
            value={brand}
            onChange={(e) => onBrandChange(e.target.value)}
          />
          <input
            placeholder="Color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
          />
          <input
            placeholder="Size"
            value={size}
            onChange={(e) => onSizeChange(e.target.value)}
          />
          <input
            placeholder="Image URL"
            value={image}
            onChange={(e) => onImageChange(e.target.value)}
          />
          <input
            placeholder="Description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
          />
          <div className="modal-actions">
            <button type="submit">{editId ? "Update" : "Add"}</button>
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
