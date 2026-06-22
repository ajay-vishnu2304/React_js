import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Order {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  address: string;
  total_amount: number;
  order_status: string;
  invoice_path?: string;
  created_at: string;
}

interface OrderState {
  orders: Order[];
}

const initialState: OrderState = {
  orders: [],
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
    },
    updateOrderStatus: (
      state,
      action: PayloadAction<{ id: number; status: string }>,
    ) => {
      const order = state.orders.find((o) => o.id === action.payload.id);
      if (order) order.order_status = action.payload.status;
    },
    removeOrder: (state, action: PayloadAction<number>) => {
      state.orders = state.orders.filter((o) => o.id! != action.payload);
    },
  },
});

export default orderSlice.reducer;
export const { setOrders, updateOrderStatus, removeOrder } = orderSlice.actions;
