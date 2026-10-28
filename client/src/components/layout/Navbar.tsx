import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { Shield, Sparkles, LayoutDashboard, LogIn, ChevronRight, Zap } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, demoLogin } = useAuth();
  const navigate = useNavigate();

  const [isLiteMode, setIsLiteMode] = useState<boolean>(() => {
    return localStorage.getItem('creden_lite_mode') === 'true';
  });

  const toggleLiteMode = () => {
    const next = !isLiteMode;
    setIsLiteMode(next);
    localStorage.setItem('creden_lite_mode', String(next));
    window.dispatchEvent(new CustomEvent('creden_perf_mode_change', { detail: { isLiteMode: next } }));
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-black/85 border-b border-[#222222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-neutral-200 to-neutral-600 p-[1.5px] shadow-lg shadow-white/5">
            <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white">CREDEN</span>
          </div>
        </Link>

        {/* Public Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-400">
          <a href="#hero" className="hover:text-white transition-colors">Platform</a>
          <a href="#workflow" className="hover:text-white transition-colors">3D Workflow</a>
          <a href="#problem" className="hover:text-white transition-colors">Challenges</a>
          <a href="#innovation" className="hover:text-white transition-colors">Innovation</a>
          <a href="#security" className="hover:text-white transition-colors">Security & Privacy</a>
          <Link to="/help" className="hover:text-white transition-colors flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Interactive Demo</span>
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Performance Mode Switch */}
          <button
            onClick={toggleLiteMode}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isLiteMode
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : 'bg-[#121212] text-neutral-300 border-[#262626] hover:text-white hover:bg-[#1A1A1A]'
            }`}
            title="Toggle between 3D Mode and Lite GPU Mode"
          >
            <Zap className="w-3.5 h-3.5 text-neutral-300" />
            <span>{isLiteMode ? 'Lite Mode' : '3D Mode'}</span>
          </button>

          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black font-bold text-sm shadow-md hover:bg-neutral-200 transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Go to Dashboard</span>
            </Link>
          ) : (
            <>
              <button
                onClick={() => demoLogin('AICTE_ADMIN').then(() => navigate('/dashboard'))}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141414] text-neutral-200 border border-[#262626] hover:bg-[#1F1F1F] text-xs font-semibold transition-colors"
              >
                <span>Launch Quick Demo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
