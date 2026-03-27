import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Hash, Clock, Eye, AlertCircle, ChevronRight } from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../shared/Badge';
import SLABadge from './SLABadge';
import { timeAgo } from '@/shared/utils/formatDate';

const TicketCard = ({ ticket, role }) => {
  const detailPath = role === 'employee' ? `/employee/tickets/${ticket.id}` : `/agent/tickets/${ticket.id}`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={detailPath} className="block bg-surface/60 border border-border/80 hover:bg-surface hover:border-primary/50 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all no-underline text-inherit group relative overflow-hidden">
        
        {/* Subtle hover gradient fx */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 md:gap-6 relative z-10">
          
          {/* Main Info */}
          <div className="flex-1 min-w-0 w-full">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="flex items-center gap-1.5 text-gray-400 font-mono text-[11px] font-bold tracking-widest bg-elevated/50 px-2 py-1 rounded-md border border-border/50">
                <Hash size={12} className="opacity-70 text-primary" /> {ticket.id}
              </span>
              <StatusBadge status={ticket.status} />
              
              {role === 'employee' && (
                <span className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md tracking-wider uppercase border ${ticket.assignedTo ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                  {ticket.assignedTo ? <><Eye size={12} /> Assigned</> : <><AlertCircle size={12} /> Awaiting</>}
                </span>
              )}

              <span className="flex items-center gap-1 text-gray-500 text-[11px] font-bold uppercase tracking-wider ml-auto sm:ml-0">
                <Clock size={12} /> {timeAgo(ticket.createdAt)}
              </span>
            </div>
            
            <h3 className="text-lg md:text-xl font-extrabold text-white mb-2 truncate group-hover:text-primary-light transition-colors tracking-tight">
              {ticket.title}
            </h3>
            <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed font-medium">
              {ticket.description}
            </p>
          </div>

          {/* Metadata / Badges */}
          <div className="flex sm:flex-col flex-row flex-wrap items-center sm:items-end w-full sm:w-auto gap-3 shrink-0 pt-1 mt-2 sm:mt-0 border-t border-border/50 sm:border-0 pt-4 sm:pt-0">
            {role !== 'employee' && <PriorityBadge priority={ticket.priority} />}
            <SLABadge dueAt={ticket.sla_due_at} status={ticket.status} />
            
            {/* Arrow indicator for desktop */}
            <div className="hidden sm:flex mt-2 items-center justify-center w-8 h-8 rounded-full bg-elevated text-gray-500 group-hover:bg-primary group-hover:text-white transition-colors">
              <ChevronRight size={18} />
            </div>
          </div>
        
        </div>
      </Link>
    </motion.div>
  );
};

export default TicketCard;
