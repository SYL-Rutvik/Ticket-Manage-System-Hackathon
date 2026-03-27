import { request } from '@/services/shared/api';

export const getComments   = (ticketId) => request(`/tickets/${ticketId}/comments`);
export const addComment    = (ticketId, text) => request(`/tickets/${ticketId}/comments`, { method: 'POST', body: { text } });
export const getNotes      = (ticketId) => request(`/tickets/${ticketId}/notes`);
export const addNote       = (ticketId, text) => request(`/tickets/${ticketId}/notes`, { method: 'POST', body: { text } });
