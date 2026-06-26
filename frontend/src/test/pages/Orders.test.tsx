import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import Orders from '../../pages/admin/Orders';

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

const orders = [
  {
    id: 1,
    user_id: 1,
    user_name: 'Alice',
    user_email: 'alice@example.com',
    address: '123 St',
    total_amount: 100,
    order_status: 'pending',
    invoice_path: 'invoice.pdf',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    user_id: 2,
    user_name: 'Bob',
    user_email: 'bob@example.com',
    address: '',
    total_amount: 50,
    order_status: 'placed',
    invoice_path: null,
    created_at: null,
  },
];

function okResponse(data: unknown) {
  return { ok: true, json: () => Promise.resolve(data) } as Response;
}

describe('Orders page', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders orders list', async () => {
    mockFetch.mockResolvedValue(okResponse(orders));

    renderWithProviders(<Orders />, { preloadedState: authedState as never, route: '/admin/orders' });
    await waitFor(() => screen.getByText('Alice'));
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getByText('Download')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getAllByText('—')[0]).toBeInTheDocument();
  });

  it('shows error toast when fetching orders fails', async () => {
    const { toast } = await import('react-toastify');
    mockFetch.mockRejectedValue(new Error('Network error'));
    renderWithProviders(<Orders />, { preloadedState: authedState as never, route: '/admin/orders' });
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load orders');
    });
  });

  it('changes order status', async () => {
    mockFetch
      .mockResolvedValueOnce(okResponse(orders))
      .mockResolvedValueOnce(okResponse({}));

    renderWithProviders(<Orders />, { preloadedState: authedState as never, route: '/admin/orders' });
    await waitFor(() => screen.getByText('Alice'));
    const statusSelect = screen.getByDisplayValue('pending');
    await userEvent.selectOptions(statusSelect, 'delivered');
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/orders/1/status', expect.objectContaining({ method: 'PATCH' }));
    });
  });

  it('shows error toast when status change fails', async () => {
    const { toast } = await import('react-toastify');
    mockFetch
      .mockResolvedValueOnce(okResponse(orders))
      .mockRejectedValueOnce(new Error('Network error'));

    renderWithProviders(<Orders />, { preloadedState: authedState as never, route: '/admin/orders' });
    await waitFor(() => screen.getByText('Alice'));
    const statusSelect = screen.getByDisplayValue('pending');
    await userEvent.selectOptions(statusSelect, 'delivered');
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to update status');
    });
  });

  it('downloads invoice', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(['pdf'])),
      json: () => Promise.resolve(orders),
    } as unknown as Response);

    renderWithProviders(<Orders />, { preloadedState: authedState as never, route: '/admin/orders' });
    await waitFor(() => screen.getByText('Download'));
    await userEvent.click(screen.getByText('Download'));
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/orders/1/invoice', expect.anything());
    });
  });

  it('shows error toast when invoice download fails', async () => {
    const { toast } = await import('react-toastify');
    mockFetch
      .mockResolvedValueOnce(okResponse(orders))
      .mockRejectedValueOnce(new Error('Network error'));

    renderWithProviders(<Orders />, { preloadedState: authedState as never, route: '/admin/orders' });
    await waitFor(() => screen.getByText('Download'));
    await userEvent.click(screen.getByText('Download'));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to download invoice, try again');
    });
  });

  it('deletes an order', async () => {
    mockFetch
      .mockResolvedValueOnce(okResponse(orders))
      .mockResolvedValueOnce(okResponse({}));

    renderWithProviders(<Orders />, { preloadedState: authedState as never, route: '/admin/orders' });
    await waitFor(() => screen.getByText('Alice'));
    await userEvent.click(screen.getAllByText('Delete')[0]);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/orders/1', expect.objectContaining({ method: 'DELETE' }));
    });
  });

  it('does not delete when confirm is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    mockFetch.mockResolvedValueOnce(okResponse(orders));
    renderWithProviders(<Orders />, { preloadedState: authedState as never, route: '/admin/orders' });
    await waitFor(() => screen.getByText('Alice'));
    await userEvent.click(screen.getAllByText('Delete')[0]);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('shows error toast on network error during delete', async () => {
    const { toast } = await import('react-toastify');
    mockFetch
      .mockResolvedValueOnce(okResponse(orders))
      .mockRejectedValueOnce(new Error('Network error'));

    renderWithProviders(<Orders />, { preloadedState: authedState as never, route: '/admin/orders' });
    await waitFor(() => screen.getByText('Alice'));
    await userEvent.click(screen.getAllByText('Delete')[0]);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to delete order');
    });
  });
});
