import React from 'react';
import Layout from '../components/Layout';

const Master: React.FC = () => {
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Welcome to your Master</h1>
      <p className="text-gray-700">This is your secure area. Add widgets, charts, or insights here.</p>
    </Layout>
  );
};

export default Master;
