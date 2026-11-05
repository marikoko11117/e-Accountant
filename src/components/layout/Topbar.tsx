import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  LogOut,
  Menu,
  ChevronDown,
  Search,
  Command,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { TranslationKey } from '../../locales/translations';
import { PhysicsToggle } from '../common/PhysicsToggle';

interface TopbarProps {
  onToggleMobileNav?: () => void;
  onOpenCommandPalette?: () => void;
  onStartAuditFocus?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onToggleMobileNav,
  onOpenCommandPalette,
  onStartAuditFocus,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user, signOut, isDemo } = useAuth();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const getPageTitleKey = (pathname: string): TranslationKey => {
    if (pathname.includes('/journal')) return 'nav.journal';
    if (pathname.includes('/accounts')) return 'nav.accounts';
    if (pathname.includes('/ledger')) return 'nav.ledger';
    if (pathname.includes('/reports')) return 'nav.reports';
    if (pathname.includes('/settings')) return 'nav.settings';
    return 'nav.dashboard';
  };

  return (
    <header className="sticky top-0 z-20 h-16 liquid-glass border-b border-white/10 dark:border-white/10 px-4 sm:px-6 flex items-center justify-between shadow-sm">
      {/* Left Title / Breadcrumbs */}
      <div className="flex items-center space-x-3">
        {onToggleMobileNav && (
          <button
            onClick={onToggleMobileNav}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white/10 press-bounce"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white tracking-tight">
            {t(getPageTitleKey(location.pathname))}
          </h2>
          <span className="hidden sm:inline-block text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/20">
            Liquid Glass
          </span>
        </div>
      </div>

      {/* Center Command Bar Trigger */}
      {onOpenCommandPalette && (
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full liquid-glass-subtle border border-white/15 hover:border-white/30 text-slate-400 hover:text-slate-200 text-xs transition-all w-64 shadow-sm press-bounce"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="flex-1 text-left">Search or type ⌘K...</span>
          <div className="flex items-center gap-0.5 text-[10px] font-mono bg-white/10 px-1.5 py-0.2 rounded border border-white/10">
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>
        </button>
      )}

      {/* Right Action Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Audit Focus Mode Button */}
        {onStartAuditFocus && (
          <button
            onClick={onStartAuditFocus}
            className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-400/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shadow-sm transition-all press-bounce"
            title="Launch Audit & Reconciliation Focus Mode"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-300" />
            <span>Reconcile Mode</span>
          </button>
        )}

        {/* Language Switcher */}
        <div className="flex items-center bg-white/10 dark:bg-slate-800/60 p-1 rounded-xl text-xs font-semibold border border-white/10">
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-1 rounded-lg transition-colors ${
              language === 'en'
                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('zh')}
            className={`px-2 py-1 rounded-lg transition-colors ${
              language === 'zh'
                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            中文
          </button>
        </div>

        {/* Physics Toggle for Light / Dark Mode with 2px Shake */}
        <div
          className="p-1 px-2 rounded-xl liquid-glass border border-white/15 flex items-center gap-1.5"
          title="Toggle Cosmic Liquid Glass (with tactile 2px shake)"
        >
          <PhysicsToggle
            checked={isDark}
            onChange={toggleTheme}
            size="sm"
          />
          <span className="hidden xl:inline text-[11px] font-medium text-slate-700 dark:text-slate-300">
            {isDark ? 'Cosmic' : 'Frost'}
          </span>
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center space-x-2 p-1.5 pl-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-white/10 transition-colors press-bounce"
          >
            <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center text-xs font-bold shadow-sm shadow-brand-500/20">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="hidden sm:inline text-xs font-medium text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
              {user?.displayName || user?.email}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {userMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-56 liquid-glass-elevated rounded-2xl shadow-xl border border-white/20 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setUserMenuOpen(false)}
            >
              <div className="px-3.5 py-2 border-b border-white/10">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {user?.displayName}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono">
                  {user?.email}
                </p>
                {isDemo && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-500 font-semibold mt-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Demo Practitioner</span>
                  </span>
                )}
              </div>

              <button
                onClick={() => signOut()}
                className="w-full flex items-center space-x-2 px-3.5 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('auth.signOut')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
