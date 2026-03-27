import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/shared/context/AuthContext';
import { useAuthController } from '@/hooks/shared/useAuth';
import { ROLE_HOME } from '@/shared/utils/constants';
import { motion } from 'framer-motion';
import { Ticket, AlertTriangle, ShieldCheck, User, Sparkles } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { user, signIn } = useAuth();
  const { loginUser, error, loading } = useAuthController();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (user) return <Navigate to={ROLE_HOME[user.role]} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const u = await loginUser(email, password, signIn);
    if (u) navigate(ROLE_HOME[u.role]);
  };

  const seedUsers = [
    { email: 'admin@example.com', role: 'admin', icon: ShieldCheck },
    { email: 'agent@example.com', role: 'agent', icon: Sparkles },
    { email: 'customer@example.com', role: 'customer', icon: User },
  ];

  return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface via-base to-base">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <motion.div 
            whileHover={{ rotate: 15, scale: 1.1 }}
            className="w-16 h-16 bg-gradient-to-tr from-primary to-primary-light rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.3)] mb-5 text-white"
          >
            <Ticket size={32} className="stroke-[2.5px]" />
          </motion.div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400 mb-2 tracking-tight">
            TicketFlow
          </h1>
          <p className="text-gray-400 text-sm font-medium">Professional Service Management</p>
        </div>

        {/* Form Card */}
        <div className="bg-surface/60 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-2xl shadow-black/50">
          {error && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[13px] font-semibold flex items-center gap-2.5 overflow-hidden"
            >
              <AlertTriangle size={16} /> {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="form-label text-[11px]">Email Address</label>
              <input 
                type="email" 
                required 
                className="form-input bg-elevated/50 border-border/60 focus:bg-elevated focus:ring-primary/30" 
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="form-label text-[11px] !mb-0">Password</label>
                <a href="#" className="text-[11px] text-primary font-semibold hover:text-primary-light transition-colors">Recover?</a>
              </div>
              <input 
                type="password" 
                required 
                className="form-input bg-elevated/50 border-border/60 focus:bg-elevated focus:ring-primary/30" 
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              className="btn btn-primary w-full justify-center text-sm font-bold tracking-wide py-3 mt-4 rounded-xl shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] border-t border-white/10" 
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </motion.button>
          </form>

          <div className="mt-6 text-center text-[12px] text-gray-500 font-medium">
            Don't have an account? <Link to="/register" className="text-primary hover:text-primary-light font-bold transition-colors">Sign up here</Link>
          </div>
        </div>

        {/* Hackathon Helpers */}
        <div className="mt-10 text-center">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">Quick Testing Personas</p>
          <div className="flex justify-center gap-3 flex-wrap">
            {seedUsers.map(u => {
              const Icon = u.icon;
              return (
                <motion.button 
                  whileHover={{ y: -2 }}
                  key={u.role}
                  onClick={() => { setEmail(u.email); setPassword('password123'); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface/50 border border-border/80 text-[11px] font-semibold text-gray-400 hover:text-primary hover:border-primary/50 transition-all shadow-sm"
                >
                  <Icon size={14} /> {u.role}
                </motion.button>
              );
            })}
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default Login;
