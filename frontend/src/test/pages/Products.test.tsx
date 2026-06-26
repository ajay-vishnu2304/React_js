import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import Products from '../../pages/admin/Products';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const authedState = {
  auth: {
    user: { id: 1, role: 'admin' },
    token: 'token',
    isAuthenticated: true,
    isAdmin: true,
  },
};

const products = [
  {
    id: 1,
    name: 'Shirt',
    price: 20,
    stock_no: 10,
    brand: 'B',
    color: 'blue',
    size: 'M',
    images: ['img.jpg'],
    description: 'Cotton shirt',
  },
  {
    id: 2,
    name: 'Pants',
    price: 30,
    stock_no: 5,
    brand: 'D',
    color: 'black',
    size: 'L',
    images: [],
    description: 'Denim pants',
  },
];

function okResponse(data: unknown) {
  return { ok: true, json: () => Promise.resolve(data) } as Response;
}

describe('Products page', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders products list', async () => {
    mockFetch.mockResolvedValue(okResponse({ products }));

    renderWithProviders(<Products />, { preloadedState: authedState as never, route: '/admin/products' });
    await waitFor(() => screen.getByText('Shirt'));
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('Pants')).toBeInTheDocument();
    expect(screen.getByText('No img')).toBeInTheDocument();
  });

  it('shows alert when fetching products fails', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    renderWithProviders(<Products />, { preloadedState: authedState as never, route: '/admin/products' });
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to load products. Please check if you\'re logged in as admin.');
    });
  });

  it('adds a new product', async () => {
    mockFetch
      .mockResolvedValueOnce(okResponse({ products }))
      .mockResolvedValueOnce(okResponse({ id: 2 }))
      .mockResolvedValueOnce(okResponse({ products: [...products, { id: 2, name: 'Pants', price: 30, stock_no: 5 }] }));

    renderWithProviders(<Products />, { preloadedState: authedState as never, route: '/admin/products' });
    await waitFor(() => screen.getByText('Shirt'));
    await userEvent.click(screen.getByText('+ Add Product'));

    await userEvent.type(screen.getByPlaceholderText('Name'), 'Pants');
    await userEvent.type(screen.getByPlaceholderText('Price'), '30');
    await userEvent.type(screen.getByPlaceholderText('Stock'), '5');
    await userEvent.click(screen.getByText('Add'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/products', expect.objectContaining({ method: 'POST' }));
    });
  });

  it('edits an existing product', async () => {
    mockFetch
      .mockResolvedValueOnce(okResponse({ products }))
      .mockResolvedValueOnce(okResponse({ id: 1 }))
      .mockResolvedValueOnce(okResponse({ products }));

    renderWithProviders(<Products />, { preloadedState: authedState as never, route: '/admin/products' });
    await waitFor(() => screen.getByText('Shirt'));

    await userEvent.click(screen.getAllByText('Edit')[0]);

    expect(screen.getByText('Edit Product')).toBeInTheDocument();
    const nameInput = screen.getByPlaceholderText('Name') as HTMLInputElement;
    expect(nameInput).toHaveValue('Shirt');

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Updated Shirt');
    await userEvent.click(screen.getByText('Update'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/products/1', expect.objectContaining({ method: 'PATCH' }));
    });
  });

  it('shows alert on network error during save', async () => {
    mockFetch
      .mockResolvedValueOnce(okResponse({ products }))
      .mockRejectedValueOnce(new Error('Network error'));

    renderWithProviders(<Products />, { preloadedState: authedState as never, route: '/admin/products' });
    await waitFor(() => screen.getByText('Shirt'));
    await userEvent.click(screen.getByText('+ Add Product'));

    await userEvent.type(screen.getByPlaceholderText('Name'), 'X');
    await userEvent.type(screen.getByPlaceholderText('Price'), '10');
    await userEvent.type(screen.getByPlaceholderText('Stock'), '1');
    await userEvent.click(screen.getByText('Add'));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Network error. Please try again.');
    });
  });

  it('deletes a product', async () => {
    mockFetch
      .mockResolvedValueOnce(okResponse({ products }))
      .mockResolvedValueOnce(okResponse({}))
      .mockResolvedValueOnce(okResponse({ products: [] }));

    renderWithProviders(<Products />, { preloadedState: authedState as never, route: '/admin/products' });
    await waitFor(() => screen.getByText('Shirt'));
    await userEvent.click(screen.getAllByText('Delete')[0]);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/products/1', expect.objectContaining({ method: 'DELETE' }));
    });
  });

  it('does not delete when confirm is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    mockFetch.mockResolvedValueOnce(okResponse({ products }));
    renderWithProviders(<Products />, { preloadedState: authedState as never, route: '/admin/products' });
    await waitFor(() => screen.getByText('Shirt'));
    await userEvent.click(screen.getAllByText('Delete')[0]);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('shows alert on network error during delete', async () => {
    mockFetch
      .mockResolvedValueOnce(okResponse({ products }))
      .mockRejectedValueOnce(new Error('Network error'));

    renderWithProviders(<Products />, { preloadedState: authedState as never, route: '/admin/products' });
    await waitFor(() => screen.getByText('Shirt'));
    await userEvent.click(screen.getAllByText('Delete')[0]);
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Network error. Please try again.');
    });
  });

  it('adds and removes image URL fields', async () => {
    mockFetch.mockResolvedValueOnce(okResponse({ products }));
    renderWithProviders(<Products />, { preloadedState: authedState as never, route: '/admin/products' });
    await waitFor(() => screen.getByText('Shirt'));
    await userEvent.click(screen.getByText('+ Add Product'));

    await userEvent.click(screen.getByText('+ Add another image'));
    expect(screen.getByPlaceholderText('Image URL 2')).toBeInTheDocument();

    const removeButtons = screen.getAllByText('✕');
    await userEvent.click(removeButtons[0]);
    expect(screen.queryByPlaceholderText('Image URL 2')).not.toBeInTheDocument();
  });

  it('closes modal when Cancel button clicked', async () => {
    mockFetch.mockResolvedValueOnce(okResponse({ products }));
    renderWithProviders(<Products />, { preloadedState: authedState as never, route: '/admin/products' });
    await waitFor(() => screen.getByText('Shirt'));
    await userEvent.click(screen.getByText('+ Add Product'));
    expect(screen.getByText('Add Product')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Add Product')).not.toBeInTheDocument();
  });

  it('closes modal when clicking on overlay', async () => {
    mockFetch.mockResolvedValueOnce(okResponse({ products }));
    renderWithProviders(<Products />, { preloadedState: authedState as never, route: '/admin/products' });
    await waitFor(() => screen.getByText('Shirt'));
    await userEvent.click(screen.getByText('+ Add Product'));
    const overlay = document.querySelector('.modal-overlay') as HTMLElement;
    await userEvent.click(overlay);
    expect(screen.queryByText('Add Product')).not.toBeInTheDocument();
  });
});
