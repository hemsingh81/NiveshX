// src/App.tsx
import React, { useEffect, useMemo } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "./store/userSlice";
import Login from "./pages/auth/Login";
import {
  Dashboard,
  Admin,
  AdminLayout,
  UserManagement,
  CountryManagement,
  IndustryManagement,
  Master,
  Profile,
  Unauthorized,
  ServerError,
  SectorManagement,
  ClassificationTagManagement,
  ExchangeManagement,
  MotivationQuotesManagement,
} from "./pages";
import ProtectedRoute from "./ProtectedRoute";
import { ToasterControl } from "./components";
import MarketCalendarManagement from "./pages/admin/marketCalendar/MarketCalendarManagement";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./utils/theme";
import { toasterConfig } from "./utils/toasterConfig";

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
    element: makeAdmin(<MotivationQuotesManagement />),
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
    path: "/admin/exchange",
    element: makeAdmin(<ExchangeManagement />),
    allowedRoles: ["Admin"],
    requireAuth: true,
  },
  {
    path: "/admin/market-calendar",
    element: makeAdmin(<MarketCalendarManagement />),
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

  // restore user state from session storage on app mount
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

  // Allow runtime overrides for toaster behavior via env vars (optional)
  // Example env vars:
  // REACT_APP_TOASTER_SUCCESS_CREATE=false
  // REACT_APP_TOASTER_LOADING_CREATE=false
  // REACT_APP_TOASTER_MAPPED_ERROR=true
  useEffect(() => {
    try {
      const env = process.env as Record<string, string | undefined>;

      const bool = (v?: string) => {
        if (!v) return undefined;
        return /^(1|true|yes)$/i.test(v);
      };

      const sCreate = bool(env.REACT_APP_TOASTER_SUCCESS_CREATE);
      if (typeof sCreate !== "undefined") toasterConfig.success.create = sCreate;

      const lCreate = bool(env.REACT_APP_TOASTER_LOADING_CREATE);
      if (typeof lCreate !== "undefined") toasterConfig.loading.create = lCreate;

      const sUpdate = bool(env.REACT_APP_TOASTER_SUCCESS_UPDATE);
      if (typeof sUpdate !== "undefined") toasterConfig.success.update = sUpdate;

      const lUpdate = bool(env.REACT_APP_TOASTER_LOADING_UPDATE);
      if (typeof lUpdate !== "undefined") toasterConfig.loading.update = lUpdate;

      const sDelete = bool(env.REACT_APP_TOASTER_SUCCESS_DELETE);
      if (typeof sDelete !== "undefined") toasterConfig.success.delete = sDelete;

      const lDelete = bool(env.REACT_APP_TOASTER_LOADING_DELETE);
      if (typeof lDelete !== "undefined") toasterConfig.loading.delete = lDelete;

      const mapped = bool(env.REACT_APP_TOASTER_MAPPED_ERROR);
      if (typeof mapped !== "undefined") toasterConfig.mappedError = mapped;
    } catch {
      // ignore errors modifying toasterConfig
    }
  }, []);

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
      <ThemeProvider theme={theme}>
        <ToasterControl position="bottom-right" maxWidth="480px" duration={8000} />

        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          {renderedRoutes}
        </Routes>
      </ThemeProvider>
    </>
  );
};

export default App;
