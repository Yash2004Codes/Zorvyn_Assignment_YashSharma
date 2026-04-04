// AuthContext — the global authentication state manager for the entire Next.js app.
// Exposes: current user object, loading state, login() and logout() functions.
// Works by:
//   1. On first render, reads the JWT cookie and calls GET /api/auth/me to rehydrate state.
//   2. login() stores the JWT cookie and sets the user state after a successful login.
//   3. logout() removes the cookie, clears user state, and hard-navigates to /login.
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import api from '../lib/api';

// Public user shape stored in context — password_hash is never exposed to the frontend.
interface User {
  id: number;
  name: string;
  email: string;
  role: 'viewer' | 'analyst' | 'admin';
  is_active: boolean;
}

// Shape of the value provided to all consumers of this context.
interface AuthState {
  user: User | null;
  isLoading: boolean;  // true while the initial JWT verification request is in-flight
  login: (token: string, userData: User) => void;
  logout: () => void;
}

// Create the context with safe defaults so consumers don't crash before the provider mounts.
const AuthContext = createContext<AuthState>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, check whether a valid JWT cookie already exists from a previous session.
  // If yes, verify it with the backend and restore the user object.
  useEffect(() => {
    const checkAuth = async () => {
      // Skip during SSR — cookies and window are browser-only APIs.
      if (typeof window === 'undefined') return;

      const token = Cookies.get('token');
      if (!token) {
        // No token found; user is not logged in — clear loading state immediately.
        setIsLoading(false);
        return;
      }

      try {
        // Validate the cookie token with the backend and fetch fresh user data.
        // The axios interceptor automatically attaches the Bearer header.
        const responseData = await api.get('/auth/me');
        setUser(responseData.data);
      } catch (error) {
        // Token is invalid or expired — remove the stale cookie.
        console.error('Auth verification failed', error);
        Cookies.remove('token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Called after a successful login API response.
  // Saves the JWT to a cookie (expires in 7 days) and updates global user state.
  const login = (token: string, userData: User) => {
    Cookies.set('token', token, { expires: 7 }); // 7 days
    setUser(userData);
  };

  // Called when the user clicks "Sign Out".
  // Hard-navigates via window.location to ensure all React state is cleared.
  const logout = () => {
    Cookies.remove('token');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Convenience hook — allows any component to consume auth state without importing useContext.
export const useAuth = () => useContext(AuthContext);
