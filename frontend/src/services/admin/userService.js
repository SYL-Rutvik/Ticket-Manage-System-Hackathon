import { request } from '@/services/shared/api';

export const login    = (email, password) => request('/auth/login',    { method: 'POST', body: { email, password } });
export const register = (data)            => request('/auth/register', { method: 'POST', body: data });
export const getUsers = ()                => request('/users');
export const createUser = (data)          => request('/users', { method: 'POST', body: data });
export const updateRole = (id, role)      => request(`/users/${id}/role`, { method: 'PATCH', body: { role } });
export const deleteUser = (id)            => request(`/users/${id}`, { method: 'DELETE' });
