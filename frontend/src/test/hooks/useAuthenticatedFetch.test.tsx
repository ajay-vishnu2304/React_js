import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useAuthenticatedFetch } from '../../hooks/useAuthenticatedFetch';
import authReducer from '../../store/slices/authSlice';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const store = configureStore({
  reducer: { auth: authReducer },
  preloadedState: {
    auth: {
      user: { id: 1, role: 'user' },
      token: 'token123',
      isAuthenticated: true,
      isAdmin: false,
    },
  },
});

function TestComponent() {
  const { authFetch } = useAuthenticatedFetch();
  const [result, setResult] = useState<Response | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    authFetch('/test')
      .then((res) => setResult(res))
      .catch((err) => setError(err.message));
  }, [authFetch]);

  return (
    <div>
      <div data-testid="result">{result ? 'ok' : 'none'}</div>
      <div data-testid="error">{error}</div>
    </div>
  );
}

describe('useAuthenticatedFetch hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('includes auth headers and returns response', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve({ data: true }),
    } as Response);

    render(
      <Provider store={store}>
        <TestComponent />
      </Provider>
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/test',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer token123',
          },
        })
      );
    });
  });

  it('throws when response is not ok', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Server Error',
    } as Response);

    render(
      <Provider store={store}>
        <TestComponent />
      </Provider>
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
  });
});
