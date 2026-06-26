import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatBox, { type Message } from '../../components/ChatBox';

const messages: Message[] = [
  { id: 1, sender_role: 'user', content: 'Hello there', created_at: '2024-01-01' },
  { id: 2, sender_role: 'admin', content: 'Hi, how can I help?', created_at: '2024-01-01' },
];

describe('ChatBox component', () => {
  it('shows empty message when no messages', () => {
    render(
      <ChatBox messages={[]} onSend={vi.fn()} placeholder="Type..." rightRole="user" />
    );
    expect(screen.getByText('Chat empty')).toBeInTheDocument();
  });

  it('renders all messages', () => {
    render(
      <ChatBox messages={messages} onSend={vi.fn()} placeholder="Type..." rightRole="user" />
    );
    expect(screen.getByText('Hello there')).toBeInTheDocument();
    expect(screen.getByText('Hi, how can I help?')).toBeInTheDocument();
  });

  it('calls onSend with trimmed input when Send is clicked', async () => {
    const onSend = vi.fn();
    render(
      <ChatBox messages={[]} onSend={onSend} placeholder="Type..." rightRole="user" />
    );
    await userEvent.type(screen.getByPlaceholderText('Type...'), '  hello  ');
    await userEvent.click(screen.getByText('Send'));
    expect(onSend).toHaveBeenCalledWith('hello');
  });

  it('does not call onSend when input is empty', async () => {
    const onSend = vi.fn();
    render(
      <ChatBox messages={[]} onSend={onSend} placeholder="Type..." rightRole="user" />
    );
    await userEvent.click(screen.getByText('Send'));
    expect(onSend).not.toHaveBeenCalled();
  });

  it('clears the input after sending', async () => {
    const onSend = vi.fn();
    render(
      <ChatBox messages={[]} onSend={onSend} placeholder="Type..." rightRole="user" />
    );
    const input = screen.getByPlaceholderText('Type...') as HTMLInputElement;
    await userEvent.type(input, 'hello');
    await userEvent.click(screen.getByText('Send'));
    expect(input.value).toBe('');
  });

  it('sends on Enter key press', async () => {
    const onSend = vi.fn();
    render(
      <ChatBox messages={[]} onSend={onSend} placeholder="Type..." rightRole="user" />
    );
    await userEvent.type(screen.getByPlaceholderText('Type...'), 'hi{Enter}');
    expect(onSend).toHaveBeenCalledWith('hi');
  });
});
