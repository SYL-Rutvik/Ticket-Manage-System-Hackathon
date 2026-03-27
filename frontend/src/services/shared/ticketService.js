import { request } from '@/services/shared/api';

// Normalize MongoDB _id to id for consistent frontend usage
const normalizeTicket = (ticket) => ({
  ...ticket,
  id: ticket._id || ticket.id,
});

const normalizeTickets = (tickets) => {
  if (Array.isArray(tickets)) return tickets.map(normalizeTicket);
  if (tickets && tickets.data) return { ...tickets, data: tickets.data.map(normalizeTicket) };
  if (tickets && tickets.tickets) return { ...tickets, tickets: tickets.tickets.map(normalizeTicket) };
  return tickets;
};

export const getTickets   = async (params = {}) => normalizeTickets(await request('/tickets?' + new URLSearchParams(params)));
export const getMyTickets = async ()             => normalizeTickets(await request('/tickets/mine'));
export const getTicket    = async (id)           => normalizeTicket(await request(`/tickets/${id}`));
export const createTicket = async (data)         => normalizeTicket(await request('/tickets', { method: 'POST', body: data }));
export const updateStatus = async (id, status)   => normalizeTicket(await request(`/tickets/${id}/status`, { method: 'PATCH', body: { status } }));
export const assignTicket = async (id, agentId)  => normalizeTicket(await request(`/tickets/${id}/assign`, { method: 'PATCH', body: { assignedTo: agentId } }));
export const updatePriority = async (id, priority) => normalizeTicket(await request(`/tickets/${id}/priority`, { method: 'PATCH', body: { priority } }));
export const deleteTicket = async (id)           => request(`/tickets/${id}`, { method: 'DELETE' });
export const getStats     = async ()             => request('/tickets/stats');
