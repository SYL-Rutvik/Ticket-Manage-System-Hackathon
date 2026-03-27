import { request } from '@/services/shared/api';

// Agent — toggle own availability (no id needed)
export const toggleMyAvailability = async () =>
    request('/users/me/availability', { method: 'PATCH' });

// Admin — toggle any agent's availability by id
export const toggleAgentAvailability = async (agentId) =>
    request(`/users/${agentId}/availability`, { method: 'PATCH' });
