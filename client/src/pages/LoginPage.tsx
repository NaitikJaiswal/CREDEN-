import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { UserRole } from '../types';
import { ShieldCheck, Lock, Mail, ArrowRight, Sparkles, Building2, UserCheck, GraduationCap, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: UserRole) => {
    setError(null);
    setLoading(true);
    try {
      await demoLogin(role);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Quick demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  const demoPresets: Array<{ role: UserRole; title: string; desc: string; icon: any; color: string }> = [
    {
      role: 'AICTE_ADMIN',
      title: 'AICTE Administrator',
      desc: 'National oversight, intake capacity analytics, duplicate reviews',
      icon: ShieldCheck,
      color: 'text-white border-neutral-700 hover:border-white hover:bg-neutral-900',
    },
    {
      role: 'INSTITUTION_ADMIN',
      title: 'Institution Administrator',
      desc: 'COEP Tech University: upload student CSV, intake monitoring, record correction',
      icon: Building2,
      color: 'text-neutral-300 border-neutral-700 hover:border-white hover:bg-neutral-900',
    },
    {
      role: 'STUDENT',
      title: 'Student Portal',
      desc: 'Aarav Sharma: view masked APAAR profile, academic progression, shareable verification',
      icon: GraduationCap,
      color: 'text-emerald-400 border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-500/10',
    },
    {
      role: 'VERIFIER',
      title: 'Authorized Verifier',
      desc: 'Employer / Background Checker: minimal academic claim verification',
      icon: UserCheck,
      color: 'text-amber-400 border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/10',
    },
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-[#F1F5F9] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-white/[0.03] rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link to="/" className="inline-flex items-center gap-3 group mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-neutral-200 to-neutral-600 p-[1.5px] shadow-lg shadow-white/5">
            <div className="w-full h-full bg-[#000000] rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </div>
          </div>
        </Link>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Sign In to CREDEN</h2>
        <p className="mt-2 text-xs text-neutral-400">
          Authenticated Academic Governance
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
        <div className="bg-[#121212] py-8 px-6 sm:px-10 rounded-2xl border border-[#222222] shadow-2xl">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 min-w-4" />
              <span>{error}</span>
            </div>
          )}

          {/* 1-Click Demo Accounts Selector */}
          <div className="mb-8 pb-6 border-b border-[#222222]">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                1-Click Demonstration Logins
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mb-4">
              Select any pre-configured role account to test distinct backend access permissions:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {demoPresets.map((preset) => {
                const Icon = preset.icon;
                return (
                  <button
                    key={preset.role}
                    type="button"
                    onClick={() => handleQuickDemo(preset.role)}
                    disabled={loading}
                    className={`p-3 rounded-xl border bg-[#0A0A0A] text-left transition-all flex flex-col justify-between ${preset.color}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4" />
                      <span className="text-xs font-bold text-white">{preset.title}</span>
                    </div>
                    <p className="text-[10px] text-neutral-400 leading-tight">{preset.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Standard Email/Password Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aicte.admin@creden.gov.in"
                  className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#0A0A0A] border border-[#262626] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-white text-black font-extrabold text-xs shadow-lg shadow-white/10 hover:bg-neutral-200 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In with Credentials'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-xs text-neutral-400 hover:text-white transition-colors">
              ← Return to CREDEN Landing Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

