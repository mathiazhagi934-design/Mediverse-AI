import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, HeartPulse, Activity, FileText, Scan, ShieldCheck, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const highlights = [
  { icon: Activity, text: 'AI-powered disease prediction' },
  { icon: FileText, text: 'Medical report analysis' },
  { icon: Scan, text: 'Skin disease detection' },
];

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(username.trim(), password);
      toast.success('Welcome back!');
      navigate('/app');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid credentials';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slateink-950">
      {/* Brand panel */}
      <aside className="hidden lg:flex flex-col justify-between w-[46%] relative overflow-hidden bg-gradient-to-br from-slateink-950 via-slateink-950 to-primary-900/60 p-12">
        <div className="absolute inset-0 opacity-[0.1] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:44px_44px]" />
        <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-primary-600/20 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-soft flex items-center justify-center">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-lg leading-none">MediVerse <span className="text-primary-400">AI</span></span>
            <span className="block text-[10px] uppercase tracking-[0.16em] text-slate-400 mt-1">Hospital Health Portal</span>
          </div>
        </div>

        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-primary-500/10 text-primary-300 text-xs font-medium px-3 py-1.5 rounded-full border border-primary-500/25 mb-5">
            <Sparkles className="w-3.5 h-3.5" /> Smart Healthcare Platform
          </div>
          <h2 className="text-3xl font-bold text-white leading-snug mb-5">
            Intelligent insights for<br />every health journey
          </h2>
          <ul className="space-y-3">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-slate-300">
                <span className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary-300" />
                </span>
                <span className="text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-2 text-slate-400">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <p className="text-xs">Your data is encrypted and protected.</p>
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden flex items-center justify-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 shadow-soft flex items-center justify-center">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-xl text-slateink-900 dark:text-white leading-none">MediVerse <span className="text-primary-600 dark:text-primary-400">AI</span></span>
              <span className="block text-[10px] uppercase tracking-[0.16em] text-slate-400 mt-1">Hospital Health Portal</span>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slateink-900 dark:text-white">Welcome Back</h1>
            <p className="text-slate-500 mt-1.5">Sign in to continue to your dashboard</p>
          </div>

          <div className="card shadow-card !p-7">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slateink-900 dark:text-slate-200 mb-1.5">Username</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slateink-900 dark:text-slate-200 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="input-field pr-11"
                    placeholder="Enter password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    onClick={() => setShowPass(!showPass)}
                    aria-label="Toggle password visibility"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            <p className="text-center text-sm text-slate-500 mt-5">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold">Sign up</Link>
            </p>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            For educational purposes only. Not a medical service.
          </p>
        </div>
      </main>
    </div>
  );
}