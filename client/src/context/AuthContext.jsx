import { useState, useEffect } from "react";
import { authService } from "../api/authApi";
import { AuthContext } from "./authContextStore";

const SESSION_KEY = "user_meta";

function readSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSession(data) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch {}
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function AuthProvider({ children }) {
  const cached = readSession();

  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(cached?.role ?? null);
  const [userEmail, setUserEmail] = useState(cached?.email ?? null);
  const [userFullName, setUserFullName] = useState(cached?.fullName ?? null);
  const [userId, setUserId] = useState(cached?.userId ?? null);

  useEffect(() => {
    authService
      .me()
      .then((res) => {
        const { userId, email, role, fullName } = res.data.data;
        setIsAuthenticated(true);
        setUserRole(role);
        setUserEmail(email);
        setUserFullName(fullName);
        setUserId(userId);
        writeSession({ role, email, fullName, userId });
      })
      .catch(() => {
        clearSession();
        setIsAuthenticated(false);
        setUserRole(null);
        setUserEmail(null);
        setUserFullName(null);
        setUserId(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    const { user } = response.data.data;
    setIsAuthenticated(true);
    setUserRole(user.role);
    setUserEmail(user.email);
    setUserFullName(user.fullName);
    setUserId(user._id);
    writeSession({ role: user.role, email: user.email, fullName: user.fullName, userId: user._id });
    return { role: user.role };
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
    }
    clearSession();
    setIsAuthenticated(false);
    setUserRole(null);
    setUserEmail(null);
    setUserFullName(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, userRole, userEmail, userFullName, userId, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
