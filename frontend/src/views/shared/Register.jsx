import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/shared/context/AuthContext';
import { useAuthController } from '@/hooks/shared/useAuth';
import { ROLE_HOME } from '@/shared/utils/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, AlertTriangle, UserPlus, ShieldCheck, Sparkles, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { user, signIn } = useAuth();
  const { registerUser, error, loading } = useAuthController();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (user) return <Navigate to={ROLE_HOME[user.role]} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const u = await registerUser({ name, email, password }, signIn);
    if (u) navigate(ROLE_HOME[u.role]);
  };

  return (
    <div className="min-h-screen bg-base w-full flex">
      {/* Left Pane - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative z-10">

        {/* Mobile Logo version */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
            <Ticket size={18} className="stroke-[2.5px]" />
          </div>
          <span className="font-bold text-lg tracking-tight">TicketFlow</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white mb-3 tracking-tight">
              Create an account
            </h1>
            <p className="text-gray-400 font-medium">Join TicketFlow and streamline your support workflow.</p>
          </div>

          <div className="bg-surface/40 sm:bg-transparent sm:border-transparent border border-border/50 rounded-3xl p-6 sm:p-0 shadow-xl shadow-black/20 sm:shadow-none mb-8">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[13px] font-semibold flex items-center gap-2.5 overflow-hidden"
                >
                  <AlertTriangle size={16} className="shrink-0" /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    placeholder="John Doe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    placeholder="name@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength="6"
                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all pr-12"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-light text-white rounded-xl py-3 text-sm font-semibold tracking-wide transition-all shadow-[0_4px_20px_0_rgba(79,70,229,0.25)] hover:shadow-[0_6px_25px_rgba(79,70,229,0.35)] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : (
                  <>
                    <UserPlus size={18} /> Sign Up
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-400 font-medium">
              Already have an account? <Link to="/login" className="text-primary hover:text-primary-light font-bold transition-colors">Sign in here</Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Pane - Feature Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-surface p-12 lg:order-last">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full mix-blend-screen" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
        </div>

        <div className="relative z-10 flex flex-col h-full justify-between items-center w-full">
          {/* Large Logo Corner */}
          <div className="w-full flex justify-end">
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-primary-light flex items-center justify-center shadow-lg shadow-primary/25">
                <Ticket size={24} className="stroke-[2.5px]" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight">TicketFlow</span>
            </div>
          </div>

          {/* Value Prop Graphic / Text */}
          <div className="w-full max-w-lg text-center mt-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="bg-elevated/40 backdrop-blur-xl border border-white/5 p-8 rounded-3xl shadow-2xl relative"
            >
              <div className="absolute -top-6 -right-6 w-12 h-12 bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center backdrop-blur-md">
                <ShieldCheck size={20} className="text-primary-light" />
              </div>
              <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-blue-500/20 border border-blue-500/30 rounded-2xl flex items-center justify-center backdrop-blur-md -rotate-12">
                <Sparkles size={24} className="text-blue-400" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-4">Focus on resolution</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Join thousands of agents and managers who use TicketFlow to deliver exceptional customer support experiences every single day.
              </p>
            </motion.div>
          </div>

          <div className="w-full flex justify-center pb-8">
            {/* Optional footer info */}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Register;
