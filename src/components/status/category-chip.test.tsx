import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategoryChip } from './category-chip';

describe('CategoryChip', () => {
  it('renders accident category with glyph and name', () => {
    render(<CategoryChip category="accident" />);
    expect(screen.getByText('accident')).toBeInTheDocument();
  });

  it('renders category from object with custom name and color', () => {
    render(
      <CategoryChip
        category={{
          slug: 'fire',
          name: 'FIRE HAZARD',
          color_hex: '#FF6B2C',
        }}
      />
    );
    expect(screen.getByText('FIRE HAZARD')).toBeInTheDocument();
  });

  it('renders dot variant when requested', () => {
    const { container } = render(
      <CategoryChip category="flooding" variant="dot" />
    );
    expect(container.querySelector('.rounded-full')).toBeInTheDocument();
  });
});
