export type Language = 'en' | 'zh';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  baseCurrency: string;
  preferredLanguage: Language;
  theme: ThemeMode;
  createdAt?: unknown;
  updatedAt?: unknown;
}
