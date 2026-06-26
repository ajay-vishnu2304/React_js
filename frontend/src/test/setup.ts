import '@testing-library/jest-dom/vitest';
import { vi, beforeEach } from 'vitest';

const mockSocket = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
};

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket),
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

Object.defineProperty(window, 'confirm', { value: vi.fn(() => true), writable: true });
Object.defineProperty(window, 'alert', { value: vi.fn(), writable: true });
Object.defineProperty(window, 'scrollTo', { value: vi.fn(), writable: true });
Object.defineProperty(window.URL, 'createObjectURL', { value: vi.fn(() => 'blob:mock'), writable: true });
Object.defineProperty(window.URL, 'revokeObjectURL', { value: vi.fn(), writable: true });

export { mockSocket };
