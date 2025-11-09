import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import { Dashboard, Admin, Master, Profile } from './pages';
import ProtectedRoute from './ProtectedRoute';

const protectedRoutes = [
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/admin', element: <Admin /> },
  { path: '/master', element: <Master /> },
  { path: '/profile', element: <Profile /> },
];

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      {protectedRoutes.map(({ path, element }) => (
        <Route
          key={path}
          path={path}
          element={<ProtectedRoute>{element}</ProtectedRoute>}
        />
      ))}
    </Routes>
  );
};

export default App;
