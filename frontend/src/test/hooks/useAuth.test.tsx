import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { useAuth } from '../../hooks/useAuth';
import { renderWithProviders } from '../test-utils';

function AuthLabel() {
  const auth = useAuth();
  return <div data-testid="auth">{auth.isAuthenticated ? 'authenticated' : 'guest'}</div>;
}

describe('useAuth hook', () => {
  it('returns authenticated state', () => {
    renderWithProviders(<AuthLabel />, {
      preloadedState: {
        auth: {
          user: { id: 1, role: 'user' },
          token: 'token',
          isAuthenticated: true,
          isAdmin: false,
        },
      } as never,
    });
    expect(screen.getByTestId('auth')).toHaveTextContent('authenticated');
  });

  it('returns guest state', () => {
    renderWithProviders(<AuthLabel />, {
      preloadedState: {
        auth: {
          user: null,
          token: null,
          isAuthenticated: false,
          isAdmin: false,
        },
      } as never,
    });
    expect(screen.getByTestId('auth')).toHaveTextContent('guest');
  });
});
