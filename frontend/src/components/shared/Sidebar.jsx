import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/context/AuthContext';
import { motion } from 'framer-motion';
import { Ticket, PlusCircle, Inbox, Users as UsersIcon, LayoutDashboard, UserCog, Clock, LogOut } from 'lucide-react';

const navConfig = {
  customer: [
    { label: 'My Tickets',    path: '/customer/tickets',        icon: Ticket },
    { label: 'New Ticket',    path: '/customer/tickets/create', icon: PlusCircle },
  ],
  agent: [
    { label: 'Ticket Queue', path: '/agent/queue',    icon: Inbox },
    { label: 'My Assigned',  path: '/agent/assigned', icon: UsersIcon },
  ],
  admin: [
    { label: 'Dashboard',    path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'User Mgmt',    path: '/admin/users',     icon: UserCog },
    { label: 'SLA Config',   path: '/admin/sla',       icon: Clock },
  ],
};

const roleColor = { customer: 'bg-blue-500', agent: 'bg-amber-500', admin: 'bg-indigo-500' };
const roleBg    = { customer: 'from-blue-600/10 hover:from-blue-600/20',  agent: 'from-amber-600/10 hover:from-amber-600/20',  admin: 'from-indigo-600/10 hover:from-indigo-600/20' };

const Sidebar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const links = navConfig[user?.role] ?? [];

  const handleLogout = () => { signOut(); navigate('/login'); };

  return (
    <motion.aside 
      initial={{ x: -240 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-0 h-screen w-64 bg-surface/80 backdrop-blur-xl border-r border-border flex flex-col z-30"
    >
      {/* Brand */}
      <div className={`px-5 py-6 bg-gradient-to-b ${roleBg[user?.role]} border-b border-border transition-colors duration-300`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary/20 border border-primary/30 rounded-xl flex items-center justify-center text-primary shadow-inner">
            <Ticket size={20} className="stroke-[2.5px]" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-100 uppercase tracking-wider">TicketFlow</p>
            <p className="text-[10px] text-gray-400 font-medium tracking-widest mt-0.5">V2.0 PRO</p>
          </div>
        </div>
      </div>

      {/* User chip */}
      <div className="px-5 py-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full ${roleColor[user?.role]} flex items-center justify-center text-white text-xs font-bold shadow-lg`}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-200 truncate">{user?.name}</p>
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-widest mt-0.5">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-3 mb-4">Navigation</p>
        
        {links.map(link => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-3 rounded-xl text-[13.5px] font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-elevated/50'
                }`
              }
            >
              <Icon size={18} className="opacity-80 group-hover:opacity-100 transition-opacity" />
              {link.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border/50">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout} 
          className="w-full flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-xl text-[13.5px] font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
        >
          <LogOut size={16} /> Sign Out
        </motion.button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
