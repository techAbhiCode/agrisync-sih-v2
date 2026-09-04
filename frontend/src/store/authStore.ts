import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'FARMER' | 'ADMIN' | 'LOGISTICS' | 'MANDI_ADMIN' | 'system_admin';

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  mandiId?: string; // Add mandiId for admins
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (userData) => 
        set({ user: userData, isAuthenticated: true }),
      logout: () => 
        set({ user: null, isAuthenticated: false }),
      updateUser: (data) =>
        set((state) => ({ user: state.user ? { ...state.user, ...data } : null })),
    }),
    {
      name: 'agrisync-auth-storage',
    }
  )
);