import {configureStore} from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice"
import cartReducer from "./slices/cartSlice"
import orderReducer from "./slices/orderSlice"
import quantityReducer from "./slices/quantitySlice"

export const store = configureStore({
    reducer:{
        auth:authReducer,
        cart:cartReducer,
        orders:orderReducer,
        quantities:quantityReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch