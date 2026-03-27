import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, PlusCircle, Inbox, Users as UsersIcon, LayoutDashboard, Clock, LogOut, Menu, X, BookOpen, Settings, ShieldCog, Wifi, WifiOff } from 'lucide-react';
import { request } from '@/services/shared/api';

const navConfig = {
  employee: [
    { label: 'My Tickets', path: '/employee/tickets', icon: Ticket },
    { label: 'New Ticket', path: '/employee/tickets/create', icon: PlusCircle },
    { label: 'Knowledge Base', path: '/employee/kb', icon: BookOpen }, // New feature
  ],
  agent: [
    { label: 'Ticket Queue', path: '/agent/queue', icon: Inbox },
    { label: 'My Assigned', path: '/agent/assigned', icon: UsersIcon },
  ],
  admin: [
    { label: 'Dashboard',    path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'All Tickets',  path: '/admin/tickets',   icon: Inbox },
    { label: 'Employees',    path: '/admin/employees', icon: UsersIcon },
    { label: 'Agents',       path: '/admin/agents',    icon: ShieldCog },
    { label: 'SLA Config',   path: '/admin/sla',       icon: Clock },
  ],
};

const roleColor = { employee: 'bg-blue-500', agent: 'bg-amber-500', admin: 'bg-indigo-500' };
const roleBg = { employee: 'from-blue-600/10 hover:from-blue-600/20', agent: 'from-amber-600/10 hover:from-amber-600/20', admin: 'from-indigo-600/10 hover:from-indigo-600/20' };

const Sidebar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Agent online / offline status — persisted to DB on every toggle
  const [isOnline, setIsOnline] = useState(true);
  const [toggling, setToggling] = useState(false);

  const links = navConfig[user?.role] ?? [];

  const handleLogout = () => { signOut(); navigate('/login'); };

  // Close sidebar on route change on mobile
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; }
  }, [isOpen]);

  // Load persisted and server availability for agents on mount
  useEffect(() => {
    if (user?.role !== 'agent') return;

    const cached = sessionStorage.getItem('agentIsOnline');
    if (cached !== null) setIsOnline(cached === 'true');

    const loadAvailability = async () => {
      try {
        const me = await request('/users/me');
        const status = Boolean(me.isAvailable);
        setIsOnline(status);
        sessionStorage.setItem('agentIsOnline', String(status));
      } catch {
        // keep cached value when network call fails
      }
    };

    loadAvailability();
  }, [user?.role]);

  // Toggle Online ↔ Offline and persist to server
  const handleToggleOnline = async () => {
    setToggling(true);
    try {
      const res = await request('/users/me/availability', { method: 'PATCH' });
      const newStatus = res.isAvailable;
      setIsOnline(newStatus);
      // Broadcast to other views (e.g. TicketQueue) without prop drilling
      sessionStorage.setItem('agentIsOnline', String(newStatus));
      window.dispatchEvent(new Event('agentAvailabilityChanged'));
    } catch {
      // silently ignore on network error
    } finally {
      setToggling(false);
    }
  };


  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className={`px-5 py-6 bg-gradient-to-b ${roleBg[user?.role]} border-b border-border/50 transition-colors duration-300`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 border border-primary/30 rounded-xl flex items-center justify-center text-primary shadow-inner">
            <Ticket size={22} className="stroke-[2.5px]" />
          </div>
          <div>
            <p className="text-base font-extrabold text-white tracking-widest uppercase">TicketFlow</p>
            <p className="text-[10px] text-gray-400 font-bold tracking-widest mt-0.5">V2.0 PRO</p>
          </div>
        </div>
      </div>

      {/* User chip */}
      <div className="px-5 py-5 border-b border-border/50">
        <div className="flex items-center gap-3">
          {/* Avatar with availability dot for agents */}
          <div className="relative shrink-0">
            <div className={`w-10 h-10 rounded-full ${roleColor[user?.role]} flex items-center justify-center text-white text-sm font-bold shadow-lg ring-2 ring-elevated`}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            {user?.role === 'agent' && (
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-surface transition-colors duration-300 ${isOnline ? 'bg-emerald-500' : 'bg-gray-500'
                  }`}
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-gray-100 truncate">{user?.name}</p>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">{user?.role}</p>
          </div>
        </div>

        {/* ── Agent Online / Offline Toggle ── */}
        {user?.role === 'agent' && (
          <motion.button
            whileHover={{ scale: toggling ? 1 : 1.02 }}
            whileTap={{ scale: toggling ? 1 : 0.97 }}
            onClick={handleToggleOnline}
            disabled={toggling}
            className={`mt-3 w-full flex items-center justify-between px-4 py-2.5 rounded-xl border font-bold text-xs transition-all duration-300 ${isOnline
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
              : 'bg-gray-700/30 border-gray-600/40 text-gray-400 hover:bg-gray-700/50'
              }`}
          >
            <span className="flex items-center gap-2.5">
              {isOnline
                ? <Wifi size={14} className="text-emerald-400" />
                : <WifiOff size={14} className="text-gray-500" />
              }
              {isOnline ? 'Online — Accepting tickets' : 'Offline — Not accepting'}
            </span>

            {/* Toggle pill */}
            <span className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border transition-colors duration-300 ${isOnline ? 'bg-emerald-500 border-emerald-400' : 'bg-gray-600 border-gray-500'
              }`}>
              <span className={`absolute top-0.5 left-0.5 h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-300 ${toggling ? 'opacity-60' : 'opacity-100'
                } ${isOnline ? 'translate-x-4' : 'translate-x-0'}`} />
            </span>
          </motion.button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto w-full">
        <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest px-3 mb-4">Main Menu</p>

        {links.map(link => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `group flex items-center gap-3.5 px-4 py-3 rounded-xl text-[14px] font-semibold transition-all duration-200 ${isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-elevated/70'
                }`
              }
            >
              <Icon size={18} className="transition-opacity" />
              {link.label}
            </NavLink>
          );
        })}

        {/* Options */}
        <div className="pt-6 mt-6 border-t border-border/50">
          <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest px-3 mb-4">Options</p>
          <NavLink
            to={user?.role === 'admin' ? '/admin/profile' : user?.role === 'agent' ? '/agent/profile' : '/employee/profile'}
            className={({ isActive }) =>
              `w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-[14px] font-semibold transition-all duration-200 text-left ${isActive
                ? 'bg-primary/20 text-primary-light border-l-4 border-primary'
                : 'text-gray-400 hover:text-gray-100 hover:bg-elevated/70'
              }`
            }
          >
            <Settings size={18} className="transition-opacity" /> Profile Settings
          </NavLink>
        </div>
      </nav>

      {/* Logout */}
      <div className="p-5 border-t border-border/50 bg-base">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-[14px] font-bold text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all shadow-sm"
        >
          <LogOut size={18} /> Sign Out
        </motion.button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Top Navbar (Always visible on mobile, hidden on lg) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-surface/90 backdrop-blur-md border-b border-border z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2 text-white font-extrabold uppercase tracking-widest">
          <Ticket size={20} className="text-primary" /> TicketFlow
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 -mr-2 text-gray-300 hover:text-white transition-colors focus:outline-none"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container (Responsive) */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className="fixed lg:translate-x-0 lg:left-0 top-0 h-full w-64 md:w-72 bg-surface border-r border-border flex flex-col z-50 shadow-2xl lg:shadow-none"
        style={{ transform: `translateX(var(--translate-x, 0))` }}
      >
        <SidebarContent />
      </motion.aside>

      {/* CSS fix for framer-motion SSR behavior on desktop */}
      <style>{`
        @media (min-width: 1024px) {
          aside { transform: translateX(0) !important; }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
