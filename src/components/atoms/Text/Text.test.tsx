import { render, screen } from '@testing-library/react';
import { Text } from './Text';

describe('Text', () => {
  it('renders children correctly', () => {
    render(<Text>Hello World</Text>);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Text className="custom-class">Test</Text>);
    const textElement = container.firstChild as HTMLElement;
    expect(textElement).toHaveClass('custom-class');
  });

  it('applies default text styles', () => {
    const { container } = render(<Text>Test</Text>);
    const textElement = container.firstChild as HTMLElement;
    expect(textElement).toHaveClass(
      'text-white',
      'text-4xl',
      'md:text-6xl',
      'lg:text-7xl',
      'font-light'
    );
  });
}); 