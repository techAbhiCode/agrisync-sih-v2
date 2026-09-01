import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import type { Role } from '@/store/authStore';

interface ProtectedRouteProps {
  allowedRoles: Role[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    // User logged in nahi hai, send to login but remember where they wanted to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // User logged in hai par role match nahi kar raha (e.g., Farmer trying to access Admin panel)
    return <Navigate to="/unauthorized" replace />;
  }

  // Sab theek hai, page render hone do
  return <Outlet />;
}