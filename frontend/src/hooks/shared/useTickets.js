import { useState, useCallback, useEffect, useRef } from 'react';
import * as ticketSvc from '@/services/shared/ticketService';

export const useTicketController = () => {
  const [tickets, setTickets] = useState([]);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async (params) => {
    setLoading(true); setError(null);
    try { const d = await ticketSvc.getTickets(params); setTickets(d.tickets); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  const fetchMine = useCallback(async () => {
    setLoading(true); setError(null);
    try { const d = await ticketSvc.getMyTickets(); setTickets(d.tickets); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  const fetchOne = useCallback(async (id) => {
    setLoading(true); setError(null);
    try { const d = await ticketSvc.getTicket(id); setTicket(d); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  // Silent background refresh — does NOT set loading=true so the UI never flickers
  const fetchOneSilent = useCallback(async (id) => {
    try { const d = await ticketSvc.getTicket(id); setTicket(d); }
    catch { /* silently ignore — keep stale data on screen */ }
  }, []);

  const create = useCallback(async (data) => {
    const d = await ticketSvc.createTicket(data);
    // Immediately add to tickets list so it appears without refresh
    setTickets(prev => [d, ...prev]);
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

  return {
    tickets, ticket, loading, error,
    fetchAll, fetchMine, fetchOne, fetchOneSilent,
    create, changeStatus, assign, changePriority, removeTicket,
  };
};

/**
 * useLiveTicket
 * Fetches a ticket once (with loading state) on mount, then silently polls
 * in the background every `intervalMs` milliseconds (default: 30 000 ms).
 *
 * Returns:
 *   - All values from useTicketController
 *   - `lastUpdated`  — Date of the most recent successful poll
 *   - `isPolling`    — true while a background poll is in-flight
 *   - `refresh`      — function to trigger an immediate silent refresh
 */
export const useLiveTicket = (id, intervalMs = 30_000) => {
  const ctrl = useTicketController();
  const { fetchOne, fetchOneSilent } = ctrl;

  const [lastUpdated, setLastUpdated] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const isMounted = useRef(true);

  // Initial load (shows spinner)
  useEffect(() => {
    isMounted.current = true;
    if (id) fetchOne(id);
    return () => { isMounted.current = false; };
  }, [id, fetchOne]);

  // Background polling interval
  useEffect(() => {
    if (!id) return;

    const poll = async () => {
      if (!isMounted.current) return;
      setIsPolling(true);
      await fetchOneSilent(id);
      if (isMounted.current) {
        setLastUpdated(new Date());
        setIsPolling(false);
      }
    };

    const timer = setInterval(poll, intervalMs);
    return () => clearInterval(timer);
  }, [id, intervalMs, fetchOneSilent]);

  // Manual refresh (silent, no spinner)
  const refresh = useCallback(async () => {
    if (!id) return;
    setIsPolling(true);
    await fetchOneSilent(id);
    if (isMounted.current) {
      setLastUpdated(new Date());
      setIsPolling(false);
    }
  }, [id, fetchOneSilent]);

  return { ...ctrl, lastUpdated, isPolling, refresh };
};
