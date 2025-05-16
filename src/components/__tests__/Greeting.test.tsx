import React from 'react';
import { render, screen } from '@testing-library/react';
import Greeting from '../Greeting'; // Adjust path as necessary

describe('Greeting Component', () => {
  test('renders default greeting when no name is provided', () => {
    render(<Greeting />);
    // Use a case-insensitive match and check for part of the string
    expect(screen.getByRole('heading', { name: /hello, world/i })).toBeInTheDocument();
  });

  test('renders greeting with the provided name', () => {
    const testName = 'Tester';
    render(<Greeting name={testName} />);
    // Use a case-insensitive match
    expect(screen.getByRole('heading', { name: new RegExp(`hello, ${testName}`, 'i') })).toBeInTheDocument();
  });

  test('renders a heading element', () => {
    render(<Greeting name="Jest" />)
    const heading = screen.getByRole('heading')
    expect(heading).toBeInTheDocument()
  })
}); 