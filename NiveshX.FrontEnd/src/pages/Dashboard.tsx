import React from 'react';
import { useAuth } from '../components/AuthContext';

const Dashboard: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div>
      <h2>Welcome to Dashboard</h2>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Dashboard;
