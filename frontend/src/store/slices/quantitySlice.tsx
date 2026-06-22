import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface QuantityState {
  byProduct: Record<number, number>;
}

const initialState: QuantityState = {
  byProduct: {},
};

const quantitySlice = createSlice({
  name: "quantities",
  initialState,
  reducers: {
    incQty: (state, action: PayloadAction<{ id: number; max: number }>) => {
      const current = state.byProduct[action.payload.id] ?? 1;
      state.byProduct[action.payload.id] = Math.min(
        action.payload.max,
        current + 1,
      );
    },
    decQty: (state, action: PayloadAction<{ id: number }>) => {
      const current = state.byProduct[action.payload.id] ?? 1;
      state.byProduct[action.payload.id] = Math.max(1, current - 1);
    },
  },
});

export default quantitySlice.reducer;
export const { incQty, decQty } = quantitySlice.actions;
