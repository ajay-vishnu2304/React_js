import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartState {
  items: CartItem[];
  cartId: number | null;
}

const initialState: CartState = {
  items: [],
  cartId: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart: (
      state,
      action: PayloadAction<{ cartId: number; items: CartItem[] }>,
    ) => {
      state.cartId = action.payload.cartId;
      state.items = action.payload.items;
    },
    clearCart: (state) => {
      state.items = [];
      state.cartId = null;
    },
  },
});

export default cartSlice.reducer;
export const { setCart, clearCart } = cartSlice.actions;
