import { describe, it, expect } from 'vitest';
import quantityReducer, { incQty, decQty } from '../../store/slices/quantitySlice';

describe('quantitySlice reducer', () => {
  it('has an empty initial state', () => {
    const state = quantityReducer(undefined, { type: 'unknown' });
    expect(state.byProduct).toEqual({});
  });

  it('increments quantity up to the max', () => {
    let state = quantityReducer(undefined, incQty({ id: 1, max: 5 }));
    expect(state.byProduct[1]).toBe(2);
    state = quantityReducer(state, incQty({ id: 1, max: 2 }));
    expect(state.byProduct[1]).toBe(2);
  });

  it('decrements quantity down to a minimum of 1', () => {
    let state = quantityReducer(undefined, incQty({ id: 1, max: 5 }));
    expect(state.byProduct[1]).toBe(2);
    state = quantityReducer(state, decQty({ id: 1 }));
    expect(state.byProduct[1]).toBe(1);
    state = quantityReducer(state, decQty({ id: 1 }));
    expect(state.byProduct[1]).toBe(1);
  });
});
