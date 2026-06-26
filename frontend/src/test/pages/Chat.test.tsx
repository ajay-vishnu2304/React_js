import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import { mockSocket } from '../setup';
import Chat from '../../pages/chat/Chat';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const authedState = {
  auth: {
    user: { id: 1, role: 'user' },
    token: 'token',
    isAuthenticated: true,
    isAdmin: false,
  },
};

const messages = [
  { id: 1, sender_role: 'user', content: 'Hello', created_at: '2024-01-01' },
];

describe('Chat page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads history and connects socket', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(messages),
    } as Response);

    renderWithProviders(<Chat />, { preloadedState: authedState as never, route: '/chat' });
    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });
    expect(mockSocket.connect).toHaveBeenCalled();
  });

  it('sends a user message', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);

    renderWithProviders(<Chat />, { preloadedState: authedState as never, route: '/chat' });
    const input = screen.getByPlaceholderText('Type a message...');
    await userEvent.type(input, 'hello');
    await userEvent.click(screen.getByText('Send'));
    expect(mockSocket.emit).toHaveBeenCalledWith('user-message', { content: 'hello' });
  });
});
