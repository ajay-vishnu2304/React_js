import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

const globalObj = globalThis as unknown as { TextEncoder: typeof TextEncoder; TextDecoder: typeof TextDecoder };
globalObj.TextEncoder = TextEncoder;
globalObj.TextDecoder = TextDecoder;
