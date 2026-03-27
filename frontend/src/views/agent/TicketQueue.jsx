import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, Search, LayoutList, Eye, UserPlus } from 'lucide-react';
import { useTicketController } from '@/hooks/shared/useTickets';
import { useAuth } from '@/shared/context/AuthContext';
import { STATUS, PRIORITY } from '@/shared/utils/constants';

const TicketQueue = () => {
  const { user } = useAuth();
  const { tickets, loading, error, fetchAll, assign } = useTicketController();
  
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const params = {};
    if (filterStatus) params.status = filterStatus;
    if (filterPriority) params.priority = filterPriority;
    if (search) params.search = search;
    const timer = setTimeout(() => fetchAll(params), 300);
    return () => clearTimeout(timer);
  }, [fetchAll, filterStatus, filterPriority, search]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-10">
      <div className="page-header">
        <h1 className="page-title">Global Ticket Queue</h1>
        <p className="page-sub">Triage and assign employee requests</p>
      </div>

      {/* Filters */}
      <div className="bg-surface border border-border rounded-xl p-4 flex flex-wrap gap-4 items-end mb-8 shadow-sm">
        <div className="flex-1 min-w-[240px] relative">
          <label className="form-label text-xs tracking-widest text-gray-500 mb-1.5">Search Tickets</label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              className="form-input pl-9" 
              placeholder="Search by title..." 
              value={search} onChange={e => setSearch(e.target.value)} 
            />
          </div>
        </div>
        <div>
          <label className="form-label text-xs tracking-widest text-gray-500 mb-1.5">Status</label>
          <select className="form-select w-40" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All</option>
            {Object.values(STATUS).map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label text-xs tracking-widest text-gray-500 mb-1.5">Priority</label>
          <select className="form-select w-40" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
            <option value="">All</option>
            {Object.values(PRIORITY).map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
          </select>
        </div>
      </div>

      {error ? (
        <div className="p-8 text-center text-red-500 font-medium">{error}</div>
      ) : loading && tickets.length === 0 ? (
         <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
         </div>
      ) : tickets.length === 0 ? (
        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="empty-state bg-surface/50 border border-border border-dashed rounded-2xl">
          <Inbox size={48} className="mx-auto text-gray-600 mb-4 stroke-1" />
          <h3 className="text-lg font-semibold text-gray-200">Queue is empty</h3>
          <p className="text-sm text-gray-500 mt-1">No tickets match your filter criteria.</p>
        </motion.div>
      ) : (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-elevated/50 border-b border-border">
              <tr>
                <th className="py-3 px-4 font-semibold text-gray-400">ID</th>
                <th className="py-3 px-4 font-semibold text-gray-400">Ticket Details</th>
                <th className="py-3 px-4 font-semibold text-gray-400">Status</th>
                <th className="py-3 px-4 font-semibold text-gray-400">Priority</th>
                <th className="py-3 px-4 font-semibold text-gray-400">Assignment</th>
                <th className="py-3 px-4 text-right font-semibold text-gray-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              <AnimatePresence>
                {tickets.map((t, i) => (
                  <motion.tr 
                    key={t.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-elevated/30 transition-colors group"
                  >
                    <td className="py-4 px-4 font-mono text-gray-500 text-xs">#{t.id}</td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-200 truncate max-w-[280px] group-hover:text-primary-light transition-colors">{t.title}</div>
                      <div className="text-[11px] text-gray-500 mt-1 uppercase tracking-wider">Employee: {typeof t.createdBy === 'object' ? t.createdBy?.name : t.createdBy}</div>
                    </td>
                    <td className="py-4 px-4"><span className="capitalize text-[11px] font-bold tracking-wider px-2 py-1 rounded bg-surface border border-border text-gray-300 shadow-sm">{t.status}</span></td>
                    <td className="py-4 px-4"><span className="capitalize text-[11px] font-bold tracking-wider px-2 py-1 rounded bg-surface border border-border text-gray-300 shadow-sm">{t.priority}</span></td>
                    <td className="py-4 px-4">
                      {t.assignedTo ? (
                        <span className="text-gray-400 text-[13px] font-medium flex items-center gap-1.5"><LayoutList size={14}/> {typeof t.assignedTo === 'object' ? t.assignedTo?.name : t.assignedTo}</span>
                      ) : (
                        <span className="text-amber-500 text-[10px] font-bold uppercase tracking-widest bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 shadow-sm">Unassigned</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-end gap-2">
                        <a href={`/agent/tickets/${t.id}`} className="btn btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1.5">
                          <Eye size={14}/> View
                        </a>
                        {!t.assignedTo && (
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => assign(t.id, user.id)} 
                            className="btn btn-primary !py-1.5 !px-3 text-xs flex items-center gap-1.5 shadow-md shadow-primary/20"
                          >
                            <UserPlus size={14}/> Claim
                          </motion.button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default TicketQueue;
