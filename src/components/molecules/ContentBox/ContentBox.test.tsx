import { render } from '@testing-library/react';
import { ContentBox } from './ContentBox';

describe('ContentBox', () => {
  it('renders children correctly', () => {
    const { getByText } = render(<ContentBox>Test Content</ContentBox>);
    expect(getByText('Test Content')).toBeInTheDocument();
  });

  it('applies custom className to Box component', () => {
    const { container } = render(<ContentBox className="custom-class">Test</ContentBox>);
    const boxElement = container.firstChild as HTMLElement;
    expect(boxElement).toHaveClass('custom-class');
  });

  it('combines flex classes with custom className', () => {
    const { container } = render(<ContentBox className="custom-class">Test</ContentBox>);
    const boxElement = container.firstChild as HTMLElement;
    expect(boxElement).toHaveClass('flex', 'items-center', 'justify-center', 'custom-class');
  });
}); 