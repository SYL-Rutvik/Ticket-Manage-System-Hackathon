import { useState, useCallback } from 'react';
import * as ticketSvc from '@/services/shared/ticketService';

export const useTicketController = () => {
  const [tickets, setTickets]   = useState([]);
  const [ticket,  setTicket]    = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState(null);

  const fetchAll = useCallback(async (params) => {
    setLoading(true); setError(null);
    try   { const d = await ticketSvc.getTickets(params); setTickets(d.tickets); }
    catch (e) { setError(e.message); }
    finally   { setLoading(false); }
  }, []);

  const fetchMine = useCallback(async () => {
    setLoading(true); setError(null);
    try   { const d = await ticketSvc.getMyTickets(); setTickets(d.tickets); }
    catch (e) { setError(e.message); }
    finally   { setLoading(false); }
  }, []);

  const fetchOne = useCallback(async (id) => {
    setLoading(true); setError(null);
    try   { const d = await ticketSvc.getTicket(id); setTicket(d); }
    catch (e) { setError(e.message); }
    finally   { setLoading(false); }
  }, []);

  const create = useCallback(async (data) => {
    const d = await ticketSvc.createTicket(data);
    return d;
  }, []);

  const changeStatus = useCallback(async (id, status) => {
    const d = await ticketSvc.updateStatus(id, status);
    setTicket(d);
    setTickets(prev => prev.map(t => t.id === d.id ? d : t));
  }, []);

  const assign = useCallback(async (id, agentId) => {
    const d = await ticketSvc.assignTicket(id, agentId);
    setTicket(d);
  }, []);

  const changePriority = useCallback(async (id, priority) => {
    const d = await ticketSvc.updatePriority(id, priority);
    setTicket(d);
  }, []);

  const removeTicket = useCallback(async (id) => {
    await ticketSvc.deleteTicket(id);
    setTicket(null);
  }, []);

  return { tickets, ticket, loading, error, fetchAll, fetchMine, fetchOne, create, changeStatus, assign, changePriority, removeTicket };
};
