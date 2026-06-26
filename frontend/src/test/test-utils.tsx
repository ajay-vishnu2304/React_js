import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import type { RootState } from '../store/store';
import authReducer from '../store/slices/authSlice';
import cartReducer from '../store/slices/cartSlice';
import orderReducer from '../store/slices/orderSlice';
import quantityReducer from '../store/slices/quantitySlice';
import wishlistReducer from '../store/slices/wishlistSlice';

interface RenderWithProvidersOptions {
  preloadedState?: RootState;
  route?: string;
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState,
    route = '/',
  }: RenderWithProvidersOptions = {}
) {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      cart: cartReducer,
      orders: orderReducer,
      quantities: quantityReducer,
      wishlist: wishlistReducer,
    },
    preloadedState,
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper }) };
}
