import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/shared/context/AuthContext';
import { User, Mail, Shield, Key, AlertCircle, CheckCircle, Save } from 'lucide-react';
import { API_URL } from '@/shared/utils/constants';

const Profile = () => {
  const { user, token } = useAuth();

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      return setStatus({ type: 'error', message: 'New passwords do not match' });
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const res = await fetch(`${API_URL}/users/me/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to update password');

      setStatus({ type: 'success', message: 'Password updated successfully' });
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto pb-12">

      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <User size={28} className="text-primary" /> Profile Settings
        </h1>
        <p className="text-gray-400 mt-2 font-medium">Manage your personal information and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* User Info Card */}
        <div className="md:col-span-1">
          <div className="bg-surface/50 border border-border/60 rounded-3xl p-6 shadow-xl">
            <div className="flex flex-col items-center pb-6 border-b border-border/50">
              <div className="w-24 h-24 rounded-full bg-primary/20 border-4 border-primary/30 flex items-center justify-center text-primary text-3xl font-bold shadow-inner mb-4">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-white">{user?.name}</h2>
              <span className="text-xs font-bold px-2 py-1 mt-2 rounded bg-elevated text-gray-400 uppercase tracking-widest border border-border shadow-sm">
                Role: {user?.role}
              </span>
            </div>

            <div className="py-6 space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-400 font-medium">
                <Mail size={16} className="text-primary" />
                <span className="truncate">{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-emerald-400 font-medium bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                <Shield size={16} />
                <span>Account Active & Secure</span>
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Form */}
        <div className="md:col-span-2">
          <div className="bg-surface/50 border border-border/60 rounded-3xl p-6 md:p-8 shadow-xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-border/50 pb-4 mb-6">
              <Key size={20} className="text-primary" /> Change Password
            </h3>

            {status.message && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className={`mb-6 p-4 rounded-xl flex gap-3 items-start border ${status.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                {status.type === 'error' ? <AlertCircle size={18} className="shrink-0 mt-0.5" /> : <CheckCircle size={18} className="shrink-0 mt-0.5" />}
                <p className="text-sm font-bold">{status.message}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Current Password</label>
                <input
                  type="password"
                  required
                  className="w-full bg-elevated/40 border border-border/80 rounded-xl px-4 py-3 text-base text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  value={passwords.current}
                  onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="w-full bg-elevated/40 border border-border/80 rounded-xl px-4 py-3 text-base text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    value={passwords.new}
                    onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="w-full bg-elevated/40 border border-border/80 rounded-xl px-4 py-3 text-base text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    value={passwords.confirm}
                    onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary-light text-white rounded-xl px-8 py-3.5 text-sm font-bold tracking-wide transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.25)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.30)] disabled:opacity-50"
                  disabled={loading}
                >
                  <Save size={18} /> {loading ? 'Saving...' : 'Save New Password'}
                </motion.button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default Profile;
