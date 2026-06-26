import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface WishlistItem {
  id: number;
  productId: number;
  name?: string;
  price?: number;
  images?: string[];
}

interface WishlistState {
  wishlistId: number | null;
  items: WishlistItem[];
}

const initialState: WishlistState = {
  wishlistId: null,
  items: [],
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    setWishlist: (
      state,
      action: PayloadAction<{ wishlistId?: number; items?: WishlistItem[] }>,
    ) => {
      state.wishlistId = action.payload.wishlistId ?? null;
      state.items = action.payload.items ?? [];
    },
    clearWishlist: (state) => {
      state.items = [];
      state.wishlistId = null;
    },
  },
});

export default wishlistSlice.reducer;
export const { setWishlist, clearWishlist } = wishlistSlice.actions;