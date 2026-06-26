import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import Users from '../../pages/admin/Users';

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

const users = [
  { id: 1, name: 'Alice', email: 'alice@example.com', role: 'user', created_at: '2024-01-01' },
  { id: 2, name: 'Bob', email: 'bob@example.com', role: 'admin', created_at: '2024-01-02' },
];

function okResponse(data: unknown) {
  return { ok: true, json: () => Promise.resolve(data) } as Response;
}

describe('Users page', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders users list', async () => {
    mockFetch.mockResolvedValue(okResponse(users));

    renderWithProviders(<Users />, { preloadedState: authedState as never, route: '/admin/users' });
    await waitFor(() => screen.getByText('Alice'));
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('shows alert when fetching users fails', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    renderWithProviders(<Users />, { preloadedState: authedState as never, route: '/admin/users' });
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to load users. Please check if you\'re logged in as admin.');
    });
  });

  it('adds a new user', async () => {
    mockFetch
      .mockResolvedValueOnce(okResponse(users))
      .mockResolvedValueOnce(okResponse({}))
      .mockResolvedValueOnce(okResponse([...users, { id: 3, name: 'Carol', email: 'carol@example.com', role: 'user', created_at: '2024-01-03' }]));

    renderWithProviders(<Users />, { preloadedState: authedState as never, route: '/admin/users' });
    await waitFor(() => screen.getByText('Alice'));
    await userEvent.click(screen.getByText('+ Add User'));

    await userEvent.type(screen.getByPlaceholderText('Name'), 'Carol');
    await userEvent.type(screen.getByPlaceholderText('Email'), 'carol@example.com');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'password');
    await userEvent.click(screen.getByText('Add'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/users', expect.objectContaining({ method: 'POST' }));
    });
  });

  it('selects admin role when adding a user', async () => {
    mockFetch
      .mockResolvedValueOnce(okResponse(users))
      .mockResolvedValueOnce(okResponse({}))
      .mockResolvedValueOnce(okResponse(users));

    renderWithProviders(<Users />, { preloadedState: authedState as never, route: '/admin/users' });
    await waitFor(() => screen.getByText('Alice'));
    await userEvent.click(screen.getByText('+ Add User'));

    await userEvent.type(screen.getByPlaceholderText('Name'), 'Dan');
    await userEvent.type(screen.getByPlaceholderText('Email'), 'dan@example.com');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'password');
    // The modal's role select is the first one (modal renders before the table)
    const roleSelect = screen.getAllByDisplayValue('user')[0];
    await userEvent.selectOptions(roleSelect, 'admin');
    await userEvent.click(screen.getByText('Add'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/users', expect.objectContaining({
        body: JSON.stringify({ email: 'dan@example.com', first_name: 'Dan', password: 'password', role: 'admin' }),
      }));
    });
  });

  it('changes user role', async () => {
    mockFetch
      .mockResolvedValueOnce(okResponse(users))
      .mockResolvedValueOnce(okResponse({}))
      .mockResolvedValueOnce(okResponse([{ ...users[0], role: 'admin' }]));

    renderWithProviders(<Users />, { preloadedState: authedState as never, route: '/admin/users' });
    await waitFor(() => screen.getByText('Alice'));
    const roleSelect = screen.getAllByDisplayValue('user')[0];
    await userEvent.selectOptions(roleSelect, 'admin');
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/users/1', expect.objectContaining({ method: 'PATCH' }));
    });
  });

  it('shows alert on network error during role change', async () => {
    mockFetch
      .mockResolvedValueOnce(okResponse(users))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(okResponse(users));

    renderWithProviders(<Users />, { preloadedState: authedState as never, route: '/admin/users' });
    await waitFor(() => screen.getByText('Alice'));
    const roleSelect = screen.getAllByDisplayValue('user')[0];
    await userEvent.selectOptions(roleSelect, 'admin');
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Network error. Please try again.');
    });
  });

  it('deletes a user', async () => {
    mockFetch
      .mockResolvedValueOnce(okResponse(users))
      .mockResolvedValueOnce(okResponse({}))
      .mockResolvedValueOnce(okResponse([users[1]]));

    renderWithProviders(<Users />, { preloadedState: authedState as never, route: '/admin/users' });
    await waitFor(() => screen.getByText('Alice'));
    await userEvent.click(screen.getAllByText('Delete')[0]);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/users/1', expect.objectContaining({ method: 'DELETE' }));
    });
  });

  it('does not delete when confirm is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    mockFetch.mockResolvedValueOnce(okResponse(users));
    renderWithProviders(<Users />, { preloadedState: authedState as never, route: '/admin/users' });
    await waitFor(() => screen.getByText('Alice'));
    await userEvent.click(screen.getAllByText('Delete')[0]);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('shows alert on network error during delete', async () => {
    mockFetch
      .mockResolvedValueOnce(okResponse(users))
      .mockRejectedValueOnce(new Error('Network error'));

    renderWithProviders(<Users />, { preloadedState: authedState as never, route: '/admin/users' });
    await waitFor(() => screen.getByText('Alice'));
    await userEvent.click(screen.getAllByText('Delete')[0]);
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Network error. Please try again.');
    });
  });

  it('closes modal when Cancel button clicked', async () => {
    mockFetch.mockResolvedValueOnce(okResponse(users));
    renderWithProviders(<Users />, { preloadedState: authedState as never, route: '/admin/users' });
    await waitFor(() => screen.getByText('Alice'));
    await userEvent.click(screen.getByText('+ Add User'));
    expect(screen.getByText('Add User')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Add User')).not.toBeInTheDocument();
  });

  it('closes modal when clicking on overlay', async () => {
    mockFetch.mockResolvedValueOnce(okResponse(users));
    renderWithProviders(<Users />, { preloadedState: authedState as never, route: '/admin/users' });
    await waitFor(() => screen.getByText('Alice'));
    await userEvent.click(screen.getByText('+ Add User'));
    const overlay = document.querySelector('.modal-overlay') as HTMLElement;
    await userEvent.click(overlay);
    expect(screen.queryByText('Add User')).not.toBeInTheDocument();
  });
});
