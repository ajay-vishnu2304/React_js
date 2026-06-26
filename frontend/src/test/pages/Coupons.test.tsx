import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import Coupons from '../../pages/admin/Coupons';

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

const coupons = [
  {
    id: 1,
    name: 'SAVE10',
    discount_percentage: 10,
    valid_until: '2025-12-31',
    is_active: true,
  },
  {
    id: 2,
    name: 'SAVE20',
    discount_percentage: 20,
    valid_until: '2025-12-31T00:00:00',
    is_active: false,
  },
];

function okResponse(data: unknown) {
  return { ok: true, json: () => Promise.resolve(data) } as Response;
}

describe('Coupons page', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders coupons list', async () => {
    mockFetch.mockResolvedValue(okResponse(coupons));

    renderWithProviders(<Coupons />, { preloadedState: authedState as never, route: '/admin/coupons' });
    await waitFor(() => screen.getByText('SAVE10'));
    expect(screen.getByText('10%')).toBeInTheDocument();
    expect(screen.getByText('SAVE20')).toBeInTheDocument();
  });

  it('shows alert when fetching coupons fails', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    renderWithProviders(<Coupons />, { preloadedState: authedState as never, route: '/admin/coupons' });
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to load coupons');
    });
  });

  it('adds a new coupon', async () => {
    mockFetch
      .mockResolvedValueOnce(okResponse(coupons))
      .mockResolvedValueOnce(okResponse({ id: 2 }))
      .mockResolvedValueOnce(okResponse([...coupons, { id: 2, name: 'SAVE20', discount_percentage: 20, valid_until: '2025-12-31', is_active: true }]));

    const { container } = renderWithProviders(<Coupons />, { preloadedState: authedState as never, route: '/admin/coupons' });
    await waitFor(() => screen.getByText('SAVE10'));
    await userEvent.click(screen.getByText('+ Add Coupon'));

    await userEvent.type(screen.getByPlaceholderText('Coupon name (e.g. SUMMER10)'), 'SAVE20');
    await userEvent.type(screen.getByPlaceholderText('Discount % (e.g. 10)'), '20');
    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement;
    await userEvent.type(dateInput, '2025-12-31');
    await userEvent.click(screen.getByText('Add'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/coupons', expect.objectContaining({ method: 'POST' }));
    });
  });

  it('edits an existing coupon', async () => {
    mockFetch
      .mockResolvedValueOnce(okResponse(coupons))
      .mockResolvedValueOnce(okResponse({ id: 1 }))
      .mockResolvedValueOnce(okResponse(coupons));

    renderWithProviders(<Coupons />, { preloadedState: authedState as never, route: '/admin/coupons' });
    await waitFor(() => screen.getByText('SAVE10'));

    await userEvent.click(screen.getAllByText('Edit')[0]);

    expect(screen.getByText('Edit Coupon')).toBeInTheDocument();
    const nameInput = screen.getByPlaceholderText('Coupon name (e.g. SUMMER10)') as HTMLInputElement;
    expect(nameInput).toHaveValue('SAVE10');

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'SAVE15');
    await userEvent.click(screen.getByText('Update'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/coupons/1', expect.objectContaining({ method: 'PATCH' }));
    });
  });

  it('shows error toast on network failure during save', async () => {
    const { toast } = await import('react-toastify');
    mockFetch
      .mockResolvedValueOnce(okResponse(coupons))
      .mockRejectedValueOnce(new Error('Network error'));

    const { container } = renderWithProviders(<Coupons />, { preloadedState: authedState as never, route: '/admin/coupons' });
    await waitFor(() => screen.getByText('SAVE10'));
    await userEvent.click(screen.getByText('+ Add Coupon'));

    await userEvent.type(screen.getByPlaceholderText('Coupon name (e.g. SUMMER10)'), 'X');
    await userEvent.type(screen.getByPlaceholderText('Discount % (e.g. 10)'), '10');
    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement;
    await userEvent.type(dateInput, '2025-12-31');
    await userEvent.click(screen.getByText('Add'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error. Please try again.');
    });
  });

  it('deletes a coupon', async () => {
    mockFetch
      .mockResolvedValueOnce(okResponse(coupons))
      .mockResolvedValueOnce(okResponse({}))
      .mockResolvedValueOnce(okResponse([]));

    renderWithProviders(<Coupons />, { preloadedState: authedState as never, route: '/admin/coupons' });
    await waitFor(() => screen.getByText('SAVE10'));
    await userEvent.click(screen.getAllByText('Delete')[0]);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/coupons/1', expect.objectContaining({ method: 'DELETE' }));
    });
  });

  it('does not delete when confirm is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    mockFetch.mockResolvedValueOnce(okResponse(coupons));
    renderWithProviders(<Coupons />, { preloadedState: authedState as never, route: '/admin/coupons' });
    await waitFor(() => screen.getByText('SAVE10'));
    await userEvent.click(screen.getAllByText('Delete')[0]);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('shows error toast on network error during delete', async () => {
    const { toast } = await import('react-toastify');
    mockFetch
      .mockResolvedValueOnce(okResponse(coupons))
      .mockRejectedValueOnce(new Error('Network error'));

    renderWithProviders(<Coupons />, { preloadedState: authedState as never, route: '/admin/coupons' });
    await waitFor(() => screen.getByText('SAVE10'));
    await userEvent.click(screen.getAllByText('Delete')[0]);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error. Please try again.');
    });
  });

  it('changes coupon status via select dropdown', async () => {
    mockFetch
      .mockResolvedValueOnce(okResponse(coupons))
      .mockResolvedValueOnce(okResponse({}))
      .mockResolvedValueOnce(okResponse(coupons));

    renderWithProviders(<Coupons />, { preloadedState: authedState as never, route: '/admin/coupons' });
    await waitFor(() => screen.getByText('SAVE10'));
    const statusSelect = screen.getByDisplayValue('Active');
    await userEvent.selectOptions(statusSelect, 'false');
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/coupons/1', expect.objectContaining({ method: 'PATCH' }));
    });
  });

  it('shows error toast when status update fails', async () => {
    const { toast } = await import('react-toastify');
    mockFetch
      .mockResolvedValueOnce(okResponse(coupons))
      .mockRejectedValueOnce(new Error('Network error'));

    renderWithProviders(<Coupons />, { preloadedState: authedState as never, route: '/admin/coupons' });
    await waitFor(() => screen.getByText('SAVE10'));
    const statusSelect = screen.getByDisplayValue('Active');
    await userEvent.selectOptions(statusSelect, 'false');
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to update status');
    });
  });

  it('closes modal when Cancel button clicked', async () => {
    mockFetch.mockResolvedValueOnce(okResponse(coupons));
    renderWithProviders(<Coupons />, { preloadedState: authedState as never, route: '/admin/coupons' });
    await waitFor(() => screen.getByText('SAVE10'));
    await userEvent.click(screen.getByText('+ Add Coupon'));
    expect(screen.getByText('Add Coupon')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Add Coupon')).not.toBeInTheDocument();
  });

  it('closes modal when clicking on overlay', async () => {
    mockFetch.mockResolvedValueOnce(okResponse(coupons));
    renderWithProviders(<Coupons />, { preloadedState: authedState as never, route: '/admin/coupons' });
    await waitFor(() => screen.getByText('SAVE10'));
    await userEvent.click(screen.getByText('+ Add Coupon'));
    const overlay = document.querySelector('.modal-overlay') as HTMLElement;
    await userEvent.click(overlay);
    expect(screen.queryByText('Add Coupon')).not.toBeInTheDocument();
  });

  it('toggles active checkbox in the form', async () => {
    mockFetch.mockResolvedValueOnce(okResponse(coupons));
    const { container } = renderWithProviders(<Coupons />, { preloadedState: authedState as never, route: '/admin/coupons' });
    await waitFor(() => screen.getByText('SAVE10'));
    await userEvent.click(screen.getByText('+ Add Coupon'));
    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(checkbox).toBeChecked();
    await userEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });
});
