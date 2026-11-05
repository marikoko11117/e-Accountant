import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { LegalModal, PolicyTab } from './LegalModal';
import { BUSINESS_DETAILS } from '../../config/businessCompliance';

export const ComplianceFooter: React.FC = () => {
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<PolicyTab>('privacy');

  const openTab = (tab: PolicyTab) => {
    setActiveTab(tab);
    setLegalModalOpen(true);
  };

  return (
    <>
      <footer
        role="contentinfo"
        aria-label="Compliance & Legal Information"
        className="mt-12 pt-6 pb-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {BUSINESS_DETAILS.tradingName}
            </span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className="text-[11px]">{BUSINESS_DETAILS.legalName}</span>
          </div>

          <nav aria-label="Legal navigation links" className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            <button
              onClick={() => openTab('privacy')}
              className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors focus:outline-none focus:underline"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => openTab('terms')}
              className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors focus:outline-none focus:underline"
            >
              Terms of Service
            </button>
            <button
              onClick={() => openTab('refund')}
              className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors focus:outline-none focus:underline"
            >
              Refunds & Pricing
            </button>
            <button
              onClick={() => openTab('cookies')}
              className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors focus:outline-none focus:underline"
            >
              Cookie Policy
            </button>
            <button
              onClick={() => openTab('business')}
              className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors focus:outline-none focus:underline"
            >
              Entity Details (Burner)
            </button>
            <button
              onClick={() => openTab('sdks')}
              className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors focus:outline-none focus:underline"
            >
              SDK Audit
            </button>
          </nav>
        </div>

        <div className="mt-3 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400">
          <span>
            {BUSINESS_DETAILS.registeredAddress}
          </span>
          <span className="mt-1 sm:mt-0">
            Compliant with WCAG 2.1 AA, GDPR Data Minimization & COPPA 16+ Age Standards.
          </span>
        </div>
      </footer>

      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={activeTab}
      />
    </>
  );
};
