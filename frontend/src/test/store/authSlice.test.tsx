import { describe, it, expect, beforeEach } from 'vitest';
import authReducer, { setCredentials, logout } from '../../store/slices/authSlice';

function makeToken(role: string) {
  const payload = btoa(JSON.stringify({ id: 1, role }));
  return `header.${payload}.signature`;
}

describe('authSlice reducer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should have initial logged-out state when no token in localStorage', () => {
    localStorage.removeItem('token');
    const state = authReducer(undefined, { type: 'unknown' });
    expect(state.isAuthenticated).toBe(false);
    expect(state.isAdmin).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('setCredentials sets user, token and isAuthenticated for a user', () => {
    const token = makeToken('user');
    const state = authReducer(undefined, setCredentials(token));
    expect(state.isAuthenticated).toBe(true);
    expect(state.isAdmin).toBe(false);
    expect(state.token).toBe(token);
    expect(state.user).toEqual({ id: 1, role: 'user' });
    expect(localStorage.getItem('token')).toBe(token);
  });

  it('setCredentials sets isAdmin true for admin role', () => {
    const token = makeToken('admin');
    const state = authReducer(undefined, setCredentials(token));
    expect(state.isAdmin).toBe(true);
    expect(state.user).toEqual({ id: 1, role: 'admin' });
  });

  it('setCredentials does nothing for an invalid token', () => {
    const state = authReducer(undefined, setCredentials('invalid.token'));
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
  });

  it('logout clears all auth state and localStorage', () => {
    const token = makeToken('user');
    let state = authReducer(undefined, setCredentials(token));
    state = authReducer(state, logout());
    expect(state.isAuthenticated).toBe(false);
    expect(state.isAdmin).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });
});
