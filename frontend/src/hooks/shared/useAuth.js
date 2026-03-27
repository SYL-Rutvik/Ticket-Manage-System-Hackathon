import { useState } from 'react';
import { login as apiLogin, register as apiRegister } from '@/services/admin/userService';

export const useAuthController = () => {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const loginUser = async (email, password, signIn) => {
    setLoading(true); setError(null);
    try {
      const data = await apiLogin(email, password);
      signIn(data);
      return data.user;
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (formData, signIn) => {
    setLoading(true); setError(null);
    try {
      const data = await apiRegister(formData);
      signIn(data);
      return data.user;
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, loginUser, registerUser };
};
