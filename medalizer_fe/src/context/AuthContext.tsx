// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

type AuthContextType = {
  user: string | null;
  login: (username: string, token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    console.log("[AuthContext] Initializing auth context");
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    
    console.log("[AuthContext] Stored user:", storedUser);
    console.log("[AuthContext] Stored token exists:", !!storedToken);
    
    if (storedUser) {
      console.log("[AuthContext] Restoring user session:", storedUser);
      setUser(storedUser);
    }
  }, []);

  const login = (username: string, token: string) => {
    console.log("[AuthContext] Login called");
    console.log("[AuthContext] Username:", username);
    console.log("[AuthContext] Token exists:", !!token);
    
    localStorage.setItem("user", username);
    localStorage.setItem("token", token);
    setUser(username);
    
    console.log("[AuthContext] User logged in successfully");
    console.log("[AuthContext] LocalStorage updated");
  };

  const logout = () => {
    console.log("[AuthContext] Logout called");
    console.log("[AuthContext] Current user:", user);
    
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    
    console.log("[AuthContext] User logged out successfully");
    console.log("[AuthContext] LocalStorage cleared");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    console.error("[AuthContext] useAuth called outside AuthProvider");
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}