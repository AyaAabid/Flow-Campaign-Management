// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login as apiLogin, logout as apiLogout } from "../services/auth";
import { getMe } from "../services/users"; // your existing /users/me service

const AuthCtx = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("pos-user");
    return raw ? JSON.parse(raw) : null;
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("pos-token");
    if (!token) {
      setReady(true);
      return;
    }
    getMe()
      .then(setUser)
      .catch(() => {
        apiLogout();
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);

  const login = async (username, password) => {
    const u = await apiLogin({ username, password });
    setUser(u);
    return u;
  };

  const logout = () => {
    apiLogout();
    setUser(null);
  };

  const value = useMemo(() => ({ user, ready, login, logout }), [user, ready]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
};

export const userAuth = () => useContext(AuthCtx);
export default AuthProvider; // if you prefer default import in main.jsx
