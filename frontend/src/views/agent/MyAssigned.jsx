import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutList, CheckCircle2, PlayCircle } from 'lucide-react';
import { useTicketController } from '@/hooks/shared/useTickets';
import { useAuth } from '@/shared/context/AuthContext';
import TicketCard from '@/components/shared/TicketCard';

const MyAssigned = () => {
  const { user } = useAuth();
  const { tickets, loading, error, fetchAll } = useTicketController();

  useEffect(() => { 
    fetchAll({ assignedTo: user.id }); 
  }, [fetchAll, user.id]);

  if (loading) return (
    <div className="p-12 flex justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (error) return <div className="p-8 text-center text-red-500 font-medium">{error}</div>;

  const active    = tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed');
  const completed = tickets.filter(t => t.status === 'resolved' || t.status === 'closed');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-10">
      <div className="page-header">
        <h1 className="page-title">My Assigned Tickets</h1>
        <p className="page-sub">Tickets you are actively working on</p>
      </div>

      {tickets.length === 0 ? (
        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="empty-state bg-surface/50 border border-border border-dashed rounded-2xl">
          <LayoutList size={48} className="mx-auto text-gray-600 mb-4 stroke-1" />
          <h3 className="text-lg font-semibold text-gray-200">No assigned tickets</h3>
          <p className="text-sm text-gray-500 mt-1">You're all caught up! Head to the Queue to claim more work.</p>
        </motion.div>
      ) : (
        <div className="space-y-12">
          
          <section>
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-5 flex items-center gap-2">
              <PlayCircle size={16} className="text-primary-light" /> Action Required ({active.length})
            </h2>
            {active.length === 0 ? (
              <p className="text-gray-500 text-sm italic bg-surface/30 p-4 rounded-xl border border-dashed border-border">No active tickets.</p>
            ) : (
              <motion.div 
                className="space-y-4"
                initial="hidden" animate="show"
                variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
              >
                {active.map(t => <TicketCard key={t.id} ticket={t} role="agent" />)}
              </motion.div>
            )}
          </section>

          {completed.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-5 flex items-center gap-2 mt-8 pt-8 border-t border-border">
                <CheckCircle2 size={16} className="text-emerald-500" /> Completed ({completed.length})
              </h2>
              <div className="space-y-4 opacity-60 hover:opacity-100 transition-opacity duration-300">
                {completed.map(t => <TicketCard key={t.id} ticket={t} role="agent" />)}
              </div>
            </section>
          )}

        </div>
      )}
    </motion.div>
  );
};

export default MyAssigned;
