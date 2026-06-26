import { describe, it, expect } from 'vitest';
import orderReducer, {
  setOrders,
  updateOrderStatus,
  removeOrder,
  type Order,
} from '../../store/slices/orderSlice';

const sampleOrders: Order[] = [
  {
    id: 1,
    user_id: 1,
    user_name: 'Alice',
    user_email: 'alice@example.com',
    address: '123 St',
    total_amount: 100,
    order_status: 'pending',
    created_at: '2024-01-01',
  },
  {
    id: 2,
    user_id: 2,
    user_name: 'Bob',
    user_email: 'bob@example.com',
    address: '456 Ave',
    total_amount: 200,
    order_status: 'placed',
    created_at: '2024-01-02',
  },
];

describe('orderSlice reducer', () => {
  it('has an empty initial state', () => {
    const state = orderReducer(undefined, { type: 'unknown' });
    expect(state.orders).toEqual([]);
  });

  it('setOrders replaces the order list', () => {
    const state = orderReducer(undefined, setOrders(sampleOrders));
    expect(state.orders).toHaveLength(2);
    expect(state.orders[0].user_name).toBe('Alice');
  });

  it('updateOrderStatus changes the status of an order', () => {
    let state = orderReducer(undefined, setOrders(sampleOrders));
    state = orderReducer(state, updateOrderStatus({ id: 1, status: 'delivered' }));
    expect(state.orders.find((o) => o.id === 1)?.order_status).toBe('delivered');
  });

  it('removeOrder filters out the order', () => {
    let state = orderReducer(undefined, setOrders(sampleOrders));
    state = orderReducer(state, removeOrder(1));
    expect(state.orders).toHaveLength(1);
    expect(state.orders[0].id).toBe(2);
  });
});
