import { request } from '@/services/shared/api';

export const getTickets   = (params = {}) => request('/tickets?' + new URLSearchParams(params));
export const getMyTickets = ()             => request('/tickets/mine');
export const getTicket    = (id)           => request(`/tickets/${id}`);
export const createTicket = (data)         => request('/tickets', { method: 'POST', body: data });
export const updateStatus = (id, status)   => request(`/tickets/${id}/status`, { method: 'PATCH', body: { status } });
export const assignTicket = (id, agentId)  => request(`/tickets/${id}/assign`, { method: 'PATCH', body: { assignedTo: agentId } });
export const updatePriority = (id, priority) => request(`/tickets/${id}/priority`, { method: 'PATCH', body: { priority } });
export const deleteTicket = (id)           => request(`/tickets/${id}`, { method: 'DELETE' });
export const getStats     = ()             => request('/tickets/stats');
