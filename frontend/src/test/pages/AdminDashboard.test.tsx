import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import AdminDashboard from '../../pages/admin/Dashboard';

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

describe('AdminDashboard page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders admin stats', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          users: [{ id: 1 }, { id: 2 }],
          products: [{ id: 1 }],
          orders: [{ id: 1 }, { id: 2 }, { id: 3 }],
          totalRevenue: 500,
        }),
    } as Response);

    renderWithProviders(<AdminDashboard />, { preloadedState: authedState as never, route: '/admin/dashboard' });
    await waitFor(() => {
      expect(screen.getByText('Total Users')).toBeInTheDocument();
    });
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('$500.00')).toBeInTheDocument();
  });
});
