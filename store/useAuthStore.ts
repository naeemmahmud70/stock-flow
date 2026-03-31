import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          const data = await res.json();
          if (!data.success) {
            set({ error: data.error, isLoading: false });
            return false;
          }
          set({ user: data.data.user, token: data.data.token, isAuthenticated: true, isLoading: false });
          return true;
        } catch {
          set({ error: "Network error. Please try again.", isLoading: false });
          return false;
        }
      },

      signup: async (name, email, password, role = "manager") => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password, role }),
          });
          const data = await res.json();
          if (!data.success) {
            set({ error: data.error, isLoading: false });
            return false;
          }
          set({ user: data.data.user, token: data.data.token, isAuthenticated: true, isLoading: false });
          return true;
        } catch {
          set({ error: "Network error. Please try again.", isLoading: false });
          return false;
        }
      },

      logout: async () => {
        const { token } = get();
        await fetch("/api/auth/me", {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        set({ user: null, token: null, isAuthenticated: false });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "sf-auth", // localStorage key — must match fetchClient.ts
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
