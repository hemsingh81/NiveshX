import React from 'react';
import NavBar from './NavBar';
import Footer from './Footer';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-grow pt-20 md:pt-24 p-6 bg-gray-50">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
