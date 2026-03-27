import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Clock, RefreshCcw } from 'lucide-react';
import { useTicketController } from '@/hooks/shared/useTickets';
import { StatusBadge, PriorityBadge } from '@/components/shared/Badge';
import CommentSection from '@/components/shared/CommentSection';
import { formatDateTime } from '@/shared/utils/formatDate';

const TicketDetail = () => {
  const { id } = useParams();
  const { ticket, loading, error, fetchOne, changeStatus } = useTicketController();

  useEffect(() => { fetchOne(id); }, [id, fetchOne]);

  if (loading || !ticket) return (
    <div className="p-12 flex justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (error) return <div className="p-8 text-center text-red-500 font-medium">{error}</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto pb-12 space-y-6">
      
      {/* Header Actions */}
      <div className="flex items-center gap-3 text-[13px] font-semibold tracking-wide text-gray-500 mb-2 uppercase">
        <Link to="/customer/tickets" className="hover:text-primary flex items-center gap-1.5 transition-colors">
          <ArrowLeft size={14} /> Back to My Tickets
        </Link>
        <span>/</span>
        <span className="text-gray-400">Ticket #{ticket.id}</span>
      </div>

      <motion.div 
        initial={{ y: 20 }} animate={{ y: 0 }}
        className="bg-surface border border-border rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 border-b border-border pb-8 mb-8">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-100 mb-4 tracking-tight leading-snug">{ticket.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-400">
                <span className="flex items-center gap-1.5 bg-elevated px-2 py-1 rounded">
                  <User size={14} className="text-gray-500" /> You
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-gray-500" /> {formatDateTime(ticket.createdAt)}
                </span>
                {ticket.reopened && (
                  <span className="flex items-center gap-1.5 text-amber-500 border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 rounded text-xs">
                    <RefreshCcw size={12} /> Reopened
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col md:items-end gap-3 shrink-0">
              <div className="flex gap-2.5">
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
              </div>
              
              {/* Customer Reopen Action */}
              {ticket.status === 'resolved' && (
                <motion.button 
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => changeStatus(ticket.id, 'open')} 
                  className="btn btn-secondary btn-sm mt-3 w-full justify-center text-[13px]"
                >
                  <RefreshCcw size={14} /> Reopen Ticket
                </motion.button>
              )}
            </div>
          </div>

          <div className="prose prose-invert max-w-none">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Description</h3>
            <p className="text-gray-300 text-[15px] whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
          </div>
        </div>

        {/* Public Comments */}
        <div className="bg-elevated/30 border-t border-border p-6 md:p-8">
          <CommentSection ticketId={ticket.id} />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TicketDetail;
