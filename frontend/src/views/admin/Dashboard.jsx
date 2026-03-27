import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Flame, AlertCircle, CheckCircle2, Activity, Users, TrendingUp, Zap, BarChart3, FileText, FileSpreadsheet } from 'lucide-react';
import { useAdminController } from '@/hooks/admin/useAdmin';
import { useTicketController } from '@/hooks/shared/useTickets';
import { StatusBadge, PriorityBadge } from '@/components/shared/Badge';
import { formatDateTime } from '@/shared/utils/formatDate';
import { exportTicketsReportPDF, exportTicketsReportExcel } from '@/services/admin/exportService';

const Dashboard = () => {
  const { stats, loading, error, fetchStats } = useAdminController();
  const { tickets, fetchAll } = useTicketController();
  const [showDetails, setShowDetails] = useState(false);
  const [exportingKey, setExportingKey] = useState('');

  useEffect(() => { 
    fetchStats();
    fetchAll({ limit: 10000, skip: 0 });
  }, [fetchStats, fetchAll]);

  const handleExport = async (period, format) => {
    const key = `${period}-${format}`;
    setExportingKey(key);

    try {
      if (format === 'pdf') {
        exportTicketsReportPDF({ period, tickets, stats });
      } else {
        exportTicketsReportExcel({ period, tickets, stats });
      }
    } catch (e) {
      window.alert(`Export failed: ${e.message}`);
    } finally {
      setExportingKey('');
    }
  };

  if (loading || !stats) return (
    <div className="p-12 flex justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (error) return <div className="p-8 text-center text-red-500 font-medium">{error}</div>;

  const statCards = [
    { label: 'Total Tickets', value: stats.total, icon: Ticket,       color: 'text-gray-100', bg: 'bg-surface border-border' },
    { label: 'Open',          value: stats.open,  icon: Flame,        color: 'text-blue-500', bg: 'bg-surface border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]' },
    { label: 'In Progress',   value: stats.inProgress, icon: Activity,color: 'text-amber-500',bg: 'bg-surface border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]' },
    { label: 'Resolved',      value: stats.resolved, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-surface border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' },
    { label: 'SLA Breached',  value: stats.slaBreached, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.15)]' },
  ];

  const exportActions = [
    { key: 'monthly-pdf', label: 'Monthly PDF', period: 'monthly', format: 'pdf', icon: FileText },
    { key: 'monthly-xlsx', label: 'Monthly Excel', period: 'monthly', format: 'xlsx', icon: FileSpreadsheet },
    { key: 'all-time-pdf', label: 'All-Time PDF', period: 'all-time', format: 'pdf', icon: FileText },
    { key: 'all-time-xlsx', label: 'All-Time Excel', period: 'all-time', format: 'xlsx', icon: FileSpreadsheet },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-12">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-sub">Global system overview and complete performance analytics</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {exportActions.map((action) => {
            const Icon = action.icon;
            const isExporting = exportingKey === action.key;

            return (
              <button
                key={action.key}
                onClick={() => handleExport(action.period, action.format)}
                disabled={isExporting || tickets.length === 0}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-elevated px-3 py-2 text-xs font-semibold tracking-wide text-gray-200 transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Icon size={14} />
                {isExporting ? 'Exporting...' : action.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <AnimatePresence>
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div 
                key={card.label}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`flex flex-col p-5 rounded-2xl border ${card.bg}`}
              >
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-elevated border border-border/50 ${card.color}`}>
                  <Icon size={20} strokeWidth={2.5}/>
                </div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{card.label}</div>
                <div className={`text-3xl font-extrabold ${card.color} tracking-tight`}>{card.value}</div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        
        {/* Priority Distribution */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-xl">
          <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2"><BarChart3 size={16}/> Priority Distribution</h3>
          <div className="space-y-6">
            {stats.byPriority && Object.entries(stats.byPriority).map(([k, v]) => {
              const colors = { critical: 'bg-red-500', high: 'bg-orange-500', medium: 'bg-amber-500', low: 'bg-gray-500' };
              const barWidth = stats.total > 0 ? (v / stats.total) * 100 : 0;
              return (
                <div key={k} className="group cursor-default">
                  <div className="flex justify-between text-xs font-bold tracking-wider mb-2">
                    <span className="capitalize text-gray-300">{k}</span>
                    <span className="text-gray-400">{v} <span className="text-[10px] text-gray-600 font-medium">({Math.round(barWidth)}%)</span></span>
                  </div>
                  <div className="w-full h-2.5 bg-elevated rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                      className={`h-full ${colors[k]} rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]`} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Status Breakdown */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} className="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-xl">
          <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2"><TrendingUp size={16}/> Ticket Status Breakdown</h3>
          <div className="space-y-5">
            {[
              { label: 'Open', value: stats.open, color: 'text-blue-400', bg: 'bg-blue-500/20' },
              { label: 'In Progress', value: stats.inProgress, color: 'text-amber-400', bg: 'bg-amber-500/20' },
              { label: 'Resolved', value: stats.resolved, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
              { label: 'Closed', value: stats.closed || 0, color: 'text-gray-400', bg: 'bg-gray-500/20' }
            ].map(status => {
              const total = stats.open + stats.inProgress + stats.resolved + (stats.closed || 0);
              const width = total > 0 ? (status.value / total) * 100 : 0;
              return (
                <div key={status.label} className="group">
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className={status.color}>{status.label}</span>
                    <span className="text-gray-400">{status.value}</span>
                  </div>
                  <div className="w-full h-3 bg-elevated/50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} animate={{ width: `${width}%` }} transition={{ duration: 0.8 }}
                      className={`h-full ${status.bg} rounded-full`} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Agent Workload */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-xl">
          <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2"><Users size={16}/> Agent Task Distribution</h3>
          <div className="space-y-5">
            {(stats.agentWorkload && Object.entries(stats.agentWorkload).length > 0) ? (
              Object.entries(stats.agentWorkload).map(([agentId, count], i) => {
                const maxExpected = 10;
                const w = Math.min((count / maxExpected) * 100, 100);
                const barColor = w > 80 ? 'bg-red-500' : w > 50 ? 'bg-amber-500' : 'bg-emerald-500';
                return (
                  <div key={agentId} className="flex items-center gap-4 group">
                    <div className="w-11 h-11 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-sm shadow-inner shrink-0 group-hover:scale-110 transition-transform">
                      A{i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-xs font-bold tracking-wider mb-2">
                        <span className="text-gray-200 truncate">Agent #{i + 1}</span>
                        <span className="text-gray-400 shrink-0">{count} tickets</span>
                      </div>
                      <div className="w-full h-2 bg-elevated rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} animate={{ width: `${w}%` }} transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                          className={`h-full ${barColor} rounded-full`} 
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs font-medium text-gray-500 italic text-center py-8">No active assignments.</p>
            )}
          </div>
        </motion.div>

        {/* System Health */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }} className="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-xl">
          <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2"><Zap size={16}/> System Health</h3>
          <div className="space-y-6">
            {[
              { 
                label: 'SLA Compliance', 
                value: stats.total > 0 ? Math.round(((stats.total - stats.slaBreached) / stats.total) * 100) : 100,
                color: 'text-emerald-400'
              },
              { 
                label: 'Resolution Rate', 
                value: stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0,
                color: 'text-blue-400'
              },
              { 
                label: 'Agent Utilization', 
                value: stats.agentWorkload ? Math.round(Object.values(stats.agentWorkload).reduce((a, b) => a + b, 0) / Math.max(Object.keys(stats.agentWorkload).length, 1)) : 0,
                color: 'text-purple-400'
              }
            ].map((metric, i) => (
              <div key={metric.label}>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-gray-300">{metric.label}</span>
                  <span className={metric.color}>{metric.value}%</span>
                </div>
                <div className="w-full h-3 bg-elevated/50 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} animate={{ width: `${metric.value}%` }} transition={{ duration: 1, delay: 0.6 }}
                    className={`h-full ${metric.color.replace('text-', 'bg-')} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* All Tickets Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-8 bg-surface border border-border rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 flex items-center justify-between border-b border-border bg-elevated/30">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
            <Ticket size={16} className="text-gray-400" /> All Tickets ({tickets.length})
          </h3>
          <motion.button 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs font-bold text-primary hover:text-primary-light uppercase tracking-wider transition-colors"
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </motion.button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-elevated/50 border-b border-border/50">
              <tr>
                <th className="py-3 px-6 font-semibold text-gray-400 tracking-wider">ID</th>
                <th className="py-3 px-6 font-semibold text-gray-400 tracking-wider">Title</th>
                {showDetails && <th className="py-3 px-6 font-semibold text-gray-400 tracking-wider">Created By</th>}
                <th className="py-3 px-6 font-semibold text-gray-400 tracking-wider">Status</th>
                <th className="py-3 px-6 font-semibold text-gray-400 tracking-wider">Priority</th>
                {showDetails && <th className="py-3 px-6 font-semibold text-gray-400 tracking-wider">Assigned To</th>}
                {showDetails && <th className="py-3 px-6 font-semibold text-gray-400 tracking-wider">Issue Inputs</th>}
                {showDetails && <th className="py-3 px-6 font-semibold text-gray-400 tracking-wider">Created</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 max-h-96 overflow-y-auto block">
              <AnimatePresence>
                {tickets.slice(0, 10).map((t, i) => (
                  <motion.tr 
                    key={t.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-elevated/20 transition-colors"
                  >
                    <td className="py-4 px-6 font-mono text-gray-500 text-xs">#{t.id?.slice(-6)}</td>
                    <td className="py-4 px-6 font-bold text-gray-200 max-w-xs truncate">{t.title}</td>
                    {showDetails && <td className="py-4 px-6 text-gray-400 text-xs">{typeof t.createdBy === 'object' ? t.createdBy?.name : 'Unknown'}</td>}
                    <td className="py-4 px-6"><StatusBadge status={t.status} /></td>
                    <td className="py-4 px-6"><PriorityBadge priority={t.priority} /></td>
                    {showDetails && <td className="py-4 px-6 text-gray-400 text-xs">{typeof t.assignedTo === 'object' ? t.assignedTo?.name : (t.assignedTo ? 'Assigned' : 'Unassigned')}</td>}
                    {showDetails && (
                      <td className="py-4 px-6 text-gray-400 text-xs max-w-xs">
                        {Array.isArray(t.problemDetails) && t.problemDetails.length > 0 ? (
                          <div className="space-y-1">
                            {t.problemDetails.slice(0, 2).map((detail) => (
                              <div key={detail.key} className="truncate">
                                <span className="text-gray-500">{detail.question}:</span> <span className="text-gray-300">{detail.answer}</span>
                              </div>
                            ))}
                            {t.problemDetails.length > 2 && (
                              <div className="text-[10px] text-primary">+{t.problemDetails.length - 2} more</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-600 italic">No inputs</span>
                        )}
                      </td>
                    )}
                    {showDetails && <td className="py-4 px-6 text-gray-500 text-xs">{formatDateTime(t.createdAt).split(' ')[0]}</td>}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
