import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import Checkout from '../../pages/cart/Checkout';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const savedAddress = {
  id: 1,
  address1: '123 St',
  address2: '',
  city: 'City',
  state: 'State',
  country: 'Country',
  postal_code: '12345',
  address_type: 'Home',
  isDefault: true,
};

const authedState = {
  auth: {
    user: { id: 1, role: 'user' },
    token: 'token',
    isAuthenticated: true,
    isAdmin: false,
  },
  cart: {
    items: [
      { id: 1, productId: 10, name: 'Shirt', price: 20, quantity: 2, images: [] },
    ],
    cartId: 1,
  },
};

describe('Checkout page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to cart when cart is empty and not ordered', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);
    const { container } = renderWithProviders(<Checkout />, {
      preloadedState: {
        auth: authedState.auth,
        cart: { items: [], cartId: null },
      } as never,
      route: '/checkout',
    });
    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
  });

  it('renders checkout with saved addresses and order summary', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([savedAddress]),
    } as Response);

    renderWithProviders(<Checkout />, { preloadedState: authedState as never, route: '/checkout' });
    await waitFor(() => screen.getByText('Saved Addresses'));
    expect(screen.getByText('Shirt')).toBeInTheDocument();
    expect(screen.getByText('Checkout')).toBeInTheDocument();
  });

  it('applies and removes a coupon', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([savedAddress]),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ name: 'SAVE10', discount_percentage: 10 }),
      } as Response);

    renderWithProviders(<Checkout />, { preloadedState: authedState as never, route: '/checkout' });
    await waitFor(() => screen.getByText('Saved Addresses'));

    const couponInput = screen.getByPlaceholderText('Coupon code (optional)');
    await userEvent.type(couponInput, 'SAVE10');
    await userEvent.click(screen.getByText('Apply'));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/coupons/validate/SAVE10', expect.anything());
    });

    await userEvent.click(screen.getByText('Remove'));
    expect(screen.getByText('Apply')).toBeInTheDocument();
  });

  it('places order using a new address and shows success', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([savedAddress]),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 2 }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ orderId: 1 }),
      } as Response);

    renderWithProviders(<Checkout />, { preloadedState: authedState as never, route: '/checkout' });
    await waitFor(() => screen.getByText('Saved Addresses'));

    await userEvent.click(screen.getByText('+ Use a new address'));
    await userEvent.type(screen.getByPlaceholderText('123 Main St'), '456 Main');
    await userEvent.type(screen.getByPlaceholderText('New York'), 'City');
    await userEvent.type(screen.getByPlaceholderText('NY'), 'State');
    await userEvent.type(screen.getByPlaceholderText('USA'), 'Country');
    await userEvent.type(screen.getByPlaceholderText('10001'), '12345');

    await userEvent.click(screen.getByText('Place Order'));
    await waitFor(() => {
      expect(screen.getByText('Order Placed Successfully!')).toBeInTheDocument();
    });
  });
});
