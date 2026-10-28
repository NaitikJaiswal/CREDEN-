import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Users,
  UploadCloud,
  CheckCircle2,
  Scale,
  QrCode,
  BarChart3,
  FileSpreadsheet,
  History,
  Settings,
  HelpCircle,
  LogOut,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { user, activeRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const allNavItems = [
    {
      to: '/dashboard',
      label: activeRole === 'STUDENT' ? 'Student Profile' : activeRole === 'VERIFIER' ? 'Verifier Hub' : 'Dashboard',
      icon: LayoutDashboard,
      roles: ['AICTE_ADMIN', 'INSTITUTION_ADMIN', 'STUDENT', 'VERIFIER'],
    },
    { to: '/institutions', label: 'Institutions', icon: Building2, roles: ['AICTE_ADMIN'] },
    { to: '/students', label: activeRole === 'INSTITUTION_ADMIN' ? 'COEP Students' : 'Student Records', icon: Users, roles: ['AICTE_ADMIN', 'INSTITUTION_ADMIN'] },
    { to: '/students/upload', label: 'Bulk Ingestion', icon: UploadCloud, roles: ['INSTITUTION_ADMIN'] },
    { to: '/validation', label: 'Validation Center', icon: CheckCircle2, roles: ['AICTE_ADMIN', 'INSTITUTION_ADMIN'] },
    { to: '/admissions', label: 'Intake Monitoring', icon: Scale, roles: ['AICTE_ADMIN', 'INSTITUTION_ADMIN'] },
    { to: '/verification', label: 'Academic Verification', icon: QrCode, roles: ['AICTE_ADMIN', 'STUDENT', 'VERIFIER'] },
    { to: '/analytics', label: 'Analytics & Forecast', icon: BarChart3, roles: ['AICTE_ADMIN'] },
    { to: '/reports', label: 'Reports', icon: FileSpreadsheet, roles: ['AICTE_ADMIN', 'INSTITUTION_ADMIN'] },
    { to: '/audit-logs', label: 'Audit Logs', icon: History, roles: ['AICTE_ADMIN'] },
    { to: '/settings', label: 'Settings', icon: Settings, roles: ['AICTE_ADMIN'] },
    { to: '/help', label: 'Demo Guide', icon: HelpCircle, roles: ['AICTE_ADMIN', 'INSTITUTION_ADMIN', 'STUDENT', 'VERIFIER'] },
  ];

  const navItems = allNavItems.filter((item) => !activeRole || item.roles.includes(activeRole));

  return (
    <aside
      className={`h-full bg-[#000000] border-r border-[#262626] flex flex-col justify-between transition-all duration-300 z-30 flex-shrink-0 relative ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#222222]">
          <Link to="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 min-w-9 rounded-xl bg-gradient-to-tr from-neutral-200 to-neutral-600 p-[1.5px] shadow-md shadow-white/5">
              <div className="w-full h-full bg-[#000000] rounded-[9px] flex items-center justify-center">
                <span className="font-extrabold text-white text-sm">CR</span>
              </div>
            </div>
            {!collapsed && (
              <div>
                <span className="font-extrabold text-lg tracking-tight text-white block">CREDEN</span>
              </div>
            )}
          </Link>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#121212] transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User Role Badge */}
        {!collapsed && user && (
          <div className="mx-3 my-3 p-2.5 rounded-lg bg-[#121212] border border-[#222222]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#181818] text-white flex items-center justify-center font-bold text-xs border border-[#333333]">
                {user.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider truncate">
                  {activeRole?.replace(/_/g, ' ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="px-2 py-2 space-y-1 overflow-y-auto max-h-[calc(100vh-210px)]">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white text-black font-bold shadow-md shadow-white/10'
                    : 'text-neutral-400 hover:text-white hover:bg-[#141414]'
                } ${collapsed ? 'justify-center px-2' : ''}`
              }
              title={collapsed ? label : undefined}
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 min-w-4 ${isActive ? 'text-black' : 'text-neutral-400'}`} />
                  {!collapsed && <span className="truncate">{label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-[#222222]">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors ${
            collapsed ? 'justify-center px-2' : ''
          }`}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="w-4 h-4 min-w-4" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

