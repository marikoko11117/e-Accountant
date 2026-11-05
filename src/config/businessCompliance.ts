export const BUSINESS_DETAILS = {
  legalName: 'e-Accountant Technologies Ltd. (Burner / Pre-Incorporation)',
  tradingName: 'e-Accountant For You',
  companyNumber: 'REG-2026-TEMP-883921',
  vatTaxId: 'TAX-TEMP-992014-X',
  registeredAddress: 'Suite 404, Placeholder Innovation Hub, 100 Financial Way, City of London, EC2A 4NE, United Kingdom',
  supportEmail: 'support@e-accountant-demo.local',
  dpoEmail: 'privacy@e-accountant-demo.local',
  complianceOfficer: 'Alex Morgan, CPA / Compliance Lead',
  governingLaw: 'Laws of England & Wales / State of Delaware (Selectable upon finalisation)',
  lastUpdated: 'November 4, 2026',
  status: 'Burner / Pre-incorporation staging details. Will update with verified registration certificate.',
};

export const THIRD_PARTY_SDK_AUDIT = [
  {
    vendor: 'Google Firebase (Authentication, Firestore, Storage)',
    purpose: 'Core application database, user authentication & document attachments.',
    dataProcessed: 'Encrypted email, user UID, financial records, tenant audit metadata.',
    location: 'Configured Firebase Region (US / EU multi-region).',
    dpaStatus: 'Google Cloud Data Processing Addendum (GDPR Article 28 compliant).',
  },
  {
    vendor: 'Google Fonts (Inter, JetBrains Mono via CDN)',
    purpose: 'Typography rendering under SIL Open Font License (OFL 1.1).',
    dataProcessed: 'IP address during initial stylesheet fetch (no cookies or PII).',
    location: 'Global edge cache.',
    dpaStatus: 'Permitted font license / GDPR compliant CDN endpoint.',
  },
  {
    vendor: 'Lucide Icons',
    purpose: 'Open-source SVG iconography.',
    dataProcessed: 'None (bundled locally in compilation output, zero runtime telemetry).',
    location: 'Client-side bundle.',
    dpaStatus: 'ISC License (Permissive open source).',
  },
];
