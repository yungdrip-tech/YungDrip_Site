"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchSession, loginUser, logoutUser, registerUser } from "@/lib/api-client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const payload = await fetchSession({ cache: "no-store" });
      setUser(payload.user || null);
      return payload.user || null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = useCallback(async (payload) => {
    const response = await loginUser(payload);
    setUser(response.user || null);
    return response.user;
  }, []);

  const register = useCallback(async (payload) => {
    const response = await registerUser(payload);
    setUser(response.user || null);
    return response.user;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshSession
    }),
    [isLoading, login, logout, refreshSession, register, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
