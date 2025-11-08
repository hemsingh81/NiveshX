import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';
import { useAuth } from '../components/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

import loginBg from '../assets/images/login-bg.png';
import axios from 'axios';

interface FormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, setToken } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const token = await loginUser(email, password);
      login(token);
      setToken(token);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 400) {
          setError('Invalid input. Please check your email and password format.');
        } else if (status === 401) {
          setError('Invalid email or password. Please try again.');
        } else if (status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError('Login failed. Please try again.');
        }
      } else {
        setError('Unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <Toaster />

      {/* Fullscreen Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={loginBg}
          alt="Login background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Optional Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-0" />

      {/* Login Form */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="bg-white bg-opacity-90 backdrop-blur-md p-8 rounded-xl shadow-2xl w-full max-w-md">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Login</h2>

          {error && (
            <div className="mb-4 text-center">
              <p className="inline-block bg-red-100 text-red-700 text-sm font-medium px-4 py-2 rounded shadow-sm border border-red-300 animate-pulse">
                ⚠️ {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              aria-label="Email"
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              aria-label="Password"
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded transition duration-200 flex items-center justify-center ${loading
                ? 'bg-blue-300 cursor-not-allowed text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Logging in…
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
