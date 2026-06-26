import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import { mockSocket } from '../setup';
import Support from '../../pages/admin/Support';

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

const messages = [
  { id: 1, sender_role: 'user', content: 'Help', created_at: '2024-01-01', user_id: 5, username: 'Alice' },
];

describe('Support page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads messages and shows user list', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(messages),
    } as Response);

    renderWithProviders(<Support />, { preloadedState: authedState as never, route: '/admin/support' });
    await waitFor(() => screen.getByText('Alice'));
    expect(screen.getByText('Select a user to chat')).toBeInTheDocument();
  });

  it('selects a user and sends an admin reply', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(messages),
    } as Response);

    renderWithProviders(<Support />, { preloadedState: authedState as never, route: '/admin/support' });
    await waitFor(() => screen.getByText('Alice'));
    await userEvent.click(screen.getByText('Alice'));
    await waitFor(() => screen.getByText('Help'));

    const input = screen.getByPlaceholderText('Reply...');
    await userEvent.type(input, 'Hi there');
    await userEvent.click(screen.getByText('Send'));
    expect(mockSocket.emit).toHaveBeenCalledWith('admin-message', { userId: '5', content: 'Hi there' });
  });
});
