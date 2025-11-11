// import React, { createContext, useContext, useState, useEffect } from 'react';

// interface AuthContextType {
//   token: string | null;
//   login: (token: string) => void;
//   logout: () => void;
//   setToken: (token: string) => void;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [token, setToken] = useState<string | null>(sessionStorage.getItem('accessToken'));

//   // Sync token if localStorage changes externally
//   useEffect(() => {
//     const handleStorageChange = () => {
//       const storedToken = sessionStorage.getItem('accessToken');
//       setToken(storedToken);
//     };
//     window.addEventListener('storage', handleStorageChange);
//     return () => window.removeEventListener('storage', handleStorageChange);
//   }, []);

//   const login = (newToken: string) => {
//     sessionStorage.setItem('accessToken', newToken);
//     setToken(newToken);
//   };

//   const logout = () => {
//     sessionStorage.clear();
//     setToken(null);
//     window.location.href = '/login'; // fallback redirect outside router
//   };

//   return (
//     <AuthContext.Provider value={{ token, login, logout, setToken }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = (): AuthContextType => {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error('useAuth must be used within an AuthProvider');
//   return context;
// };
