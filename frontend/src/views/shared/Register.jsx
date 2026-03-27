import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/shared/context/AuthContext';
import { useAuthController } from '@/hooks/shared/useAuth';
import { ROLE_HOME } from '@/shared/utils/constants';
import { motion } from 'framer-motion';
import { Ticket, AlertTriangle, UserPlus } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { user, signIn } = useAuth();
  const { registerUser, error, loading } = useAuthController();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (user) return <Navigate to={ROLE_HOME[user.role]} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const u = await registerUser({ name, email, password }, signIn);
    if (u) navigate(ROLE_HOME[u.role]);
  };

  return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface via-base to-base">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
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
            Join TicketFlow
          </h1>
          <p className="text-gray-400 text-sm font-medium">Create a customer account to get started.</p>
        </div>

        {/* Form Card */}
        <div className="bg-surface/60 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-2xl shadow-black/50">
          {error && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[13px] font-semibold flex items-center gap-2.5 overflow-hidden"
            >
              <AlertTriangle size={16} className="shrink-0" /> {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="form-label text-[11px]">Full Name</label>
              <input 
                type="text" 
                required 
                className="form-input bg-elevated/50 border-border/60 focus:bg-elevated focus:ring-primary/30" 
                placeholder="John Doe"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

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
              <label className="form-label text-[11px]">Password</label>
              <input 
                type="password" 
                required 
                minLength="6"
                className="form-input bg-elevated/50 border-border/60 focus:bg-elevated focus:ring-primary/30" 
                placeholder="Minimum 6 characters"
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
              <UserPlus size={16} className="mr-2" /> {loading ? 'Creating Account...' : 'Sign Up'}
            </motion.button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500 font-medium">
            Already have an account? <Link to="/login" className="text-primary hover:text-primary-light font-bold transition-colors">Sign in here</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
