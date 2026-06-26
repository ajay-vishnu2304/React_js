import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import Signup from '../../pages/auth/Signup';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('Signup page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the Signup title and form fields', () => {
    renderWithProviders(<Signup />);
    expect(screen.getByText('Signup')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
  });

  it('renders a link to login', () => {
    renderWithProviders(<Signup />);
    expect(screen.getByText('Login').closest('a')).toHaveAttribute('href', '/login');
  });

  it('shows error message on failed signup', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Email already exists' }),
    } as Response);

    renderWithProviders(<Signup />);
    await userEvent.type(screen.getByPlaceholderText('Enter your name'), 'John');
    await userEvent.type(screen.getByPlaceholderText('Enter your email'), 'john@test.com');
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'pass123');
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });
  });

  it('calls the register API with correct payload', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);

    renderWithProviders(<Signup />);
    await userEvent.type(screen.getByPlaceholderText('Enter your name'), 'John');
    await userEvent.type(screen.getByPlaceholderText('Enter your email'), 'john@test.com');
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'pass123');
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/auth/register',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            username: 'John',
            email: 'john@test.com',
            password: 'pass123',
          }),
        }),
      );
    });
  });

  it('shows server error on network failure', async () => {
    mockFetch.mockRejectedValue(new Error('Network failure'));

    renderWithProviders(<Signup />);
    await userEvent.type(screen.getByPlaceholderText('Enter your name'), 'John');
    await userEvent.type(screen.getByPlaceholderText('Enter your email'), 'john@test.com');
    await userEvent.type(screen.getByPlaceholderText('Enter your password'), 'pass123');
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText('Server error. Please try again.')).toBeInTheDocument();
    });
  });
});
