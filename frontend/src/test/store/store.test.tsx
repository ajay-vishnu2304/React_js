import { describe, it, expect } from 'vitest';
import { store } from '../../store/store';
import { setCredentials } from '../../store/slices/authSlice';

describe('store', () => {
  it('has the configured reducers and can dispatch actions', () => {
    expect(store.getState()).toHaveProperty('auth');
    expect(store.getState()).toHaveProperty('cart');
    expect(store.getState()).toHaveProperty('orders');
    expect(store.getState()).toHaveProperty('quantities');
    expect(store.getState()).toHaveProperty('wishlist');
  });

  it('dispatches setCredentials and updates state', () => {
    const token = `header.${btoa(JSON.stringify({ id: 1, role: 'user' }))}.sig`;
    store.dispatch(setCredentials(token));
    expect(store.getState().auth.isAuthenticated).toBe(true);
  });
});
