import React from 'react';
import Layout from '../components/Layout';

const Dashboard: React.FC = () => {
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Welcome to your Dashboard</h1>
      <p className="text-gray-700">This is your secure area. Add widgets, charts, or insights here.</p>
    </Layout>
  );
};

export default Dashboard;
