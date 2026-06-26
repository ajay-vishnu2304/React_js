import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import Wishlist from '../../pages/wishlist/Wishlist';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const authedState = {
  auth: {
    user: { id: 1, role: 'user' },
    token: 'token',
    isAuthenticated: true,
    isAdmin: false,
  },
  wishlist: {
    items: [],
    wishlistId: null,
  },
};

const wishlistItems = [
  { id: 1, productId: 10, name: 'Shirt', price: 20, images: ['img.jpg'] },
  { id: 2, productId: 20, name: 'Pants', price: 30 },
];

describe('Wishlist page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows empty wishlist message', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ wishlistId: 1, items: [] }),
    } as Response);
    renderWithProviders(<Wishlist />, { preloadedState: authedState as never, route: '/wishlist' });
    await waitFor(() => {
      expect(screen.getByText('Your Wishlist is Empty')).toBeInTheDocument();
    });
  });

  it('renders wishlist items and removes one', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ wishlistId: 1, items: wishlistItems }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ wishlistId: 1, items: [wishlistItems[1]] }),
      } as Response);

    renderWithProviders(<Wishlist />, { preloadedState: authedState as never, route: '/wishlist' });
    await waitFor(() => screen.getByText('Shirt'));
    expect(screen.getByText('My Wishlist')).toBeInTheDocument();
    const removeButtons = screen.getAllByText('Remove');
    await userEvent.click(removeButtons[0]);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/wishlist-items/1', expect.objectContaining({ method: 'DELETE' }));
    });
  });
});
