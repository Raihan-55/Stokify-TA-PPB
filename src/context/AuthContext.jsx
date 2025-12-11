import React, { createContext, useContext, useState, useEffect } from "react";
import { signIn as authSignIn, signOut as authSignOut, getCurrentUser, getSession } from "../lib/auth";

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    async function init() {
      try {
        const [currentUser, currentSession] = await Promise.all([getCurrentUser(), getSession()]);
        setUser(currentUser);
        setSession(currentSession);
      } catch (e) {
        console.warn("Auth init error:", e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const login = async (email, password) => {
    const { user: newUser, session: newSession } = await authSignIn(email, password);
    setUser(newUser);
    setSession(newSession);
    return { user: newUser, session: newSession };
  };

  const logout = async () => {
    await authSignOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
