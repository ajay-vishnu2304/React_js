import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import UserLayout from '../../layouts/UserLayout';

describe('UserLayout', () => {
  it('renders navbar and main content outlet', () => {
    renderWithProviders(<UserLayout />, {
      preloadedState: {
        auth: {
          user: null,
          token: null,
          isAuthenticated: false,
          isAdmin: false,
        },
      } as never,
      route: '/dashboard',
    });
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });
});
