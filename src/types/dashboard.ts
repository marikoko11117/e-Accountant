export type WidgetType =
  | 'metric_income'
  | 'metric_expenses'
  | 'metric_net_income'
  | 'recent_entries'
  | 'account_balances'
  | 'monthly_summary';

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  colSpan: 1 | 2;
  order: number;
  visible: boolean;
}

export interface DashboardLayout {
  id: string;
  widgets: DashboardWidget[];
  updatedAt?: unknown;
}
