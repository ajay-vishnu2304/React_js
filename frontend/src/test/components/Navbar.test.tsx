import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';

vi.mock('../../socket', () => ({
  socket: { disconnect: vi.fn() },
}));

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

import Navbar from '../../components/Navbar';

const authedState = {
  auth: {
    user: { id: 1, role: 'user' },
    token: 'fake.token.user',
    isAuthenticated: true,
    isAdmin: false,
  },
  cart: { items: [], cartId: null },
  wishlist: { items: [], wishlistId: null },
};

describe('Navbar component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ items: [] }),
    } as Response);
  });

  it('renders Home and Products links', () => {
    renderWithProviders(<Navbar />, { preloadedState: authedState as never });
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
  });

  it('renders a Logout button', () => {
    renderWithProviders(<Navbar />, { preloadedState: authedState as never });
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('shows cart and wishlist icons for regular users', () => {
    renderWithProviders(<Navbar />, { preloadedState: authedState as never });
    const links = screen.getAllByRole('link');
    expect(links.some((l) => l.getAttribute('href') === '/cart')).toBe(true);
    expect(links.some((l) => l.getAttribute('href') === '/wishlist')).toBe(true);
  });

  it('hides cart and wishlist icons for admin', () => {
    renderWithProviders(<Navbar isAdmin />, {
      preloadedState: { ...authedState, auth: { ...authedState.auth, isAdmin: true } } as never,
    });
    const links = screen.getAllByRole('link');
    expect(links.some((l) => l.getAttribute('href') === '/cart')).toBe(false);
    expect(links.some((l) => l.getAttribute('href') === '/wishlist')).toBe(false);
  });

  it('shows cart badge when cart has items', () => {
    const stateWithCart = {
      ...authedState,
      cart: {
        items: [{ id: 1, productId: 1, name: 'Item', price: 10, quantity: 3 }],
        cartId: 1,
      },
    };
    renderWithProviders(<Navbar />, { preloadedState: stateWithCart as never });
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows wishlist badge when wishlist has items', () => {
    const stateWithWishlist = {
      ...authedState,
      wishlist: {
        items: [{ id: 1, productId: 1 }],
        wishlistId: 1,
      },
    };
    renderWithProviders(<Navbar />, { preloadedState: stateWithWishlist as never });
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('disconnects socket and navigates on logout', async () => {
    const { store } = renderWithProviders(<Navbar />, {
      preloadedState: authedState as never,
      route: '/dashboard',
    });
    await userEvent.click(screen.getByText('Logout'));
    const { socket } = await import('../../socket');
    expect(socket.disconnect).toHaveBeenCalled();
    expect(store.getState().auth.isAuthenticated).toBe(false);
  });

  it('handles fetch errors for cart and wishlist gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    renderWithProviders(<Navbar />, { preloadedState: authedState as never, route: '/dashboard' });
    await waitFor(() => {
      expect(screen.getByText('Home')).toBeInTheDocument();
    });
  });
});
