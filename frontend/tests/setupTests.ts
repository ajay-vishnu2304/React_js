import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

const globalObj = globalThis as unknown as { 
  TextEncoder: typeof TextEncoder; 
  TextDecoder: typeof TextDecoder; 
  fetch?: jest.Mock;
};

globalObj.TextEncoder = TextEncoder;
globalObj.TextDecoder = TextDecoder;

// Mock Vite's import.meta.env for Jest
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        VITE_API_URL: 'http://localhost:5000/api',
        // Add other VITE_ env variables as needed
      },
    },
  },
  writable: true,
  configurable: true,
});

// Suppress known act(...) warnings from async error paths and resize listeners
// (these are hard to fully eliminate without major test refactors and are non-fatal)
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    const msg = args[0];
    if (typeof msg === 'string' && msg.includes('not wrapped in act')) {
      return; // suppress only the known testing noise
    }
    originalConsoleError(...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
});
