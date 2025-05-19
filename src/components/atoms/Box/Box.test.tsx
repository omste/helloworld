import { render } from '@testing-library/react';
import { Box } from './Box';

describe('Box', () => {
  it('renders children correctly', () => {
    const { getByText } = render(<Box>Test Content</Box>);
    expect(getByText('Test Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Box className="custom-class">Test</Box>);
    const boxElement = container.firstChild as HTMLElement;
    expect(boxElement).toHaveClass('custom-class');
  });

  it('applies default box styles', () => {
    const { container } = render(<Box>Test</Box>);
    const boxElement = container.firstChild as HTMLElement;
    expect(boxElement).toHaveClass(
      'p-8',
      'rounded-3xl',
      'border-2',
      'border-white/80'
    );
  });
}); 