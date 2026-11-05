import React from 'react';
import {
  Settings,
  User,
  Globe,
  Palette,
  Cloud,
  Shield,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { isFirebaseConfigured } from '../config/firebase';
import { DataDeletionSection } from '../components/compliance/DataDeletionSection';
import { EmailPreferencesSection } from '../components/compliance/EmailPreferencesSection';
import { LegalModal, PolicyTab } from '../components/compliance/LegalModal';
import { BUSINESS_DETAILS } from '../config/businessCompliance';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [legalModalOpen, setLegalModalOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<PolicyTab>('privacy');

  const openLegalTab = (tab: PolicyTab) => {
    setActiveTab(tab);
    setLegalModalOpen(true);
  };

  const handleRestartTutorial = () => {
    localStorage.removeItem('e_accountant_wizard_done');
    window.location.reload();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Settings className="w-6 h-6 text-brand-600" />
          <span>{t('nav.settings')}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage firm preferences, currency standards, localization, and Firebase integration.
        </p>
      </div>

      {/* User Profile Card */}
      <div className="p-6 rounded-3xl liquid-glass shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <User className="w-4 h-4 text-brand-500" />
          <span>Practitioner Profile</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Account Holder
            </label>
            <div className="p-3 rounded-xl liquid-glass-subtle text-xs font-medium text-slate-900 dark:text-white">
              {user?.displayName || 'User'}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Registered Email
            </label>
            <div className="p-3 rounded-xl liquid-glass-subtle text-xs font-medium text-slate-900 dark:text-white truncate">
              {user?.email || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Card */}
      <div className="p-6 rounded-3xl liquid-glass shadow-sm space-y-6">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Palette className="w-4 h-4 text-brand-500" />
          <span>Localization & Theme</span>
        </h2>

        {/* Language Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center space-x-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>{t('settings.language')}</span>
          </label>
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            <button
              onClick={() => setLanguage('en')}
              className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all press-bounce ${
                language === 'en'
                  ? 'border-brand-500/60 bg-brand-500/15 text-brand-600 dark:text-brand-300 ring-2 ring-brand-500/20 shadow-sm'
                  : 'liquid-glass-subtle text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              English (US)
            </button>
            <button
              onClick={() => setLanguage('zh')}
              className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all press-bounce ${
                language === 'zh'
                  ? 'border-brand-500/60 bg-brand-500/15 text-brand-600 dark:text-brand-300 ring-2 ring-brand-500/20 shadow-sm'
                  : 'liquid-glass-subtle text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              简体中文 (Simplified Chinese)
            </button>
          </div>
        </div>

        {/* Theme Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            {t('settings.theme')}
          </label>
          <div className="grid grid-cols-3 gap-3 max-w-md">
            {(['light', 'dark', 'system'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setTheme(mode)}
                className={`p-3 rounded-xl border text-xs font-semibold text-center capitalize transition-all press-bounce ${
                  theme === mode
                    ? 'border-brand-500/60 bg-brand-500/15 text-brand-600 dark:text-brand-300 ring-2 ring-brand-500/20 shadow-sm'
                    : 'liquid-glass-subtle text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {mode === 'light' ? t('settings.theme.light') : mode === 'dark' ? t('settings.theme.dark') : t('settings.theme.system')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Firebase Status Card */}
      <div className="p-6 rounded-3xl liquid-glass shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Cloud className="w-4 h-4 text-brand-500" />
          <span>{t('settings.firebaseStatus')}</span>
        </h2>

        <div className="p-4 rounded-2xl liquid-glass-subtle space-y-3">
          <div className="flex items-center space-x-2 text-xs font-semibold">
            {isFirebaseConfigured ? (
              <>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                <span className="text-emerald-700 dark:text-emerald-300">
                  {t('settings.firebaseConnected')}
                </span>
              </>
            ) : (
              <>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
                <span className="text-amber-700 dark:text-amber-300">
                  {t('settings.firebaseDemo')}
                </span>
              </>
            )}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {isFirebaseConfigured
              ? 'Your project is authenticated with Cloud Firestore and Firebase Auth using environment variables from .env.local.'
              : 'To connect to your live Firebase project, enter your Firebase Web configuration in .env.local. The app seamlessly supports instant local testing in the meantime.'}
          </p>
        </div>
      </div>

      {/* Onboarding Tutorial Reset */}
      <div className="p-6 rounded-3xl liquid-glass shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <RotateCcw className="w-4 h-4 text-brand-500" />
          <span>Onboarding Tour</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Want a refresher on the double-entry mechanics, Chart of Accounts, and General Ledger?
        </p>
        <button
          onClick={handleRestartTutorial}
          className="px-4 py-2 rounded-xl liquid-glass-subtle hover:bg-white/40 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all press-bounce"
        >
          Restart Guided Tutorial
        </button>
      </div>

      {/* Trust, Legal & Burner Business Entity */}
      <div className="p-6 rounded-3xl liquid-glass shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Shield className="w-4 h-4 text-brand-500" />
            <span>Trust, Policies & Business Registration</span>
          </h2>
          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
            Pre-Incorporation Burner Details
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Operator: <strong>{BUSINESS_DETAILS.legalName}</strong> • {BUSINESS_DETAILS.registeredAddress}
        </p>

        <div className="flex flex-wrap gap-2 pt-1 text-xs font-medium">
          <button
            onClick={() => openLegalTab('privacy')}
            className="px-3 py-1.5 rounded-xl liquid-glass-subtle hover:bg-white/40 dark:hover:bg-white/10 press-bounce"
          >
            Privacy Policy
          </button>
          <button
            onClick={() => openLegalTab('terms')}
            className="px-3 py-1.5 rounded-xl liquid-glass-subtle hover:bg-white/40 dark:hover:bg-white/10 press-bounce"
          >
            Terms of Service
          </button>
          <button
            onClick={() => openLegalTab('refund')}
            className="px-3 py-1.5 rounded-xl liquid-glass-subtle hover:bg-white/40 dark:hover:bg-white/10 press-bounce"
          >
            Refund Policy (No Hidden Fees)
          </button>
          <button
            onClick={() => openLegalTab('cookies')}
            className="px-3 py-1.5 rounded-xl liquid-glass-subtle hover:bg-white/40 dark:hover:bg-white/10 press-bounce"
          >
            Cookie Policy
          </button>
          <button
            onClick={() => openLegalTab('sdks')}
            className="px-3 py-1.5 rounded-xl liquid-glass-subtle hover:bg-white/40 dark:hover:bg-white/10 press-bounce"
          >
            Third-Party SDK Audit
          </button>
          <button
            onClick={() => openLegalTab('business')}
            className="px-3 py-1.5 rounded-xl liquid-glass-subtle hover:bg-white/40 dark:hover:bg-white/10 text-brand-600 dark:text-brand-400 font-semibold press-bounce"
          >
            View Burner Entity Details
          </button>
        </div>
      </div>

      {/* Email Preferences (Requirement #18) */}
      <EmailPreferencesSection />

      {/* Data Deletion & GDPR Erasure (Requirement #7 & #20) */}
      <DataDeletionSection />

      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={activeTab}
      />
    </div>
  );
};
