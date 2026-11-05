import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  FolderTree,
  Scale,
  FileSpreadsheet,
  Settings,
  X,
  Calculator,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const navItems = [
    { to: '/dashboard', labelKey: 'nav.dashboard' as const, icon: LayoutDashboard },
    { to: '/journal', labelKey: 'nav.journal' as const, icon: BookOpen },
    { to: '/accounts', labelKey: 'nav.accounts' as const, icon: FolderTree },
    { to: '/ledger', labelKey: 'nav.ledger' as const, icon: Scale },
    { to: '/reports', labelKey: 'nav.reports' as const, icon: FileSpreadsheet },
    { to: '/settings', labelKey: 'nav.settings' as const, icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-72 liquid-glass-elevated border-r border-white/20 h-full p-5 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-200">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-500 text-white shadow-lg shadow-brand-500/25">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <span className="font-display font-bold text-slate-900 dark:text-white text-base block tracking-tight">
                  e-Accountant
                </span>
                <span className="text-[10px] text-brand-500 dark:text-brand-300 font-semibold flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                  <span>Liquid Glass</span>
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors press-bounce"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="mt-5 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl font-semibold text-sm transition-all press-bounce ${
                      isActive
                        ? 'bg-brand-500/20 text-brand-600 dark:text-brand-300 border border-brand-500/30 shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{t(item.labelKey)}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="text-xs font-mono text-slate-400 text-center py-2 border-t border-white/10">
          e-Accountant · HyperOS Spatial Desk
        </div>
      </div>
    </div>
  );
};
