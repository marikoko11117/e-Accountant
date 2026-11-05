import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Calculator, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

import { CosmicNebula } from '../components/common/CosmicNebula';

export const LoginPage: React.FC = () => {
  const { signIn, signInAsDemo } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError(t('auth.invalidCredentials'));
      return;
    }

    try {
      setIsSubmitting(true);
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : t('auth.invalidCredentials');
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoSignIn = () => {
    signInAsDemo();
    navigate(from, { replace: true });
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center p-4 text-slate-900 dark:text-slate-100 transition-colors overflow-hidden">
      <CosmicNebula />

      {/* Top right language / theme switch */}
      <div className="absolute top-4 right-4 z-20 flex items-center space-x-2">
        <div className="flex items-center liquid-glass-subtle p-1 rounded-xl shadow-sm text-xs font-medium">
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-1 rounded-lg press-bounce ${language === 'en' ? 'bg-brand-500/20 text-brand-600 dark:text-brand-300 font-bold' : 'text-slate-500'}`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('zh')}
            className={`px-2 py-1 rounded-lg press-bounce ${language === 'zh' ? 'bg-brand-500/20 text-brand-600 dark:text-brand-300 font-bold' : 'text-slate-500'}`}
          >
            中文
          </button>
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl liquid-glass-subtle text-slate-600 dark:text-slate-300 shadow-sm press-bounce"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-xl shadow-brand-500/30 mb-4 ring-1 ring-white/20">
            <Calculator className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('appName')}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('appTagline')}
          </p>
        </div>

        {/* Card */}
        <div className="liquid-glass-elevated rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 dark:border-white/10">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t('auth.signInTitle')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t('auth.signInSubtitle')}
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@firm.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white text-sm font-semibold shadow-md shadow-brand-500/20 transition-all disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('auth.signingIn')}</span>
                </>
              ) : (
                <>
                  <span>{t('auth.signIn')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Button */}
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="mb-2 text-center text-xs text-slate-500 dark:text-slate-400">
              {t('auth.demoNotice')}
            </div>
            <button
              type="button"
              onClick={handleDemoSignIn}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl border border-dashed border-amber-300 dark:border-amber-700/60 bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 hover:bg-amber-100/70 dark:hover:bg-amber-900/40 text-xs font-semibold transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{t('auth.demoLogin')}</span>
            </button>
          </div>

          {/* Footer link to sign up */}
          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            {t('auth.noAccount')}{' '}
            <Link
              to="/register"
              className="font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              {t('auth.signUp')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
