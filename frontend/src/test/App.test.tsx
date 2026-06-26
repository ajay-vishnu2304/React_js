import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import App from '../App';
import authReducer from '../store/slices/authSlice';
import cartReducer from '../store/slices/cartSlice';
import orderReducer from '../store/slices/orderSlice';
import quantityReducer from '../store/slices/quantitySlice';
import wishlistReducer from '../store/slices/wishlistSlice';

function makeStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      cart: cartReducer,
      orders: orderReducer,
      quantities: quantityReducer,
      wishlist: wishlistReducer,
    },
  });
}

function renderApp(route = '/login') {
  window.history.pushState({}, '', route);
  return render(
    <Provider store={makeStore()}>
      <App />
    </Provider>
  );
}

describe('App routing', () => {
  it('renders the login route', () => {
    renderApp('/login');
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
  });

  it('renders the signup route', () => {
    renderApp('/signup');
    expect(screen.getByRole('heading', { name: 'Signup' })).toBeInTheDocument();
  });

  it('renders the not found route for unknown paths', () => {
    renderApp('/unknown');
    expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument();
  });
});
