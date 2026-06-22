interface Props {
  show: boolean;
  editId: number | null;
  name: string;
  price: string;
  stock: string;
  brand: string;
  color: string;
  size: string;
  images: string[];
  description: string;
  onNameChange: (v: string) => void;
  onPriceChange: (v: string) => void;
  onStockChange: (v: string) => void;
  onBrandChange: (v: string) => void;
  onColorChange: (v: string) => void;
  onSizeChange: (v: string) => void;
  onImageChange: (index: number, v: string) => void;
  onImageAdd: () => void;
  onImageRemove: (index: number) => void;
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
  images,
  description,
  onNameChange,
  onPriceChange,
  onStockChange,
  onBrandChange,
  onColorChange,
  onSizeChange,
  onImageChange,
  onImageAdd,
  onImageRemove,
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

          <div className="images-section">
            <label className="images-label">Image URLs</label>
            {images.map((img, index) => (
              <div className="image-row" key={index}>
                <input
                  placeholder={`Image URL ${index + 1}`}
                  value={img}
                  onChange={(e) => onImageChange(index, e.target.value)}
                />
                {images.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove-img"
                    onClick={() => onImageRemove(index)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="btn-add-img" onClick={onImageAdd}>
              + Add another image
            </button>
          </div>

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
