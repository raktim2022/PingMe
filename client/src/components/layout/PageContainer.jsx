import React from 'react';

const PageContainer = ({ children }) => {
  return (
    <main className="container mx-auto">
      {children}
    </main>
  );
};

export default PageContainer;