import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Booking from './pages/Booking';
import MarketTrends from './pages/MarketTrends';
import Logistics from './pages/Logistics';
import Profile from './pages/Profile';
import MandiDashboard from './pages/MandiDashboard';
import Advisory from './pages/Advisory';
import SuperAdmin from './pages/SuperAdmin';
import AppLayout from './layouts/AppLayout';

// Stub pages (replace with full pages when ready)
const Unauthorized = () => (
  <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
    <div className="text-center">
      <p className="text-6xl font-black text-red-500 mb-4">403</p>
      <p className="text-zinc-400 text-lg">Unauthorized Access</p>
    </div>
  </div>
);

const AdminDashboard = () => (
  <div className="p-8">
    <h1 className="text-3xl font-black text-white mb-2">Mandi <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-500">Control Panel</span></h1>
    <p className="text-zinc-400">Admin dashboard coming soon.</p>
  </div>
);

import { Toaster } from 'sonner';

export default function App() {
  const { isAuthenticated, user } = useAuthStore();

  const farmerHome = '/dashboard';
  const getHomeRoute = (role?: string) => {
    if (role === 'ADMIN') return '/admin';
    if (role === 'MANDI_ADMIN') return '/mandi-scanner';
    if (role === 'system_admin') return '/super-admin';
    return '/dashboard';
  };

  return (
    <>
      <Toaster position="top-center" richColors theme="dark" />
      <Routes>
      {/* ── Public Routes ─────────────────────────────────────────────────── */}
      <Route
        path="/"
        element={
          !isAuthenticated
            ? <Landing />
            : <Navigate to={getHomeRoute(user?.role)} replace />
        }
      />
      <Route
        path="/login"
        element={
          !isAuthenticated
            ? <Login />
            : <Navigate to={getHomeRoute(user?.role)} replace />
        }
      />
      <Route
        path="/register"
        element={
          !isAuthenticated
            ? <Register />
            : <Navigate to={getHomeRoute(user?.role)} replace />
        }
      />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* ── Protected Routes (inside shared AppLayout navbar) ─────────────── */}
      <Route element={<AppLayout />}>

        {/* FARMER ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={['FARMER']} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/logistics" element={<Logistics />} />
          <Route path="/advisory" element={<Advisory />} />
        </Route>

        {/* ADMIN ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/inventory" element={<div className="p-8 text-zinc-300">Inventory Management</div>} />
        </Route>

        {/* MANDI ADMIN ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={['MANDI_ADMIN']} />}>
          <Route path="/mandi-scanner" element={<MandiDashboard />} />
        </Route>

        {/* SYSTEM ADMIN ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={['FARMER', 'ADMIN', 'LOGISTICS', 'MANDI_ADMIN', 'system_admin', 'GUEST']} />}>
          <Route path="/super-admin" element={<SuperAdmin />} />
        </Route>

        {/* SHARED ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={['FARMER', 'ADMIN', 'LOGISTICS', 'MANDI_ADMIN', 'system_admin']} />}>
          <Route path="/market-trends" element={<MarketTrends />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

      </Route>

      {/* 404 Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}