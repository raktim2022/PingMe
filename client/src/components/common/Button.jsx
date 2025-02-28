import React from 'react';

const Button = ({ children, variant = 'primary', ...props }) => {
  return (
    <button 
      className={`btn btn-${variant}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;