export type Selection =
  | 'None'
  | 'PreSelectSecure'
  | 'PreSelectDelete'
  | 'Secure'
  | 'Delete';

export type RecordType = 'action' | 'notice' | 'archive';

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface BreachRecord {
  id: string;
  domain: string;
  breachDate: string;
  addedDate: string;
  dataTypes: string[];
  accountsAffected: number;
  verified: boolean;
  summary: string;
  type: RecordType;
  isOpen: boolean;
  selection: Selection;
  secureChecklist: ChecklistItem[];
  deleteChecklist: ChecklistItem[];
  notesEnabled: boolean;
  notesText: string;
  notesMode: 'add' | 'edit' | 'readonly';
  archivedAt?: string;
  actionTaken?: 'secured' | 'deleted';
  monitoringNote: string;
}

export type SortColumn = 'breachDate' | 'addedDate' | 'checklist';
export type SortDirection = 'asc' | 'desc';

export interface ToastMessage {
  id: string;
  title: string;
  body: string;
}

export type SearchStatus = 'idle' | 'loading' | 'done';

export interface EmailWorkspace {
  email: string;
  records: BreachRecord[];
}

export interface PrivacyScore {
  finalScore: number;
  knowledgeScore: number;
  emailCheckerScore: number;
  knowledgeRaw: number;
  knowledgeTotal: number;
  actionsCount: number;
  status: string;
  description: string;
}

export type DashboardView = 'empty' | 'loading' | 'results' | 'archives' | 'knowledge-test';

export interface PersistedDashboard {
  workspaces: Record<string, BreachRecord[]>;
  emailOrder: string[];
  currentEmail: string | null;
  view: Exclude<DashboardView, 'loading'>;
  theme: 'light' | 'dark';
  actionSort: { column: SortColumn | null; direction: SortDirection };
  noticeSort: { column: SortColumn | null; direction: SortDirection };
}
