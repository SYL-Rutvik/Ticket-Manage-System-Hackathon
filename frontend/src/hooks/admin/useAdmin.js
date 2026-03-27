import { useState, useCallback } from 'react';
import { getUsers, updateRole, deleteUser, createUser } from '@/services/admin/userService';
import { getStats } from '@/services/shared/ticketService';
import { getSLAConfig, updateSLAConfig } from '@/services/admin/slaService';
import { getAuditLog } from '@/services/agent/auditService';

export const useAdminController = () => {
  const [users,     setUsers]   = useState([]);
  const [stats,     setStats]   = useState(null);
  const [sla,       setSla]     = useState(null);
  const [auditLogs, setAudit]   = useState([]);
  const [loading,   setLoading] = useState(false);
  const [error,     setError]   = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try   { const d = await getUsers();     setUsers(d.users); }
    catch (e) { setError(e.message); }
    finally   { setLoading(false); }
  }, []);

  const addUser = useCallback(async (userData) => {
    setLoading(true);
    try {
      const d = await createUser(userData);
      const userRecord = {
        id: d.id,
        name: d.name,
        email: d.email,
        role: d.role,
        createdAt: d.createdAt,
        isAvailable: d.isAvailable,
        location: d.location,
      };
      setUsers(prev => [...prev, userRecord]);
      return { ok: true, emailSent: d.emailSent !== false, warning: d.warning, tempPassword: d.tempPassword };
    } catch (e) { 
      setError(e.message);
      return { ok: false, error: e.message }; 
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try   { const d = await getStats(); setSla(d); setStats(d); }
    catch (e) { setError(e.message); }
  }, []);

  const fetchSLA = useCallback(async () => {
    try   { const d = await getSLAConfig(); setSla(d); }
    catch (e) { setError(e.message); }
  }, []);

  const fetchAudit = useCallback(async () => {
    try   { const d = await getAuditLog(); setAudit(d.logs); }
    catch (e) { setError(e.message); }
  }, []);

  const changeRole = useCallback(async (id, role) => {
    const d = await updateRole(id, role);
    setUsers(prev => prev.map(u => u.id === d.id ? d : u));
  }, []);

  const removeUser = useCallback(async (id) => {
    await deleteUser(id);
    setUsers(prev => prev.filter(u => u.id !== id));
  }, []);

  const saveSLA = useCallback(async (priority, hours) => {
    const d = await updateSLAConfig(priority, hours);
    setSla(d);
  }, []);

  return { users, stats, sla, auditLogs, loading, error, fetchUsers, addUser, fetchStats, fetchSLA, fetchAudit, changeRole, removeUser, saveSLA };
};
