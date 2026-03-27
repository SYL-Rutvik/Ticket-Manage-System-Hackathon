import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Ticket as TicketIcon } from 'lucide-react';
import { useTicketController } from '@/hooks/shared/useTickets';
import TicketCard from '@/components/shared/TicketCard';

const MyTickets = () => {
  const { tickets, loading, error, fetchMine } = useTicketController();

  useEffect(() => { fetchMine(); }, [fetchMine]);

  if (loading) return (
    <div className="min-h-[50vh] flex justify-center items-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-lg shadow-primary/20" />
    </div>
  );
  if (error) return (
    <div className="p-8 mt-10 text-center bg-red-500/10 border border-red-500/20 rounded-2xl max-w-lg mx-auto">
      <p className="text-red-400 font-bold">{error}</p>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-12 max-w-5xl mx-auto">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">My Tickets</h1>
          <p className="text-sm font-medium text-gray-400 mt-1">Track and manage your requests</p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
          <Link to="/employee/tickets/create" className="btn bg-primary hover:bg-primary-light text-white w-full sm:w-auto justify-center px-6 py-3 rounded-xl shadow-[0_4px_14px_0_rgba(79,70,229,0.25)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.30)] font-bold tracking-wide transition-all text-sm">
            <PlusCircle size={18} className="mr-2" /> New Support Ticket
          </Link>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {tickets.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-12 bg-surface/40 border border-border/60 border-dashed rounded-3xl mt-4"
          >
            <div className="w-20 h-20 bg-elevated rounded-full flex items-center justify-center mb-6 shadow-inner">
              <TicketIcon size={32} className="text-gray-500 stroke-[1.5px]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No tickets yet</h3>
            <p className="text-sm text-gray-400 text-center max-w-md mb-8 leading-relaxed font-medium">When you submit requests or report issues, you'll be able to track their status and updates here.</p>
            <Link to="/employee/tickets/create" className="text-primary font-bold hover:text-primary-light transition-colors flex items-center gap-2">
              Create your first ticket <PlusCircle size={16} />
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            className="space-y-4"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.05 } }
            }}
          >
            {tickets.map(t => <TicketCard key={t.id} ticket={t} role="employee" />)}
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default MyTickets;
