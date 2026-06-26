import { describe, it, expect } from 'vitest';
import cartReducer, { setCart, clearCart, type CartItem } from '../../store/slices/cartSlice';

const items: CartItem[] = [
  { id: 1, productId: 10, name: 'Shirt', price: 20, quantity: 2 },
  { id: 2, productId: 20, name: 'Pants', price: 30, quantity: 1 },
];

describe('cartSlice reducer', () => {
  it('should have an empty initial state', () => {
    const state = cartReducer(undefined, { type: 'unknown' });
    expect(state.items).toEqual([]);
    expect(state.cartId).toBeNull();
  });

  it('setCart sets items and cartId', () => {
    const state = cartReducer(undefined, setCart({ cartId: 5, items }));
    expect(state.cartId).toBe(5);
    expect(state.items).toHaveLength(2);
    expect(state.items[0].name).toBe('Shirt');
  });

  it('setCart defaults cartId and items when not provided', () => {
    const state = cartReducer(undefined, setCart({}));
    expect(state.cartId).toBeNull();
    expect(state.items).toEqual([]);
  });

  it('setCart replaces existing items', () => {
    let state = cartReducer(undefined, setCart({ cartId: 5, items }));
    state = cartReducer(state, setCart({ items: [items[0]] }));
    expect(state.items).toHaveLength(1);
  });

  it('clearCart resets items and cartId', () => {
    let state = cartReducer(undefined, setCart({ cartId: 5, items }));
    state = cartReducer(state, clearCart());
    expect(state.items).toEqual([]);
    expect(state.cartId).toBeNull();
  });
});
