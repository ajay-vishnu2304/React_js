import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductFormModal from '../../components/ProductFormModal';

function buildProps(overrides: Record<string, unknown> = {}) {
  return {
    show: true,
    editId: null,
    name: '',
    price: '',
    stock: '',
    brand: '',
    color: '',
    size: '',
    images: [''],
    description: '',
    onNameChange: vi.fn(),
    onPriceChange: vi.fn(),
    onStockChange: vi.fn(),
    onBrandChange: vi.fn(),
    onColorChange: vi.fn(),
    onSizeChange: vi.fn(),
    onImageChange: vi.fn(),
    onImageAdd: vi.fn(),
    onImageRemove: vi.fn(),
    onDescriptionChange: vi.fn(),
    onSubmit: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  };
}

describe('ProductFormModal component', () => {
  it('renders nothing when show is false', () => {
    const { container } = render(<ProductFormModal {...buildProps({ show: false })} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows Add Product title when editId is null', () => {
    render(<ProductFormModal {...buildProps()} />);
    expect(screen.getByText('Add Product')).toBeInTheDocument();
  });

  it('shows Edit Product title when editId is set', () => {
    render(<ProductFormModal {...buildProps({ editId: 5 })} />);
    expect(screen.getByText('Edit Product')).toBeInTheDocument();
  });

  it('shows Update button when editing', () => {
    render(<ProductFormModal {...buildProps({ editId: 5 })} />);
    expect(screen.getByText('Update')).toBeInTheDocument();
  });

  it('calls onNameChange when name input changes', async () => {
    const onNameChange = vi.fn();
    render(<ProductFormModal {...buildProps({ onNameChange })} />);
    await userEvent.type(screen.getByPlaceholderText('Name'), 'S');
    expect(onNameChange).toHaveBeenCalled();
  });

  it('calls onImageAdd when add image button is clicked', async () => {
    const onImageAdd = vi.fn();
    render(<ProductFormModal {...buildProps({ onImageAdd })} />);
    await userEvent.click(screen.getByText('+ Add another image'));
    expect(onImageAdd).toHaveBeenCalled();
  });

  it('calls onClose when Cancel button is clicked', async () => {
    const onClose = vi.fn();
    render(<ProductFormModal {...buildProps({ onClose })} />);
    await userEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('does not show remove button when only one image', () => {
    render(<ProductFormModal {...buildProps({ images: [''] })} />);
    expect(screen.queryByText('✕')).not.toBeInTheDocument();
  });

  it('shows remove buttons when multiple images', () => {
    render(<ProductFormModal {...buildProps({ images: ['img1', 'img2'] })} />);
    expect(screen.getAllByText('✕')).toHaveLength(2);
  });

  it('calls onImageRemove when remove button is clicked', async () => {
    const onImageRemove = vi.fn();
    render(<ProductFormModal {...buildProps({ images: ['img1', 'img2'], onImageRemove })} />);
    await userEvent.click(screen.getAllByText('✕')[0]);
    expect(onImageRemove).toHaveBeenCalledWith(0);
  });

  it('calls onPriceChange, onStockChange, onBrandChange, onColorChange, onSizeChange, onDescriptionChange', async () => {
    const onPriceChange = vi.fn();
    const onStockChange = vi.fn();
    const onBrandChange = vi.fn();
    const onColorChange = vi.fn();
    const onSizeChange = vi.fn();
    const onDescriptionChange = vi.fn();
    render(
      <ProductFormModal
        {...buildProps({
          onPriceChange,
          onStockChange,
          onBrandChange,
          onColorChange,
          onSizeChange,
          onDescriptionChange,
        })}
      />
    );
    await userEvent.type(screen.getByPlaceholderText('Price'), '10');
    await userEvent.type(screen.getByPlaceholderText('Stock'), '5');
    await userEvent.type(screen.getByPlaceholderText('Brand'), 'B');
    await userEvent.type(screen.getByPlaceholderText('Color'), 'Red');
    await userEvent.type(screen.getByPlaceholderText('Size'), 'M');
    await userEvent.type(screen.getByPlaceholderText('Description'), 'Desc');
    expect(onPriceChange).toHaveBeenCalled();
    expect(onStockChange).toHaveBeenCalled();
    expect(onBrandChange).toHaveBeenCalled();
    expect(onColorChange).toHaveBeenCalled();
    expect(onSizeChange).toHaveBeenCalled();
    expect(onDescriptionChange).toHaveBeenCalled();
  });

  it('calls onImageChange when image input changes', async () => {
    const onImageChange = vi.fn();
    render(<ProductFormModal {...buildProps({ onImageChange })} />);
    await userEvent.type(screen.getByPlaceholderText('Image URL 1'), 'url');
    expect(onImageChange).toHaveBeenCalled();
  });

  it('calls onClose when overlay is clicked', async () => {
    const onClose = vi.fn();
    const { container } = render(<ProductFormModal {...buildProps({ onClose })} />);
    const overlay = container.querySelector('.modal-overlay') as HTMLElement;
    await userEvent.click(overlay);
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onSubmit when form is submitted', async () => {
    const onSubmit = vi.fn((e) => e.preventDefault());
    const { container } = render(<ProductFormModal {...buildProps({ onSubmit })} />);
    const form = container.querySelector('form') as HTMLFormElement;
    await fireEvent.submit(form);
    expect(onSubmit).toHaveBeenCalled();
  });
});
