import { request } from '@/services/shared/api';

export const getAuditLog        = ()   => request('/audit');
export const getTicketAuditLog  = (id) => request(`/audit/ticket/${id}`);
