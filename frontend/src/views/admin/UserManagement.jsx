import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Trash2, ShieldCog } from 'lucide-react';
import { useAdminController } from '@/hooks/admin/useAdmin';
import { RoleBadge } from '@/components/shared/Badge';
import { useAuth } from '@/shared/context/AuthContext';

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const { users, loading, error, fetchUsers, changeRole, removeUser } = useAdminController();

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  if (loading) return (
    <div className="p-12 flex justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (error) return <div className="p-8 text-center text-red-500 font-medium">{error}</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-12">
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <p className="page-sub">Control role-based access for the entire system</p>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 flex items-center gap-2 border-b border-border bg-elevated/30">
          <Users size={16} className="text-gray-400" />
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest">Active Accounts ({users.length})</h3>
        </div>
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-elevated/50 border-b border-border/50">
            <tr>
              <th className="py-3 px-6 font-semibold text-gray-400 tracking-wider">ID</th>
              <th className="py-3 px-6 font-semibold text-gray-400 tracking-wider">User Details</th>
              <th className="py-3 px-6 font-semibold text-gray-400 tracking-wider">Role Access Level</th>
              <th className="py-3 px-6 text-right font-semibold text-gray-400 tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            <AnimatePresence>
              {users.map((u, i) => (
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
                      {u.id !== currentUser.id && (
                        <div className="relative">
                          <ShieldCog size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                          <select 
                            className="form-select w-36 !pl-7 !py-1.5 !pr-8 !text-[11px] bg-elevated/50 border-border/60 hover:border-primary/50 font-bold uppercase tracking-wider text-gray-300 transition-colors"
                            value={u.role}
                            onChange={e => changeRole(u.id, e.target.value)}
                          >
                            <option value="customer">Customer</option>
                            <option value="agent">Agent</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    {u.id !== currentUser.id ? (
                      <motion.button 
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => { if(window.confirm(`Permanently delete ${u.name}?`)) removeUser(u.id); }} 
                        className="btn btn-danger !py-1.5 !px-3 text-xs flex items-center justify-end gap-1.5 ml-auto opacity-70 hover:opacity-100"
                      >
                        <Trash2 size={14} /> Remove
                      </motion.button>
                    ) : (
                      <span className="text-[10px] uppercase font-bold tracking-widest text-primary/70 bg-primary/10 px-2 py-1 rounded inline-block">Myself</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default UserManagement;
