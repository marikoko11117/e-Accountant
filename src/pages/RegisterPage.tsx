import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calculator, Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { LegalModal, PolicyTab } from '../components/compliance/LegalModal';

import { CosmicNebula } from '../components/common/CosmicNebula';

export const RegisterPage: React.FC = () => {
  const { signUp } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [consentTerms, setConsentTerms] = useState(false);
  const [consentAge, setConsentAge] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<PolicyTab>('terms');

  const openPolicy = (tab: PolicyTab) => {
    setActiveTab(tab);
    setLegalModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError(t('auth.passwordTooShort'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    if (!consentTerms) {
      setError('You must accept the Terms of Service and Privacy Policy to create an account.');
      return;
    }

    if (!consentAge) {
      setError('You must confirm you are at least 16 years old to use this software.');
      return;
    }

    try {
      setIsSubmitting(true);
      await signUp(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
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

        <div className="liquid-glass-elevated rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 dark:border-white/10">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t('auth.signUpTitle')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t('auth.signUpSubtitle')}
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('auth.confirmPassword')}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Check Form Consent (Req #6 & #17: Age Consent + Terms & Privacy) */}
            <div className="space-y-2 pt-1 pb-1">
              <label className="flex items-start space-x-2.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentTerms}
                  onChange={(e) => setConsentTerms(e.target.checked)}
                  className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
                />
                <span>
                  I have read and accept the{' '}
                  <button
                    type="button"
                    onClick={() => openPolicy('terms')}
                    className="text-brand-600 dark:text-brand-400 font-semibold underline"
                  >
                    Terms of Service
                  </button>
                  {' '}and{' '}
                  <button
                    type="button"
                    onClick={() => openPolicy('privacy')}
                    className="text-brand-600 dark:text-brand-400 font-semibold underline"
                  >
                    Privacy Policy
                  </button>
                  .
                </span>
              </label>

              <label className="flex items-start space-x-2.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentAge}
                  onChange={(e) => setConsentAge(e.target.checked)}
                  className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
                />
                <span>
                  <strong>Age Verification:</strong> I confirm I am 16 years of age or older (Children's data compliance).
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white text-sm font-semibold shadow-md shadow-brand-500/20 transition-all disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('auth.creatingAccount')}</span>
                </>
              ) : (
                <>
                  <span>{t('auth.signUp')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            {t('auth.hasAccount')}{' '}
            <Link
              to="/login"
              className="font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              {t('auth.signIn')}
            </Link>
          </div>
        </div>
      </div>

      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={activeTab}
      />
    </div>
  );
};
