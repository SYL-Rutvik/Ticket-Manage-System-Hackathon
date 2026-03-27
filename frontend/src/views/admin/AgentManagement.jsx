import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Trash2, ShieldCog, Plus, X, Mail, AlertCircle } from 'lucide-react';
import { useAdminController } from '@/hooks/admin/useAdmin';
import { useAuth } from '@/shared/context/AuthContext';
import { RoleBadge } from '@/components/shared/Badge';

const AgentManagement = () => {
  const { user: currentUser } = useAuth();
  const { users, loading, fetchUsers, changeRole, removeUser, addUser } = useAdminController();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', role: 'agent' });

  // Filter only staff/agents (exclude entry-level employees)
  const agents = users.filter(u => u.role === 'agent' || u.role === 'admin');

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    setFormError('');
    const success = await addUser({ ...formData, role: 'agent' });
    if (!success) {
      setFormError('Failed to create agent. Email may already be registered.');
    } else {
      setIsModalOpen(false);
      setFormData({ name: '', email: '', role: 'agent' });
    }
  };

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  if (loading && !isModalOpen && agents.length === 0) return (
    <div className="p-12 flex justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="page-header mb-0">
          <h1 className="page-title">Agent Management</h1>
          <p className="page-sub">Administer support agents and system administrators</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-light text-white px-5 py-2.5 rounded-xl font-bold text-sm tracking-wide flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
        >
          <Plus size={18} /> Add New Agent
        </motion.button>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 flex items-center gap-2 border-b border-border bg-elevated/30">
          <ShieldCog size={16} className="text-gray-400" />
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest">Active Staff ({agents.length})</h3>
        </div>
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-elevated/50 border-b border-border/50">
            <tr>
              <th className="py-3 px-6 font-semibold text-gray-400 tracking-wider">ID</th>
              <th className="py-3 px-6 font-semibold text-gray-400 tracking-wider">Staff Details</th>
              <th className="py-3 px-6 font-semibold text-gray-400 tracking-wider">Role Access Level</th>
              <th className="py-3 px-6 text-right font-semibold text-gray-400 tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {agents.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-gray-500 font-medium tracking-wide">
                  No staff accounts found.
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {agents.map((u, i) => (
                  <motion.tr 
                    key={u.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-elevated/30 transition-colors group"
                  >
                    <td className="py-4 px-6 font-mono text-gray-500 text-xs">#{u.id}</td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-200 group-hover:text-primary-light transition-colors">{u.name}</div>
                      <div className="text-[11px] text-gray-500 font-medium mt-0.5">{u.email}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <RoleBadge role={u.role} />
                        {u.id !== currentUser.id && u.role !== 'admin' && (
                          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-1.5 rounded inline-block">Agent Only</span>
                        )}
                        {u.role === 'admin' && (
                          <span className="text-[10px] uppercase font-bold tracking-widest text-red-500 bg-red-500/10 px-2.5 py-1.5 rounded inline-block">Protected Role</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {u.id !== currentUser.id && u.role !== 'admin' ? (
                        <motion.button 
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => { if(window.confirm(`Permanently delete agent ${u.name}?`)) removeUser(u.id); }} 
                          className="btn btn-danger !py-1.5 !px-3 text-xs flex items-center justify-end gap-1.5 ml-auto opacity-70 hover:opacity-100"
                        >
                          <Trash2 size={14} /> Remove
                        </motion.button>
                      ) : u.id === currentUser.id ? (
                        <span className="text-[10px] uppercase font-bold tracking-widest text-primary/70 bg-primary/10 px-2 py-1 rounded inline-block">Myself</span>
                      ) : null}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Agent Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-surface border border-border/80 p-8 rounded-3xl shadow-2xl w-full max-w-md z-10 overflow-hidden">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors bg-elevated/50 p-1.5 rounded-full"><X size={18} /></button>
              
              <h2 className="text-xl font-extrabold text-white mb-2">Provision Support Agent</h2>
              <p className="text-sm font-medium text-gray-400 mb-6 flex-1 pr-6">Create a new Agent account. Secure credentials will be generated and emailed.</p>
              
              {formError && (
                <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold flex gap-2 items-start"><AlertCircle size={16} className="shrink-0 mt-0.5" /> <p>{formError}</p></div>
              )}

              <form onSubmit={handleCreateAgent} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Full Name</label>
                  <input required className="w-full bg-elevated/40 border border-border/80 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="Jane Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input required type="email" className="w-full bg-elevated/40 border border-border/80 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="jane.agent@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>
                <div className="pt-4">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-400 text-white rounded-xl py-3.5 text-sm font-bold tracking-wide transition-all shadow-[0_4px_14px_0_rgba(245,158,11,0.25)] disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <><ShieldCog size={16}/> Provision Agent Account</>}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AgentManagement;
