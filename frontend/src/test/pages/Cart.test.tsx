import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import Cart from '../../pages/cart/Cart';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const authedState = {
  auth: {
    user: { id: 1, role: 'user' },
    token: 'token',
    isAuthenticated: true,
    isAdmin: false,
  },
  cart: {
    items: [],
    cartId: null,
  },
};

const cartItems = [
  {
    id: 1,
    productId: 10,
    name: 'Shirt',
    price: 20,
    quantity: 2,
    images: ['img1.jpg'],
  },
  {
    id: 2,
    productId: 20,
    name: 'Pants',
    price: 30,
    quantity: 1,
    images: [],
  },
];

function mockCartResponse(items: unknown[]) {
  mockFetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ cartId: 1, items }),
  } as Response);
}

describe('Cart page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows empty cart message when no items', async () => {
    mockCartResponse([]);
    renderWithProviders(<Cart />, { preloadedState: authedState as never, route: '/cart' });
    await waitFor(() => {
      expect(screen.getByText('Your Cart is Empty')).toBeInTheDocument();
    });
  });

  it('renders cart items and total', async () => {
    mockCartResponse(cartItems);
    renderWithProviders(<Cart />, { preloadedState: authedState as never, route: '/cart' });
    await waitFor(() => {
      expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
    });
    expect(screen.getByText('Shirt')).toBeInTheDocument();
    expect(screen.getByText('Pants')).toBeInTheDocument();
    expect(screen.getByText('Total: $70')).toBeInTheDocument();
  });

  it('increments quantity', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ cartId: 1, items: cartItems }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            cartId: 1,
            items: [{ ...cartItems[0], quantity: 3 }, cartItems[1]],
          }),
      } as Response);

    renderWithProviders(<Cart />, { preloadedState: authedState as never, route: '/cart' });
    await waitFor(() => screen.getByText('Shirt'));
    const buttons = screen.getAllByText('+');
    await userEvent.click(buttons[0]);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/cart-items/1', expect.objectContaining({ method: 'PATCH' }));
    });
  });

  it('removes an item', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ cartId: 1, items: cartItems }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ cartId: 1, items: [cartItems[1]] }),
      } as Response);

    renderWithProviders(<Cart />, { preloadedState: authedState as never, route: '/cart' });
    await waitFor(() => screen.getByText('Shirt'));
    const removeButtons = screen.getAllByText('Remove');
    await userEvent.click(removeButtons[0]);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/cart-items/1', expect.objectContaining({ method: 'DELETE' }));
    });
  });

  it('logs out on 401 cart fetch', async () => {
    mockFetch.mockRejectedValue(new Error('HTTP 401: Unauthorized'));
    const { store } = renderWithProviders(<Cart />, {
      preloadedState: authedState as never,
      route: '/cart',
    });
    await waitFor(() => {
      expect(store.getState().auth.isAuthenticated).toBe(false);
    });
  });
});
