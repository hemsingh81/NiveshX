import React, { useEffect, useMemo } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "./store/userSlice";
import Login from "./pages/auth/Login";
import {
  Dashboard,
  Admin,
  AdminLayout,
  MotivationQuotes,
  UserManagement,
  CountryManagement,
  IndustryManagement,
  Master,
  Profile,
  Unauthorized,
  ServerError,
  SectorManagement,
  ClassificationTagManagement,
  StockMarketManagement,
} from "./pages";
import ProtectedRoute from "./ProtectedRoute";
import { ToasterControl } from "./components";

type StoredUser = {
  name: string;
  role: string;
  profilePictureUrl: string;
};

type ProtectedRouteConfig = {
  path: string;
  element: React.ReactNode;
  allowedRoles?: string[];
  requireAuth?: boolean;
};

const makeAdmin = (node: React.ReactNode) => <AdminLayout>{node}</AdminLayout>;

const ROUTES: ProtectedRouteConfig[] = [
  { path: "/dashboard", element: <Dashboard />, requireAuth: true },
  {
    path: "/admin",
    element: makeAdmin(<Admin />),
    allowedRoles: ["Admin"],
    requireAuth: true,
  },
  {
    path: "/admin/motivation",
    element: makeAdmin(<MotivationQuotes />),
    allowedRoles: ["Admin"],
    requireAuth: true,
  },
  {
    path: "/admin/user-management",
    element: makeAdmin(<UserManagement />),
    allowedRoles: ["Admin"],
    requireAuth: true,
  },
  {
    path: "/admin/country",
    element: makeAdmin(<CountryManagement />),
    allowedRoles: ["Admin"],
    requireAuth: true,
  },
  {
    path: "/admin/industry",
    element: makeAdmin(<IndustryManagement />),
    allowedRoles: ["Admin"],
    requireAuth: true,
  },
  {
    path: "/admin/sector",
    element: makeAdmin(<SectorManagement />),
    allowedRoles: ["Admin"],
    requireAuth: true,
  },
  {
    path: "/admin/classification-tag",
    element: makeAdmin(<ClassificationTagManagement />),
    allowedRoles: ["Admin"],
    requireAuth: true,
  },
  {
    path: "/admin/stock-market",
    element: makeAdmin(<StockMarketManagement />),
    allowedRoles: ["Admin"],
    requireAuth: true,
  },
  {
    path: "/master",
    element: <Master />,
    allowedRoles: ["Admin", "Trader", "Master"],
    requireAuth: true,
  },
  { path: "/profile", element: <Profile />, requireAuth: true },
  { path: "/unauthorized", element: <Unauthorized /> },
  { path: "/server-error", element: <ServerError /> },
];

const App: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const rawUser = sessionStorage.getItem("user");
    if (!token || !rawUser) return;

    try {
      const user: StoredUser = JSON.parse(rawUser);
      if (user?.name && user?.role) {
        dispatch(setUser({ token, user }));
      }
    } catch {
      console.warn("Invalid user object in sessionStorage");
    }
  }, [dispatch]);

  const renderedRoutes = useMemo(
    () =>
      ROUTES.map(({ path, element, allowedRoles, requireAuth }) => {
        const elementNode = requireAuth ? (
          <ProtectedRoute allowedRoles={allowedRoles}>{element}</ProtectedRoute>
        ) : (
          element
        );

        return <Route key={path} path={path} element={elementNode} />;
      }),
    []
  );

  return (
    <>
      <ToasterControl position="bottom-right" maxWidth="480px" duration={8000} />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        {renderedRoutes}
      </Routes>
    </>
  );
};

export default App;
