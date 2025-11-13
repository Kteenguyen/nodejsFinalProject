// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { AuthController } from "../controllers/AuthController";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const checkAuthStatus = useCallback(async () => {
    setIsLoadingAuth(true);
    try {
      const result = await AuthController.checkAuth();
      if (result.isAuthenticated && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  useEffect(() => { checkAuthStatus(); }, [checkAuthStatus]);

  // ✅ memo hoá: reference ổn định
  const login = useCallback((userInfo) => {
    setUser(userInfo);
    setIsAuthenticated(true);
  }, []);

  // ✅ memo hoá: reference ổn định + API nằm ở đây
  const logout = useCallback(async () => {
    try {
      await AuthController.logout();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  // ✅ tránh tạo object mới mỗi render
  const authContextValue = useMemo(() => ({
    user,
    isAuthenticated,
    isLoadingAuth,
    login,
    logout,
    checkAuthStatus,
  }), [user, isAuthenticated, isLoadingAuth, login, logout, checkAuthStatus]);

  if (isLoadingAuth) return <div>Đang tải dữ liệu người dùng...</div>;

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
