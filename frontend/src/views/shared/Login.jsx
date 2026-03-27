import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/shared/context/AuthContext';
import { useAuthController } from '@/hooks/shared/useAuth';
import { ROLE_HOME } from '@/shared/utils/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, AlertTriangle, ShieldCheck, User, Sparkles, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { user, signIn } = useAuth();
  const { loginUser, error, loading } = useAuthController();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  if (user) return <Navigate to={ROLE_HOME[user.role]} replace />;

  const validateForm = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email is required to sign in.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }
    
    if (!password) {
      errors.password = 'Password is required to sign in.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    if (!validateForm()) return;

    const u = await loginUser(email, password, signIn);
    if (u) navigate(ROLE_HOME[u.role]);
  };

  const seedUsers = [
    { email: 'admin@example.com', role: 'admin', icon: ShieldCheck, color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20' },
    { email: 'agent@example.com', role: 'agent', icon: Sparkles, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
    { email: 'employee@example.com', role: 'employee', icon: User, color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  ];

  return (
    <div className="min-h-screen bg-base w-full flex">
      {/* Left Pane - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative z-10">
        
        {/* Mobile Logo version (hidden on large screens to avoid redundancy) */}
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
              Welcome back
            </h1>
            <p className="text-gray-400 font-medium">Please enter your details to sign in.</p>
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

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <input 
                    type="email" 
                    className={`w-full bg-surface border rounded-xl px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-1 transition-all ${
                      validationErrors.email 
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' 
                        : 'border-border focus:border-primary focus:ring-primary'
                    }`} 
                    placeholder="name@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                {validationErrors.email && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs mt-1.5 font-medium ml-1">
                    {validationErrors.email}
                  </motion.p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">Password</label>
                  <a href="#" className="text-sm text-primary font-medium hover:text-primary-light transition-colors">Forgot password?</a>
                </div>
                <div className="relative flex items-center">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    className={`w-full bg-surface border rounded-xl px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-1 transition-all pr-12 ${
                      validationErrors.password 
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' 
                        : 'border-border focus:border-primary focus:ring-primary'
                    }`} 
                    placeholder="••••••••"
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
                {validationErrors.password && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs mt-1.5 font-medium ml-1">
                    {validationErrors.password}
                  </motion.p>
                )}
              </div>

              <motion.button 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                className="w-full bg-primary hover:bg-primary-light text-white rounded-xl py-3 text-sm font-semibold tracking-wide transition-all shadow-[0_4px_20px_0_rgba(79,70,229,0.25)] hover:shadow-[0_6px_25px_rgba(79,70,229,0.35)] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </motion.button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-400 font-medium">
              Don't have an account? <Link to="/register" className="text-primary hover:text-primary-light font-bold transition-colors">Sign up</Link>
            </div>
          </div>

          {/* Hackathon Helpers / Test Data */}
          <div className="mt-12 pt-8 border-t border-border/50 text-center lg:text-left">
            <p className="text-xs text-gray-500 font-semibold mb-3">Quick Login (Testing)</p>
            <div className="flex lg:justify-start justify-center gap-3 flex-wrap">
              {seedUsers.map(u => {
                const Icon = u.icon;
                return (
                  <button 
                    key={u.role}
                    type="button"
                    onClick={() => { setEmail(u.email); setPassword('password123'); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all hover:scale-105 ${u.color}`}
                  >
                    <Icon size={14} /> <span className="capitalize">{u.role}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </motion.div>
      </div>

      {/* Right Pane - Feature Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-surface p-12">
        <div className="absolute inset-0 z-0">
          {/* Subtle architectural/abstract background pattern or gradient */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full mix-blend-screen" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
        </div>
        
        <div className="relative z-10 flex flex-col h-full justify-between items-center w-full">
          {/* Large Logo Corner */}
          <div className="w-full flex justify-start">
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
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center backdrop-blur-md">
                <ShieldCheck size={20} className="text-primary-light" />
              </div>
              <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-blue-500/20 border border-blue-500/30 rounded-2xl flex items-center justify-center backdrop-blur-md rotate-12">
                <Sparkles size={24} className="text-blue-400" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">Streamline Your Support</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Empower your team with professional service management tools. Track, manage, and resolve tickets securely and efficiently all in one place.
              </p>
            </motion.div>
          </div>
          
          <div className="w-full flex justify-center pb-8">
            {/* Optional footer info on right side */}
          </div>
        </div>
      </div>
    
    </div>
  );
};

export default Login;
