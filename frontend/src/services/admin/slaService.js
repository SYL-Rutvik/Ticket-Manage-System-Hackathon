import { request } from '@/services/shared/api';

export const getSLAConfig    = ()                   => request('/sla');
export const updateSLAConfig = (priority, hours)    => request('/sla', { method: 'PUT', body: { priority, hours } });
