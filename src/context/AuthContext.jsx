import { useState, useEffect, useCallback } from 'react';
import { login as apiLogin, register as apiRegister, getMe, updateMe } from '../api/auth';
import { listMyJobs } from '../api/jobs';
import { listApplications } from '../api/applications';
import { AuthContext } from './AuthContextValue';

const parseJwtPayload = (token) => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const getRoleHintFromToken = () => {
  const access = localStorage.getItem('access_token');
  if (!access) return null;
  const payload = parseJwtPayload(access);
  if (!payload) return null;
  return payload.role || payload.user_role || null;
};

const detectProfileOnlyResponse = (data) => {
  if (!data || typeof data !== 'object') return false;
  const hasProfileFields = 'first_name' in data || 'last_name' in data || 'phone' in data || 'city' in data;
  return hasProfileFields && !('profile' in data) && !('email' in data) && !('role' in data);
};

const inferRoleHeuristically = async () => {
  try {
    await listApplications();
    return 'JOB_SEEKER';
  } catch {
    // not job seeker or endpoint not allowed
  }

  try {
    await listMyJobs();
    return 'EMPLOYER';
  } catch {
    // unresolved
  }

  return null;
};

const normalizeUser = (data) => {
  if (!data) return null;

  if (detectProfileOnlyResponse(data)) {
    const roleHint = getRoleHintFromToken() || null;
    return {
      profile: data,
      role: roleHint,
      email: localStorage.getItem('email_hint') || '',
      is_employer: roleHint === 'EMPLOYER',
    };
  }

  if (typeof data.is_employer === 'boolean') {
    return {
      ...data,
      role: data.role || (data.is_employer ? 'EMPLOYER' : 'JOB_SEEKER'),
      profile: data.profile || {
        first_name: data.first_name || '',
        last_name: data.last_name || '',
      },
    };
  }

  const role = data.role || getRoleHintFromToken() || null;

  return {
    ...data,
    role,
    is_employer: role === 'EMPLOYER',
    profile: data.profile || {
      first_name: data.first_name || '',
      last_name: data.last_name || '',
    },
  };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('access_token')));

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await getMe();
      const normalized = normalizeUser(data);

      if (!normalized?.role) {
        const inferredRole = await inferRoleHeuristically();
        setUser({
          ...normalized,
          role: inferredRole,
          is_employer: inferredRole === 'EMPLOYER',
        });
      } else {
        setUser(normalized);
      }

      if (normalized?.email) {
        localStorage.setItem('email_hint', normalized.email);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem('access_token')) {
      queueMicrotask(fetchMe);
    }
  }, [fetchMe]);

  const login = async (email, password) => {
    // Avoid stale role crossover between different accounts.
    localStorage.removeItem('role_hint');
    const { data } = await apiLogin(email, password);
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    localStorage.setItem('email_hint', email);

    await fetchMe();
  };

  const register = async (formData) => {
    const payload = {
      email: formData.email,
      password: formData.password,
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
    localStorage.removeItem('email_hint');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
