import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, LayoutDashboard, CalendarDays, TrendingUp, LogOut, Truck, Bot, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useBookingStore } from '@/store/bookingStore';
import { auth } from '@/lib/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import NotificationPanel from '@/components/NotificationPanel';

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const { fetchNotifications } = useNotificationStore();
  const { fetchBookings } = useBookingStore();
  const location = useLocation();
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: () => void;
    if (user?.id) {
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          fetchNotifications();
          fetchBookings();
          
          // Keep role in sync with backend (e.g. if approved as Mandi Admin in background)
          try {
            const { getUserProfile } = await import('@/lib/api');
            const profile = await getUserProfile();
            const currentUser = useAuthStore.getState().user;
            if (profile?.user?.role && (profile.user.role !== currentUser?.role || profile.user.mandiId !== currentUser?.mandiId)) {
              useAuthStore.getState().updateUser({ 
                role: profile.user.role,
                mandiId: profile.user.mandiId 
              });
            }
          } catch (err) {
            console.error('Failed to sync profile on load', err);
          }
        }
      });
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.id, fetchNotifications, fetchBookings]);

  const handleLogout = async () => {
    await signOut(auth);
    logout(); // Zustand store clear
  };

  // Dynamic Navigation Links based on Role (RBAC)
  const navLinks = [
    { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard, roles: ['FARMER'] },
    { path: '/booking', name: 'Booking', icon: CalendarDays, roles: ['FARMER'] },
    { path: '/logistics', name: 'Micro-Logistics', icon: Truck, roles: ['FARMER', 'LOGISTICS'] },
    { path: '/advisory', name: 'AI Advisory', icon: Bot, roles: ['FARMER'] },
    { path: '/mandi-scanner', name: 'Mandi Scanner', icon: Sprout, roles: ['MANDI_ADMIN'] },
    { path: '/market-trends', name: 'Market Trends', icon: TrendingUp, roles: ['FARMER', 'ADMIN', 'LOGISTICS', 'MANDI_ADMIN', 'system_admin'] },
    { path: '/admin', name: 'Control Panel', icon: Sprout, roles: ['ADMIN'] },
    { path: '/super-admin', name: 'Super Admin', icon: ShieldCheck, roles: ['system_admin'] },
  ].filter(link => user && link.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-50 font-sans selection:bg-lime-500/30">
      
      {/* 
        The Glassmorphic Floating Top Navbar 
        Cinematic transparency with backdrop-blur
      */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-center pointer-events-none">
        <motion.nav 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="pointer-events-auto bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-full px-6 py-2 flex items-center justify-between w-full max-w-5xl"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mr-8 group">
            <div className="bg-lime-500/10 p-2 rounded-full group-hover:bg-lime-500/20 transition-colors">
              <Sprout className="h-5 w-5 text-lime-500" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">AgriSync.</span>
          </Link>

          {/* Animated Navigation Links */}
          <div className="flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onMouseEnter={() => setHoveredPath(link.path)}
                  onMouseLeave={() => setHoveredPath(null)}
                  className="relative px-4 py-2 rounded-full text-sm font-medium transition-colors z-10 flex items-center gap-2"
                >
                  <link.icon className={`h-4 w-4 z-10 relative transition-colors ${isActive ? 'text-zinc-950' : 'text-zinc-400'}`} />
                  <span className={`z-10 relative transition-colors ${isActive ? 'text-zinc-950' : 'text-zinc-300'}`}>
                    {link.name}
                  </span>

                  {/* Active Link Pill (Lime) */}
                  {isActive && (
                    <motion.div
                      layoutId="activePill"
                      className="absolute inset-0 bg-lime-500 rounded-full shadow-[0_0_15px_rgba(132,204,22,0.4)]"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}

                  {/* Hover Highlight (Subtle Gray) */}
                  {hoveredPath === link.path && !isActive && (
                    <motion.div
                      layoutId="hoverPill"
                      className="absolute inset-0 bg-zinc-800/50 rounded-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right: Notifications + User Profile + Logout */}
          <div className="flex items-center gap-2 ml-6 pl-6 border-l border-zinc-700/50">
            {/* Notification Bell */}
            <NotificationPanel />

            {/* User info */}
            <Link to="/profile" className="hidden sm:flex flex-col items-end ml-1 px-2 py-1 hover:bg-zinc-800/50 rounded-lg transition-colors cursor-pointer">
              <span className="text-xs font-semibold text-lime-400 uppercase tracking-wider">{user?.role}</span>
              <span className="text-sm font-medium text-zinc-300">{user?.name}</span>
            </Link>

            {/* Logout */}
            <button 
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-zinc-800/80 text-zinc-400 hover:text-red-400 transition-colors"
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </motion.nav>
      </header>

      {/* Main Content Area */}
      <main className="pt-28 pb-10 px-6 max-w-7xl mx-auto min-h-screen">
        <AnimatePresence mode="wait">
          {/* Outlet is where your page components (Dashboard, Booking, etc.) will render */}
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      
    </div>
  );
}