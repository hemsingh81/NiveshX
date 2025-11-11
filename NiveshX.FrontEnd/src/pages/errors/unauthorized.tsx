import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-red-600 p-4 rounded-full shadow-lg animate-pulse">
            <FaLock className="text-white text-4xl" />
          </div>
        </div>

        <h1 className="text-4xl font-bold">Access Denied</h1>
        <p className="text-lg text-gray-300">
          You don’t have permission to view this page. Please contact your administrator if you believe this is a mistake.
        </p>

        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow transition duration-200"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
