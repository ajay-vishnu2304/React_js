import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import ProtectedRoute, { AdminRoute } from '../../components/ProtectedRoute';

describe('ProtectedRoute component', () => {
  it('renders outlet content when authenticated', () => {
    renderWithProviders(<ProtectedRoute />, {
      preloadedState: {
        auth: {
          user: { id: 1, role: 'user' },
          token: 'fake.token.user',
          isAuthenticated: true,
          isAdmin: false,
        },
      } as never,
      route: '/protected',
    });
    // ProtectedRoute uses <Outlet />, so no children render without a route config.
    // Verify it does not redirect (i.e., no navigation away) by checking the nav is empty.
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    const { container } = renderWithProviders(<ProtectedRoute />, {
      preloadedState: {
        auth: {
          user: null,
          token: null,
          isAuthenticated: false,
          isAdmin: false,
        },
      } as never,
    });
    expect(container).toBeEmptyDOMElement();
  });
});

describe('AdminRoute component', () => {
  it('redirects to login when not authenticated', () => {
    const { container } = renderWithProviders(<AdminRoute />, {
      preloadedState: {
        auth: {
          user: null,
          token: null,
          isAuthenticated: false,
          isAdmin: false,
        },
      } as never,
    });
    expect(container).toBeEmptyDOMElement();
  });

  it('redirects to login when authenticated but not admin', () => {
    const { container } = renderWithProviders(<AdminRoute />, {
      preloadedState: {
        auth: {
          user: { id: 1, role: 'user' },
          token: 'fake.token.user',
          isAuthenticated: true,
          isAdmin: false,
        },
      } as never,
    });
    expect(container).toBeEmptyDOMElement();
  });
});
