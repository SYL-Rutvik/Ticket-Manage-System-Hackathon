import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Hash, Clock } from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../shared/Badge';
import SLABadge from './SLABadge';
import { timeAgo } from '@/shared/utils/formatDate';

const TicketCard = ({ ticket, role }) => {
  const detailPath = role === 'customer' ? `/customer/tickets/${ticket.id}` : `/agent/tickets/${ticket.id}`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.005 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={detailPath} className="block bg-surface border border-border hover:border-primary/40 rounded-xl p-5 shadow-sm hover:shadow-lg transition-all no-underline text-inherit group">
        <div className="flex justify-between items-start gap-4">
          
          {/* Left Side */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2.5">
              <span className="flex items-center gap-1 text-gray-500 font-mono text-xs font-semibold bg-elevated px-1.5 py-0.5 rounded">
                <Hash size={12} className="opacity-70" /> {ticket.id}
              </span>
              <StatusBadge status={ticket.status} />
              <span className="flex items-center gap-1 text-gray-500 text-xs font-medium">
                <Clock size={12} /> {timeAgo(ticket.createdAt)}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-gray-100 mb-1.5 truncate group-hover:text-primary-light transition-colors">
              {ticket.title}
            </h3>
            <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
              {ticket.description}
            </p>
          </div>

          {/* Right Side */}
          <div className="flex flex-col items-end gap-2 shrink-0 pt-1">
            <PriorityBadge priority={ticket.priority} />
            {role !== 'customer' && <SLABadge dueAt={ticket.sla_due_at} status={ticket.status} />}
          </div>
        
        </div>
      </Link>
    </motion.div>
  );
};

export default TicketCard;
