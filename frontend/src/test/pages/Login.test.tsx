import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import Login from '../../pages/auth/Login';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function makeToken(role: string) {
  const payload = btoa(JSON.stringify({ id: 1, role }));
  return `header.${payload}.signature`;
}

describe('Login page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('atob', (str: string) => atob(str));
  });

  it('renders the Login title and form fields', () => {
    renderWithProviders(<Login />);
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
  });

  it('renders a link to signup', () => {
    renderWithProviders(<Login />);
    expect(screen.getByText('Signup').closest('a')).toHaveAttribute('href', '/signup');
  });

  it('shows loading text on submit', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ token: makeToken('user') }),
    } as Response);

    renderWithProviders(<Login />);
    await userEvent.type(screen.getByPlaceholderText('Enter your email'), 'test@test.com');
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'password');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/auth/login', expect.any(Object));
    });
  });

  it('shows error message on failed login', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Invalid credentials' }),
    } as Response);

    renderWithProviders(<Login />);
    await userEvent.type(screen.getByPlaceholderText('Enter your email'), 'test@test.com');
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('calls the login API with correct payload', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ token: makeToken('user') }),
    } as Response);

    renderWithProviders(<Login />);
    await userEvent.type(screen.getByPlaceholderText('Enter your email'), 'a@b.com');
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'pass123');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });
  });

});
