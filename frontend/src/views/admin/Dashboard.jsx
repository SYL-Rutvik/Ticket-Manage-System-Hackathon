import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Flame, AlertCircle, CheckCircle2, Clock, Activity, Users } from 'lucide-react';
import { useAdminController } from '@/hooks/admin/useAdmin';

const Dashboard = () => {
  const { stats, loading, error, fetchStats } = useAdminController();

  useEffect(() => { fetchStats(); }, [fetchStats]);

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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-12">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-sub">Global system overview and performance metrics</p>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        
        {/* Priority Breakdown */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-xl">
          <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2"><Clock size={16}/> Tickets by Priority</h3>
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

        {/* Agent Workload */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-xl">
          <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2"><Users size={16}/> Agent Workload (Active)</h3>
          <div className="space-y-5">
            {(stats.agentWorkload && Object.entries(stats.agentWorkload).length > 0) ? (
              Object.entries(stats.agentWorkload).map(([agentId, count], i) => {
                const maxExpected = 10;
                const w = Math.min((count / maxExpected) * 100, 100);
                const barColor = w > 80 ? 'bg-red-500' : 'bg-primary-light';
                return (
                  <div key={agentId} className="flex items-center gap-4 group">
                    <div className="w-11 h-11 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-sm shadow-inner shrink-0 group-hover:scale-110 transition-transform">
                      A{agentId}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs font-bold tracking-wider mb-2">
                        <span className="text-gray-200">Agent #{agentId}</span>
                        <span className="text-gray-400">{count} tickets</span>
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
              <p className="text-xs font-medium text-gray-500 italic text-center py-8">No agent workload data available.</p>
            )}
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default Dashboard;
