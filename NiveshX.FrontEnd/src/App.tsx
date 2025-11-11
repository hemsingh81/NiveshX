import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from './store/userSlice';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import { Dashboard, Admin, Master, Profile, Unauthorized, ServerError } from './pages';
import ProtectedRoute from './ProtectedRoute';

interface StoredUser {
  name: string;
  role: string;
  profilePictureUrl: string;
}

const protectedRoutes = [
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/admin', element: <Admin />, allowedRoles: ['Admin'] },
  { path: '/master', element: <Master />, allowedRoles: ['Admin', 'Trader', 'Master'] },
  { path: '/profile', element: <Profile /> },
  { path: '/unauthorized', element: <Unauthorized /> },
  { path: '/server-error', element: <ServerError /> },
];

const App: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const rawUser = sessionStorage.getItem('user');
    try {
      const user: StoredUser | null = rawUser ? JSON.parse(rawUser) : null;
      if (token && user?.name && user?.role) {
        dispatch(setUser({ token, user }));
      }
    } catch {
      console.warn('Invalid user object in sessionStorage');
    }
  }, [dispatch]);

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        {protectedRoutes.map(({ path, element, allowedRoles }) => (
          <Route
            key={path}
            path={path}
            element={
              <ProtectedRoute allowedRoles={allowedRoles}>
                {element}
              </ProtectedRoute>
            }
          />
        ))}
      </Routes>
    </>
  );
};

export default App;
