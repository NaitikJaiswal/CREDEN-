import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { DemoBanner } from '../common/DemoBanner';
import { useAuth } from '../../features/auth/AuthContext';
import { Bell, Search, ShieldCheck, ChevronRight } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const location = useLocation();
  const { user, activeRole } = useAuth();

  // Generate readable breadcrumbs from path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumbNameMap: Record<string, string> = {
    dashboard: 'Dashboard',
    institutions: 'Institutions',
    students: 'Student Records',
    upload: 'Bulk Upload',
    validation: 'Validation Center',
    admissions: 'Intake Monitoring',
    verification: 'Academic Verification',
    analytics: 'Analytics & Forecast',
    reports: 'Reports',
    'audit-logs': 'Audit Logs',
    settings: 'Settings',
    help: 'Demo Guide',
  };

  return (
    <div className="h-screen w-screen bg-[#000000] text-[#F1F5F9] flex flex-col overflow-hidden">
      {/* 1. Global Demo Mode Banner (fixed at the very top) */}
      <div className="flex-shrink-0 z-40 border-b border-[#222222]">
        <DemoBanner />
      </div>

      <div className="flex flex-1 h-[calc(100vh-38px)] overflow-hidden relative">
        {/* 2. Collapsible Sidebar */}
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

        {/* 3. Main Workspace Area */}
        <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
          {/* Top Bar Header */}
          <header className="h-16 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#222222] px-6 flex items-center justify-between sticky top-0 z-20 flex-shrink-0">
            {/* Breadcrumb Trail */}
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Link to="/dashboard" className="hover:text-white transition-colors">
                CREDEN
              </Link>
              {pathParts.map((part, index) => {
                const url = `/${pathParts.slice(0, index + 1).join('/')}`;
                const isLast = index === pathParts.length - 1;
                return (
                  <React.Fragment key={url}>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
                    {isLast ? (
                      <span className="text-white font-semibold">
                        {breadcrumbNameMap[part] || part}
                      </span>
                    ) : (
                      <Link to={url} className="hover:text-white transition-colors">
                        {breadcrumbNameMap[part] || part}
                      </Link>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Top Right Controls */}
            <div className="flex items-center gap-4">
              {/* Scope Tag */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#121212] border border-[#262626] text-[11px] text-neutral-300">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
                <span>Scope: </span>
                <span className="font-semibold text-white">
                  {activeRole === 'AICTE_ADMIN'
                    ? 'National AICTE Oversight'
                    : activeRole === 'INSTITUTION_ADMIN'
                    ? 'COEP Tech University (Pune)'
                    : activeRole === 'STUDENT'
                    ? 'Student Portal (Aarav Sharma)'
                    : activeRole === 'VERIFIER'
                    ? 'Verifier Workspace (Infosys BGV)'
                    : user?.institution?.name || 'Authorized Portal'}
                </span>
              </div>

              {/* Notification icon */}
              <button
                className="p-2 rounded-lg bg-[#121212] text-neutral-400 hover:text-white hover:bg-[#1A1A1A] border border-[#262626] transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-white"></span>
              </button>

              {/* User Profile Pill */}
              <div className="flex items-center gap-2 pl-2 border-l border-[#262626]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-neutral-300 to-neutral-700 text-black flex items-center justify-center font-bold text-xs shadow-sm">
                  {user?.name ? user.name.charAt(0) : 'U'}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold text-white leading-tight">{user?.name || 'Demo User'}</p>
                  <p className="text-[10px] text-neutral-400 leading-tight">{user?.email}</p>
                </div>
              </div>
            </div>
          </header>

          {/* Page Viewport */}
          <main className="flex-1 p-6 md:p-8 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

