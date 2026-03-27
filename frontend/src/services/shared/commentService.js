import { request } from '@/services/shared/api';

export const getComments = async (ticketId) => {
  const response = await request(`/tickets/${ticketId}/comments`);
  return response.comments || [];
};

export const addComment = async (ticketId, text) => {
  const response = await request(`/tickets/${ticketId}/comments`, { 
    method: 'POST', 
    body: { message: text } 
  });
  return response.comments || [];
};

export const getNotes      = (ticketId) => request(`/tickets/${ticketId}/notes`);
export const addNote       = (ticketId, text) => request(`/tickets/${ticketId}/notes`, { method: 'POST', body: { text } });
