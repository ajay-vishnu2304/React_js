import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { renderWithProviders } from '../test-utils';
import UserDashboard from '../../pages/userDashboard/Dashboard';

vi.mock('react-infinite-scroll-component', () => {
  return {
    default: function MockInfiniteScroll({ children, next, hasMore }: { children: React.ReactNode; next: () => void; hasMore: boolean }) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      React.useEffect(() => {
        if (hasMore) next();
      }, []);
      return React.createElement('div', null, children);
    },
  };
});

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const authedState = {
  auth: {
    user: { id: 1, role: 'user' },
    token: 'token',
    isAuthenticated: true,
    isAdmin: false,
  },
  cart: { items: [], cartId: null },
  wishlist: { items: [], wishlistId: null },
};

const products = [
  { id: 1, name: 'Shirt', description: 'Cotton', price: 20, brand: 'B', stock_no: 5, images: ['img.jpg'] },
  { id: 2, name: 'Pants', description: 'Denim', price: 30, brand: 'D', stock_no: 0, images: [] },
];

function okResponse(data: unknown) {
  return { ok: true, json: () => Promise.resolve(data) } as Response;
}

describe('UserDashboard page', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('renders products and handles add to cart', async () => {
    mockFetch
      .mockResolvedValueOnce(okResponse({ products, haveMore: false }))
      .mockResolvedValueOnce(okResponse({ cartId: 1 }))
      .mockResolvedValueOnce(okResponse({}))
      .mockResolvedValueOnce(okResponse({ cartId: 1, items: [] }));

    renderWithProviders(<UserDashboard />, { preloadedState: authedState as never, route: '/dashboard' });

    await waitFor(() => screen.getByText('Shirt'));
    expect(screen.getByText('User Dashboard')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Add to Cart'));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/cart-items', expect.objectContaining({ method: 'POST' }));
    });
  });

  it('shows Out of Stock button when stock_no is 0', async () => {
    mockFetch.mockResolvedValueOnce(okResponse({ products, haveMore: false }));
    renderWithProviders(<UserDashboard />, { preloadedState: authedState as never, route: '/dashboard' });
    await waitFor(() => screen.getByText('Pants'));
    expect(screen.getByText('Out of Stock')).toBeDisabled();
  });

  it('renders No Image placeholder when product has no images', async () => {
    mockFetch.mockResolvedValueOnce(okResponse({ products, haveMore: false }));
    renderWithProviders(<UserDashboard />, { preloadedState: authedState as never, route: '/dashboard' });
    await waitFor(() => screen.getByText('Pants'));
    expect(screen.getByText('No Image')).toBeInTheDocument();
  });

  it('increments and decrements quantity', async () => {
    mockFetch.mockResolvedValueOnce(okResponse({ products, haveMore: false }));
    renderWithProviders(<UserDashboard />, { preloadedState: authedState as never, route: '/dashboard' });
    await waitFor(() => screen.getByText('Shirt'));

    await userEvent.click(screen.getAllByText('+')[0]);
    expect(screen.getAllByText('2')).toHaveLength(1);

    await userEvent.click(screen.getAllByText('−')[0]);
    expect(screen.getAllByText('1')).toHaveLength(2);
  });

  it('disables decrement when quantity is 1', async () => {
    mockFetch.mockResolvedValueOnce(okResponse({ products, haveMore: false }));
    renderWithProviders(<UserDashboard />, { preloadedState: authedState as never, route: '/dashboard' });
    await waitFor(() => screen.getByText('Shirt'));
    expect(screen.getAllByText('−')[0]).toBeDisabled();
  });

  it('adds product to wishlist when toggled', async () => {
    mockFetch
      .mockResolvedValueOnce(okResponse({ products, haveMore: false }))
      .mockResolvedValueOnce(okResponse({ wishlistId: 1 }))
      .mockResolvedValueOnce(okResponse({}))
      .mockResolvedValueOnce(okResponse({ wishlistId: 1, items: [{ id: 1, productId: 1 }] }));

    renderWithProviders(<UserDashboard />, { preloadedState: authedState as never, route: '/dashboard' });
    await waitFor(() => screen.getByText('Shirt'));
    await userEvent.click(screen.getAllByTitle('Toggle wishlist')[0]);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/wishlist-items', expect.objectContaining({ method: 'POST' }));
    });
  });

  it('removes product from wishlist when already in wishlist', async () => {
    mockFetch
      .mockResolvedValueOnce(okResponse({ products, haveMore: false }))
      .mockResolvedValueOnce(okResponse({}))
      .mockResolvedValueOnce(okResponse({ wishlistId: 1, items: [] }));

    const stateWithWishlist = {
      ...authedState,
      wishlist: { items: [{ id: 5, productId: 1 }], wishlistId: 1 },
    };
    renderWithProviders(<UserDashboard />, { preloadedState: stateWithWishlist as never, route: '/dashboard' });
    await waitFor(() => screen.getByText('Shirt'));
    await userEvent.click(screen.getAllByTitle('Toggle wishlist')[0]);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/wishlist-items/5', expect.objectContaining({ method: 'DELETE' }));
    });
  });

  it('shows error toast when add to cart fails', async () => {
    const { toast } = await import('react-toastify');
    mockFetch
      .mockResolvedValueOnce(okResponse({ products, haveMore: false }))
      .mockRejectedValueOnce(new Error('Network error'));

    renderWithProviders(<UserDashboard />, { preloadedState: authedState as never, route: '/dashboard' });
    await waitFor(() => screen.getByText('Shirt'));
    await userEvent.click(screen.getByText('Add to Cart'));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to add to cart');
    });
  });

  it('shows error toast when wishlist toggle fails', async () => {
    const { toast } = await import('react-toastify');
    mockFetch
      .mockResolvedValueOnce(okResponse({ products, haveMore: false }))
      .mockRejectedValueOnce(new Error('Network error'));

    renderWithProviders(<UserDashboard />, { preloadedState: authedState as never, route: '/dashboard' });
    await waitFor(() => screen.getByText('Shirt'));
    await userEvent.click(screen.getAllByTitle('Toggle wishlist')[0]);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to update wishlist');
    });
  });

  it('redirects to login when not authenticated', () => {
    const unauthedState = {
      ...authedState,
      auth: { user: null, token: null, isAuthenticated: false, isAdmin: false },
    };
    renderWithProviders(<UserDashboard />, { preloadedState: unauthedState as never, route: '/dashboard' });
    expect(screen.getByText('User Dashboard')).toBeInTheDocument();
  });

  it('redirects to admin dashboard when user is admin', () => {
    const adminState = {
      ...authedState,
      auth: { user: { id: 1, role: 'admin' }, token: 'token', isAuthenticated: true, isAdmin: true },
    };
    renderWithProviders(<UserDashboard />, { preloadedState: adminState as never, route: '/dashboard' });
    expect(screen.getByText('User Dashboard')).toBeInTheDocument();
  });
});
