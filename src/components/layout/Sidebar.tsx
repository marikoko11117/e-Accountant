import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  FolderTree,
  Scale,
  FileSpreadsheet,
  Settings,
  ChevronLeft,
  ChevronRight,
  Calculator,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { t } = useLanguage();
  const { isDemo } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('e_accountant_sidebar_collapsed') === 'true';
  });

  const [animatingPath, setAnimatingPath] = useState<string | null>(location.pathname);

  useEffect(() => {
    localStorage.setItem('e_accountant_sidebar_collapsed', String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    setAnimatingPath(location.pathname);
    const timer = setTimeout(() => {
      setAnimatingPath(null);
    }, 550);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const navItems = [
    { to: '/dashboard', labelKey: 'nav.dashboard' as const, icon: LayoutDashboard },
    { to: '/journal', labelKey: 'nav.journal' as const, icon: BookOpen },
    { to: '/accounts', labelKey: 'nav.accounts' as const, icon: FolderTree },
    { to: '/ledger', labelKey: 'nav.ledger' as const, icon: Scale },
    { to: '/reports', labelKey: 'nav.reports' as const, icon: FileSpreadsheet },
    { to: '/settings', labelKey: 'nav.settings' as const, icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-screen transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] border-r
        liquid-glass border-white/10 dark:border-white/10 flex flex-col justify-between shadow-2xl
        ${collapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Top Brand Header */}
      <div>
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-500 text-white shrink-0 shadow-lg shadow-brand-500/25 border border-white/20">
              <Calculator className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="leading-tight truncate">
                <h1 className="font-display font-bold text-slate-900 dark:text-white text-base tracking-tight truncate flex items-center gap-1.5">
                  <span>e-Accountant</span>
                </h1>
                <p className="text-[11px] text-brand-600 dark:text-brand-300 font-semibold truncate flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>Liquid Glass Edition</span>
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? t('nav.expand') : t('nav.collapse')}
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white/10 transition-colors press-bounce"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isCurrent = location.pathname.startsWith(item.to);
            const isFilling = animatingPath === item.to || (isCurrent && animatingPath === location.pathname);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `relative group flex items-center space-x-3 px-3 py-2.5 rounded-2xl font-medium text-sm transition-all duration-200 select-none press-bounce ${
                    isActive
                      ? 'bg-brand-500/15 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 shadow-sm border border-brand-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/10 dark:hover:bg-white/5'
                  } ${collapsed ? 'justify-center px-2' : ''}`
                }
              >
                {/* Icon with subtle scale-up on active/hover */}
                <div
                  className={`transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                    isCurrent ? 'scale-110 text-brand-500 dark:text-brand-300' : 'group-hover:scale-105'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                </div>

                {!collapsed && <span className="truncate font-semibold tracking-tight">{t(item.labelKey)}</span>}

                {/* Xiaomi HyperOS Animated Progress/Loading Line along lower edge */}
                {isCurrent && (
                  <div className="absolute -bottom-0.5 left-3 right-3 h-[2px] rounded-full overflow-hidden bg-brand-500/20 pointer-events-none">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r from-brand-400 via-indigo-400 to-cyan-300 shadow-[0_0_8px_rgba(99,102,241,0.8)] ${
                        isFilling ? 'tab-progress-line' : 'w-full'
                      }`}
                    />
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Status */}
      <div className="p-3 border-t border-white/10">
        {!collapsed && isDemo && (
          <div className="mb-2 p-2.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-800 dark:text-amber-200 text-xs shadow-sm">
            <div className="flex items-center space-x-1.5 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>Demo Practitioner</span>
            </div>
            <p className="mt-0.5 text-[11px] text-amber-700 dark:text-amber-300">
              Double-entry sandbox active
            </p>
          </div>
        )}

        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between px-2'} text-xs text-slate-400 font-mono`}>
          {!collapsed && <span>HyperOS v2.0</span>}
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" title="Accounting Engine Online" />
        </div>
      </div>
    </aside>
  );
};
