import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, register as registerApi, logout as logoutApi } from '../api/auth';
import { getMyDoctorProfile } from '../api/doctors';
import { getMyPatientProfile } from '../api/patients';

const AuthContext = createContext(null);

async function fetchEntityProfile(role) {
  try {
    if (role === 'Doctor') {
      const res = await getMyDoctorProfile();
      return { entityId: res.data.doctorId, entityData: res.data };
    }
    if (role === 'Patient') {
      const res = await getMyPatientProfile();
      return { entityId: res.data.patientId, entityData: res.data };
    }
  } catch {}
  return { entityId: null, entityData: null };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const email = localStorage.getItem('userEmail');
    const role = localStorage.getItem('userRole');
    const entityId = localStorage.getItem('entityId');
    const entityDataRaw = localStorage.getItem('entityData');
    const entityData = entityDataRaw ? JSON.parse(entityDataRaw) : null;
    if (token && email) {
      setUser({ email, role, token, entityId: entityId ? Number(entityId) : null, entityData });
    }
    setLoading(false);
  }, []);

  const storeUser = async (accessToken, refreshToken, email, role) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', role);
    const { entityId, entityData } = await fetchEntityProfile(role);
    if (entityId) localStorage.setItem('entityId', entityId);
    if (entityData) localStorage.setItem('entityData', JSON.stringify(entityData));
    setUser({ email, role, token: accessToken, entityId, entityData });
  };

  const login = async (credentials) => {
    const res = await loginApi(credentials);
    const { accessToken, refreshToken, email, role } = res.data.data;
    await storeUser(accessToken, refreshToken, email, role);
    return res.data;
  };

  const register = async (data) => {
    const res = await registerApi(data);
    if (res.data.data) {
      const { accessToken, refreshToken, email, role } = res.data.data;
      await storeUser(accessToken, refreshToken, email, role);
    }
    return res.data;
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      if (refreshToken) await logoutApi(refreshToken);
    } catch {}
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
