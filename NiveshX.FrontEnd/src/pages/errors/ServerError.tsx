import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaServer } from 'react-icons/fa';

const ServerError: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-yellow-600 p-4 rounded-full shadow-lg animate-pulse">
            <FaServer className="text-white text-4xl" />
          </div>
        </div>

        <h1 className="text-4xl font-bold">Server Error</h1>
        <p className="text-lg text-gray-300">
          Something went wrong on our end. Please try again later or contact support if the issue persists.
        </p>

        <button
          onClick={() => navigate('/')}
          className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow transition duration-200"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default ServerError;
