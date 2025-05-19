import { render, screen } from '@testing-library/react';
import { Background } from './Background';

describe('Background', () => {
  const props = {
    imageSrc: '/test-image.jpg',
    alt: 'Test image'
  };

  it('renders the background image with correct props', () => {
    render(<Background {...props} />);
    const image = screen.getByAlt(props.alt);
    
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src');
    expect(image).toHaveClass('object-cover');
  });

  it('renders the overlay', () => {
    const { container } = render(<Background {...props} />);
    const overlay = container.querySelector('.bg-black\\/30');
    
    expect(overlay).toBeInTheDocument();
  });
}); 