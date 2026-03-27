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
    <div className="p-12 flex justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (error) return <div className="p-8 text-center text-red-500 font-medium">Failed to load tickets: {error}</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-10">
      
      <div className="flex items-center justify-between page-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">My Tickets</h1>
          <p className="text-sm text-gray-400 mt-1">Track and manage your requests</p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link to="/employee/tickets/create" className="btn btn-primary shadow-lg shadow-primary/20">
            <PlusCircle size={18} /> New Ticket
          </Link>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {tickets.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="empty-state bg-surface/50 border border-border border-dashed rounded-2xl"
          >
            <TicketIcon size={48} className="mx-auto text-gray-600 mb-4 stroke-1" />
            <h3 className="text-lg font-semibold text-gray-200">No tickets found</h3>
            <p className="text-sm text-gray-500 mt-1">You haven't submitted any support requests yet.</p>
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
