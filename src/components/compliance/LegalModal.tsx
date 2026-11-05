import React, { useState } from 'react';
import {
  Shield,
  FileText,
  RefreshCw,
  Cookie,
  Building,
  CheckCircle2,
  X,
  AlertTriangle,
} from 'lucide-react';
import { BUSINESS_DETAILS, THIRD_PARTY_SDK_AUDIT } from '../../config/businessCompliance';

export type PolicyTab = 'privacy' | 'terms' | 'refund' | 'cookies' | 'business' | 'sdks';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: PolicyTab;
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, initialTab = 'privacy' }) => {
  const [activeTab, setActiveTab] = useState<PolicyTab>(initialTab);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-800 dark:text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center space-x-2.5">
            <Shield className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h2 id="legal-modal-title" className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Trust, Legal & Compliance Center
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close legal compliance dialog"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 pt-2 scrollbar-none gap-2 text-xs font-semibold">
          {[
            { id: 'privacy' as PolicyTab, label: '1. Privacy Policy', icon: Shield },
            { id: 'terms' as PolicyTab, label: '2. Terms of Service', icon: FileText },
            { id: 'refund' as PolicyTab, label: '3. Refund & Subscriptions', icon: RefreshCw },
            { id: 'cookies' as PolicyTab, label: '4. Cookie Policy', icon: Cookie },
            { id: 'business' as PolicyTab, label: '16. Business Details', icon: Building },
            { id: 'sdks' as PolicyTab, label: '8. SDK Audit', icon: CheckCircle2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 pb-3 px-3 border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-brand-600 text-brand-600 dark:text-brand-400 font-bold'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Privacy Policy</h3>
                <span className="text-xs text-slate-400">Effective: {BUSINESS_DETAILS.lastUpdated}</span>
              </div>
              <p>
                <strong>e-Accountant For You</strong> is committed to data minimization, strict isolation of tenant financial records, and uncompromising user privacy.
              </p>

              <h4 className="font-semibold text-slate-900 dark:text-white">1. Data Minimization (Requirement #7)</h4>
              <p>
                We only collect data strictly necessary to authenticate your account and persist double-entry ledger records. We do <strong>NOT</strong> collect telemetry, location coordinates, biometric data, social graph contacts, or track browsing habits across the web.
              </p>

              <h4 className="font-semibold text-slate-900 dark:text-white">2. Scope of Collected Data</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Identity:</strong> Email address and hashed authentication tokens via Firebase Auth.</li>
                <li><strong>Accounting Records:</strong> Accounts, journal entries, and lines created directly by your actions.</li>
                <li><strong>Preferences:</strong> Theme preference (dark/light), locale (EN/ZH), and cookie choice.</li>
              </ul>

              <h4 className="font-semibold text-slate-900 dark:text-white">3. Protection of Minors (Requirement #17 - Age Consent)</h4>
              <p>
                This bookkeeping system is strictly intended for professional practitioners, business operators, and individuals aged 18 and older (or at minimum 16+ with parental consent in jurisdictions where permitted). We do not knowingly collect or store any personal data of children.
              </p>

              <h4 className="font-semibold text-slate-900 dark:text-white">4. User Rights & Data Deletion (Requirement #20)</h4>
              <p>
                Under GDPR Article 17 and CCPA, you have the right to request full erasure of all account information and journal data at any time via Settings or by emailing{' '}
                <a href={`mailto:${BUSINESS_DETAILS.dpoEmail}`} className="text-brand-600 dark:text-brand-400 underline">
                  {BUSINESS_DETAILS.dpoEmail}
                </a>.
              </p>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Terms of Service</h3>
                <span className="text-xs text-slate-400">Version 1.0</span>
              </div>

              <h4 className="font-semibold text-slate-900 dark:text-white">1. Service Scope & Professional Disclaimer</h4>
              <p>
                e-Accountant For You provides structured software calculation utilities for double-entry bookkeeping. The system does <strong>not</strong> substitute for certified CPA statutory audits, legal counsel, or official tax preparation advice.
              </p>

              <h4 className="font-semibold text-slate-900 dark:text-white">2. Fair Terms & No Dark Patterns (Requirement #9)</h4>
              <p>
                We explicitly guarantee no coercive countdown timers, disguised advertising, deceptive pre-checked opt-ins, or obstructive cancellation friction.
              </p>

              <h4 className="font-semibold text-slate-900 dark:text-white">3. Supported Claims Only (Requirement #12)</h4>
              <p>
                All calculations strictly enforce the mathematical invariant: Total Debits equal Total Credits. We make no false or exaggerated guarantees regarding tax savings, audits, or business valuation outcomes.
              </p>

              <h4 className="font-semibold text-slate-900 dark:text-white">4. Authentic Practitioner Feedback (Requirement #11)</h4>
              <p>
                We strictly ban simulated, paid, or synthetic user reviews. All user accounts and practitioner designations in demo modes are explicitly labeled as demonstration profiles.
              </p>
            </div>
          )}

          {activeTab === 'refund' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Refund & Subscription Policy</h3>
                <span className="text-xs text-slate-400">Requirement #3 & #10</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs">
                <strong>Current Tier:</strong> Version 1.0 is currently 100% Free / Open Demonstration. No billing or credit card input is requested.
              </div>

              <h4 className="font-semibold text-slate-900 dark:text-white">1. 100% Transparency - No Hidden Fees (Requirement #10)</h4>
              <p>
                If premium cloud sync or team seats are introduced in the future:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>All prices will be listed inclusive of applicable VAT/GST prior to checkout.</li>
                <li>Zero surprise maintenance charges, onboarding surcharges, or hidden export taxes.</li>
              </ul>

              <h4 className="font-semibold text-slate-900 dark:text-white">2. 14-Day Cooling-off & Money-back Guarantee</h4>
              <p>
                Any subscription will carry an unconditional 14-day pro-rata refund upon request. Cancellations can be executed with 1 click directly inside user settings without needing to call support.
              </p>
            </div>
          )}

          {activeTab === 'cookies' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cookie & Local Storage Policy</h3>
                <span className="text-xs text-slate-400">Requirement #4</span>
              </div>
              <p>
                We use browser storage primarily for essential technical operations rather than third-party tracking.
              </p>

              <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="p-3">Key / Cookie</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Purpose</th>
                      <th className="p-3">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="p-3 font-mono">e_accountant_cookie_consent</td>
                      <td className="p-3">Strictly Necessary</td>
                      <td className="p-3">Stores your cookie consent banner choice</td>
                      <td className="p-3">1 Year</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono">e_accountant_theme</td>
                      <td className="p-3">Functional</td>
                      <td className="p-3">Persists Dark or Light theme display mode</td>
                      <td className="p-3">Persistent</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono">e_accountant_lang</td>
                      <td className="p-3">Functional</td>
                      <td className="p-3">Stores EN or ZH language selection</td>
                      <td className="p-3">Persistent</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono">e_accountant_accounts_{'{uid}'}</td>
                      <td className="p-3">Essential Cache</td>
                      <td className="p-3">Local offline store for bookkeeping chart & entries</td>
                      <td className="p-3">Until user signs out / clears data</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'business' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Entity & Operator Details</h3>
                <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">Requirement #16 (Burner Details)</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Pre-Incorporation Notice:</strong> The company details below are valid burner/staging contact points prior to corporate finalisation. These will be updated upon company incorporation registration.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-400 block mb-1">Company Trading Name</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{BUSINESS_DETAILS.tradingName}</span>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-400 block mb-1">Provisional Registration #</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{BUSINESS_DETAILS.companyNumber}</span>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 sm:col-span-2">
                  <span className="text-slate-400 block mb-1">Registered Staging Address</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{BUSINESS_DETAILS.registeredAddress}</span>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-400 block mb-1">General Support Inquiries</span>
                  <span className="font-semibold text-brand-600 dark:text-brand-400">{BUSINESS_DETAILS.supportEmail}</span>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-400 block mb-1">Data Protection Officer (DPO)</span>
                  <span className="font-semibold text-brand-600 dark:text-brand-400">{BUSINESS_DETAILS.dpoEmail}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sdks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Third-Party SDK & Dependency Audit</h3>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Requirement #8 & #19</span>
              </div>
              <p>
                We maintain an active registry of all runtime software libraries. Zero unauthorized analytics, tracking pixels, or third-party ad networks are bundled.
              </p>

              <div className="space-y-3">
                {THIRD_PARTY_SDK_AUDIT.map((sdk, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">{sdk.vendor}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold">
                        {sdk.dpaStatus}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400"><strong>Purpose:</strong> {sdk.purpose}</p>
                    <p className="text-slate-500 dark:text-slate-400"><strong>Data Processed:</strong> {sdk.dataProcessed}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
                <strong>Font & Icon Licensing (Requirement #19):</strong> All typography (Inter, JetBrains Mono) is licensed under the SIL Open Font License 1.1. Icons are licensed under ISC/MIT via Lucide. Zero proprietary unlicensed assets exist in this codebase.
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            I Understand & Accept
          </button>
        </div>
      </div>
    </div>
  );
};
