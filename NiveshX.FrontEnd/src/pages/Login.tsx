import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';
import loginBg from '../assets/images/login-bg.png';
import { CustomButton } from '../controls';
import axios from 'axios';

interface FormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
      await loginUser(email, password); // ✅ handles toast + sessionStorage + Redux
      navigate('/dashboard'); // ✅ navigate after Redux is hydrated
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
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img src={loginBg} alt="Login background" className="w-full h-full object-cover" />
      </div>
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
            <CustomButton
              loading={loading}
              label="Login"
              loadingLabel="Logging in…"
              type="submit"
              color="blue"
              fullWidth={true}
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
