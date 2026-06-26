import { describe, it, expect } from 'vitest';
import wishlistReducer, {
  setWishlist,
  clearWishlist,
  type WishlistItem,
} from '../../store/slices/wishlistSlice';

const sampleItems: WishlistItem[] = [
  { id: 1, productId: 10, name: 'Shirt', price: 20 },
  { id: 2, productId: 20, name: 'Pants', price: 30 },
];

describe('wishlistSlice reducer', () => {
  it('has an empty initial state', () => {
    const state = wishlistReducer(undefined, { type: 'unknown' });
    expect(state.items).toEqual([]);
    expect(state.wishlistId).toBeNull();
  });

  it('setWishlist sets items and wishlistId', () => {
    const state = wishlistReducer(
      undefined,
      setWishlist({ wishlistId: 5, items: sampleItems })
    );
    expect(state.wishlistId).toBe(5);
    expect(state.items).toHaveLength(2);
  });

  it('setWishlist defaults missing fields', () => {
    const state = wishlistReducer(undefined, setWishlist({}));
    expect(state.wishlistId).toBeNull();
    expect(state.items).toEqual([]);
  });

  it('clearWishlist resets state', () => {
    let state = wishlistReducer(
      undefined,
      setWishlist({ wishlistId: 5, items: sampleItems })
    );
    state = wishlistReducer(state, clearWishlist());
    expect(state.items).toEqual([]);
    expect(state.wishlistId).toBeNull();
  });
});
