import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  loginRequest,
  registerRequest,
  verifyTokenRequest,
  logoutRequest,
} from "../api/auth.js";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkLogin = useCallback(async () => {
    try {
      const res = await verifyTokenRequest();
      if (res.data) {
        setUser(res.data);
        setIsAuthenticated(true);
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkLogin();
  }, [checkLogin]);

  const register = async (userData) => {
    const res = await registerRequest(userData);
    setUser(res.data);
    setIsAuthenticated(true);
    return res.data;
  };

  const login = async (userData) => {
    const res = await loginRequest(userData);
    setUser(res.data);
    setIsAuthenticated(true);
    return res.data;
  };

  const logout = async () => {
    await logoutRequest();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        register,
        login,
        logout,
        refreshUser: checkLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
