import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, CheckCircle, AlertOctagon, Clock, Search, Filter } from 'lucide-react';
import { useTicketController } from '@/hooks/shared/useTickets';
import { useAdminController } from '@/hooks/admin/useAdmin';
import { StatusBadge, PriorityBadge } from '@/components/shared/Badge';
import { timeAgo } from '@/shared/utils/formatDate';

const StatCard = ({ title, value, icon: Icon, colorClass, delay }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="bg-surface border border-border rounded-2xl p-6 shadow-xl relative overflow-hidden group">
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 blur-2xl group-hover:blur-xl transition-all ${colorClass}`} />
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl bg-elevated/80 ${colorClass.replace('bg-', 'text-')}`}>
        <Icon size={24} className="stroke-[2.5px]" />
      </div>
    </div>
    <p className="text-gray-400 text-sm font-bold tracking-widest uppercase mb-1">{title}</p>
    <h3 className="text-3xl font-extrabold text-white">{value ?? '-'}</h3>
  </motion.div>
);

const AdminTickets = () => {
  const navigate = useNavigate();
  const { tickets, loading: ticketsLoading, fetchAll } = useTicketController();
  const { stats, loading: statsLoading, fetchStats } = useAdminController();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    // Debounce the fetchAll call
    const timer = setTimeout(() => {
      fetchAll({ search, status: statusFilter, priority: priorityFilter });
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchAll, search, statusFilter, priorityFilter]);

  const loading = ticketsLoading || statsLoading;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-12 space-y-8">
      <div className="page-header">
        <h1 className="page-title">Global Ticket Analytics</h1>
        <p className="page-sub">Monitor system-wide issue resolution and filter active unassigned tickets</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Tickets" value={stats?.total} icon={Inbox} colorClass="bg-blue-500" delay={0.1} />
        <StatCard title="Pending Resolution" value={(stats?.open || 0) + (stats?.inProgress || 0)} icon={Clock} colorClass="bg-amber-500" delay={0.2} />
        <StatCard title="Total Solved" value={(stats?.resolved || 0) + (stats?.closed || 0)} icon={CheckCircle} colorClass="bg-emerald-500" delay={0.3} />
        <StatCard title="SLA Breaches" value={stats?.slaBreached} icon={AlertOctagon} colorClass="bg-rose-500" delay={0.4} />
      </div>

      {/* Filters & Data Grid */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xl mt-8">
        {/* Toolbar */}
        <div className="p-4 border-b border-border/50 bg-elevated/30 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search by title, description, or ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-elevated/50 border border-border/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex w-full md:w-auto gap-3">
            <div className="relative flex-1 md:w-40">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <select 
                value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-elevated/50 border border-border/80 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold text-gray-300 uppercase tracking-widest cursor-pointer focus:outline-none focus:border-primary appearance-none"
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="relative flex-1 md:w-40">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <select 
                value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full bg-elevated/50 border border-border/80 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold text-gray-300 uppercase tracking-widest cursor-pointer focus:outline-none focus:border-primary appearance-none"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
            <thead className="bg-elevated/50 border-b border-border/50">
              <tr>
                <th className="py-3 px-6 font-semibold text-gray-400 tracking-wider">Ticket Info</th>
                <th className="py-3 px-6 font-semibold text-gray-400 tracking-wider">Creator</th>
                <th className="py-3 px-6 font-semibold text-gray-400 tracking-wider">Status</th>
                <th className="py-3 px-6 font-semibold text-gray-400 tracking-wider">Priority</th>
                <th className="py-3 px-6 font-semibold text-gray-400 tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading && tickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500 font-medium tracking-wide">
                    No tickets found matching your criteria
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {tickets.map((t, i) => (
                    <motion.tr 
                      key={t.id}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      onClick={() => navigate(`/agent/tickets/${t.id}`)}
                      className="hover:bg-elevated/30 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-6">
                        <div className="font-bold text-gray-200 group-hover:text-primary-light transition-colors max-w-xs truncate">{t.title}</div>
                        <div className="text-[11px] text-gray-500 font-mono mt-1">#{t.id}</div>
                      </td>
                      <td className="py-4 px-6 text-gray-400">
                        {t.createdBy?.name || 'Unknown'}
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="py-4 px-6">
                        <PriorityBadge priority={t.priority} />
                      </td>
                      <td className="py-4 px-6 text-gray-400 text-xs font-medium">
                        {timeAgo(t.createdAt)}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminTickets;
