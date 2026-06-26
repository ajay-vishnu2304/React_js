import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import AdminLayout from '../../layouts/AdminLayout';

const authState = {
  auth: {
    user: null,
    token: null,
    isAuthenticated: false,
    isAdmin: false,
  },
};

describe('AdminLayout', () => {
  it('renders the admin layout elements', () => {
    renderWithProviders(<AdminLayout />, {
      preloadedState: authState as never,
      route: '/admin/dashboard',
    });
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
  });

  it('opens the sidebar when hamburger is clicked', async () => {
    renderWithProviders(<AdminLayout />, {
      preloadedState: authState as never,
      route: '/admin/dashboard',
    });
    const sidebar = document.querySelector('.sidebar') as HTMLElement;
    expect(sidebar).not.toHaveClass('open');
    await userEvent.click(screen.getByLabelText('Open menu'));
    expect(sidebar).toHaveClass('open');
  });

  it('closes the sidebar when overlay is clicked', async () => {
    renderWithProviders(<AdminLayout />, {
      preloadedState: authState as never,
      route: '/admin/dashboard',
    });
    await userEvent.click(screen.getByLabelText('Open menu'));
    const sidebar = document.querySelector('.sidebar') as HTMLElement;
    expect(sidebar).toHaveClass('open');

    const overlay = document.querySelector('.sidebar-overlay') as HTMLElement;
    await userEvent.click(overlay);
    expect(sidebar).not.toHaveClass('open');
  });

  it('closes the sidebar when a sidebar link is clicked', async () => {
    renderWithProviders(<AdminLayout />, {
      preloadedState: authState as never,
      route: '/admin/dashboard',
    });
    await userEvent.click(screen.getByLabelText('Open menu'));
    const sidebar = document.querySelector('.sidebar') as HTMLElement;
    expect(sidebar).toHaveClass('open');

    await userEvent.click(screen.getByText('Coupons'));
    expect(sidebar).not.toHaveClass('open');
  });
});
