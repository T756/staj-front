import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, register as apiRegister, getMe, updateMe } from '../api/auth';

const AuthContext = createContext(null);

const normalizeUser = (data) => {
  if (!data) return null;
  if (typeof data.is_employer === 'boolean') return data;
  return {
    ...data,
    is_employer: data.role === 'EMPLOYER',
  };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await getMe();
      setUser(normalizeUser(data));
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem('access_token')) {
      fetchMe();
    } else {
      setLoading(false);
    }
  }, [fetchMe]);

  const login = async (email, password) => {
    const { data } = await apiLogin(email, password);
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    await fetchMe();
  };

  const register = async (formData) => {
    const payload = {
      email: formData.email,
      password: formData.password,
      first_name: formData.first_name,
      last_name: formData.last_name,
      role: formData.role || (formData.is_employer ? 'EMPLOYER' : 'JOB_SEEKER'),
    };

    await apiRegister(payload);
    await login(formData.email, formData.password);

    if (formData.first_name || formData.last_name) {
      try {
        await updateMe({
          first_name: formData.first_name || '',
          last_name: formData.last_name || '',
        });
        await fetchMe();
      } catch {
        // Profile enrichment is best-effort; registration/login should still succeed.
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
