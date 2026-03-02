import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/services/api';

interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        const { accessToken, user } = response.data;

        // Save token for API interceptor
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth-token', accessToken);
        }

        set({
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          token: accessToken,
          isAuthenticated: true,
        });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-token');
        }
        set({ user: null, token: null, isAuthenticated: false });
      },

      setUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
