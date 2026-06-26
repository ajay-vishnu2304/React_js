import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import NotFound from '../../pages/404';

describe('NotFound page (404)', () => {
  it('renders the 404 heading', () => {
    renderWithProviders(<NotFound />);
    expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument();
  });

  it('renders the not exist message', () => {
    renderWithProviders(<NotFound />);
    expect(screen.getByText(/does not exist/i)).toBeInTheDocument();
  });

  it('renders a Home link', () => {
    renderWithProviders(<NotFound />);
    expect(screen.getByText('Home').closest('a')).toHaveAttribute('href', '/');
  });
});
