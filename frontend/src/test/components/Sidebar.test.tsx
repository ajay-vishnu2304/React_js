import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import Sidebar from '../../components/Sidebar';

describe('Sidebar component', () => {
  it('renders the admin panel title', () => {
    renderWithProviders(<Sidebar />);
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });

  it('renders all admin navigation links', () => {
    renderWithProviders(<Sidebar />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Coupons')).toBeInTheDocument();
  });

  it('links point to the correct admin routes', () => {
    renderWithProviders(<Sidebar />);
    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/admin/dashboard');
    expect(screen.getByText('Users').closest('a')).toHaveAttribute('href', '/admin/users');
    expect(screen.getByText('Coupons').closest('a')).toHaveAttribute('href', '/admin/coupons');
  });

  it('applies open class and calls onClose when link clicked', async () => {
    const onClose = vi.fn();
    const { container } = renderWithProviders(<Sidebar open onClose={onClose} />);
    expect(container.querySelector('.sidebar.open')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Dashboard'));
    expect(onClose).toHaveBeenCalled();
  });
});
