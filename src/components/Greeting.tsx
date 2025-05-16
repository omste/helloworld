import React from 'react';

interface GreetingProps {
  name?: string;
}

const Greeting: React.FC<GreetingProps> = ({ name }) => {
  return (
    <div>
      <h1>Hello, {name ? name : 'World'}!</h1>
    </div>
  );
};

export default Greeting; 