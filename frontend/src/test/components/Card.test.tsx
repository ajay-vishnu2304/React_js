import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Card from '../../components/Card';

describe('Card component', () => {
  it('renders the title and value', () => {
    render(<Card title="Total Users" value={120} />);
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
  });

  it('renders a string value', () => {
    render(<Card title="Status" value="Active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('uses the stat-card class', () => {
    const { container } = render(<Card title="Sales" value={500} />);
    expect(container.firstChild).toHaveClass('stat-card');
  });
});
