import { AccountType } from './account';

export type JournalEntryStatus = 'posted' | 'voided';

export interface JournalLine {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  debit: number;
  credit: number;
  lineDescription?: string;
  orderIndex: number;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  entryDate: string; // ISO date string or formatted date
  description: string;
  notes?: string;
  status: JournalEntryStatus;
  totalDebit: number;
  totalCredit: number;
  lineCount: number;
  lines?: JournalLine[];
  attachmentUrl?: string | null;
  createdAt?: unknown;
  updatedAt?: unknown;
}
