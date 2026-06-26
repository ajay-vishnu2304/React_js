import { describe, it, expect } from 'vitest';
import { socket } from '../socket';

describe('socket', () => {
  it('exports a socket instance with expected methods', () => {
    expect(socket).toBeDefined();
    expect(typeof socket.connect).toBe('function');
    expect(typeof socket.disconnect).toBe('function');
  });
});
