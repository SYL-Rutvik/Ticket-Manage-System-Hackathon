import { createContext, useContext, useState, useEffect } from 'react';
import { ROLE_HOME } from '@/shared/utils/constants';

const AuthContext = createContext(null);

const normalizeRole = (role) => (role === 'customer' ? 'employee' : role);

export const AuthProvider = ({ children }) => {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (t && u) {
      try {
        const parsedUser = JSON.parse(u);
        const normalizedUser = { ...parsedUser, role: normalizeRole(parsedUser?.role) };
        setToken(t);
        setUser(normalizedUser);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const signIn = ({ token: t, user: u }) => {
    const normalizedUser = { ...u, role: normalizeRole(u?.role) };
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    setToken(t); setUser(normalizedUser);
  };

  const signOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null); setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
