import React, { useState, useEffect } from 'react';
import { Cookie } from 'lucide-react';
import { LegalModal, PolicyTab } from './LegalModal';

const COOKIE_CONSENT_KEY = 'e_accountant_cookie_consent';

export const CookieConsentBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [legalModalOpen, setLegalModalOpen] = useState<boolean>(false);
  const [initialTab, setInitialTab] = useState<PolicyTab>('cookies');

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ essential: true, functional: true, timestamp: new Date().toISOString() }));
    setShowBanner(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ essential: true, functional: false, timestamp: new Date().toISOString() }));
    setShowBanner(false);
  };

  const openPolicy = (tab: PolicyTab) => {
    setInitialTab(tab);
    setLegalModalOpen(true);
  };

  if (!showBanner) {
    return (
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={initialTab}
      />
    );
  }

  return (
    <>
      <aside
        aria-label="Cookie and Privacy Consent Banner"
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-slate-800 dark:text-slate-100 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
      >
        <div className="flex items-start space-x-3 mb-3">
          <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 shrink-0">
            <Cookie className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Respecting Your Privacy & Cookies
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              We only use essential local storage to remember your financial data, dark mode, and language choice. No third-party ad trackers or biometric pixels.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400 mb-4 pl-1">
          <button
            onClick={() => openPolicy('cookies')}
            className="text-brand-600 dark:text-brand-400 hover:underline font-semibold"
          >
            Cookie Policy
          </button>
          <span>•</span>
          <button
            onClick={() => openPolicy('privacy')}
            className="text-brand-600 dark:text-brand-400 hover:underline font-semibold"
          >
            Privacy Policy
          </button>
          <span>•</span>
          <button
            onClick={() => openPolicy('business')}
            className="text-brand-600 dark:text-brand-400 hover:underline font-semibold"
          >
            Burner Business Details
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
          <button
            onClick={handleAcceptEssential}
            className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors focus:ring-2 focus:ring-brand-500"
          >
            Essential Only
          </button>
          <button
            onClick={handleAcceptAll}
            className="py-2.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-colors focus:ring-2 focus:ring-brand-500"
          >
            Accept All
          </button>
        </div>
      </aside>

      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={initialTab}
      />
    </>
  );
};
