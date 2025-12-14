import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { endpoints } from '../services/api';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken'));
  
  // Update state whenever token changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('adminToken', token);
      // OPTIONAL: You can set a default Authorization header for axios here
      // axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('adminToken');
    }
  }, [token]);

  const login = (newToken: string) => setToken(newToken);
  const logout = () => setToken(null);

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook for easy access
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};